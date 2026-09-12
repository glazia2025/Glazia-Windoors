import React, { useEffect, useState } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  MDBInput,
  MDBFile,
  MDBSwitch,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import { setActiveOption } from "../../../redux/selectionSlice";
import api, { BASE_API_URL } from "../../../utils/api";
import Search from "../../Search";
import ImageZoom from "../../UserDashboard/ImageZoom";
import { toast } from "react-toastify";
import "./HardwareTable.css";

const emptyHardwareItem = {
  sapCode: "",
  perticular: "",
  rate: "",
  system: "",
  moq: "",
  image: null,
};

const slugifyCategory = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const findCategoryName = (identifier, catList) => {
  if (!identifier || !catList || !catList.length) return null;
  const decoded = decodeURIComponent(identifier);
  const exact = catList.find(
    (c) => c.name.toLowerCase() === decoded.toLowerCase() || c.name === identifier
  );
  if (exact) return exact.name;
  const targetSlug = slugifyCategory(identifier);
  const matched = catList.find((c) => slugifyCategory(c.name) === targetSlug);
  return matched ? matched.name : null;
};

const HardwareTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();

  const { activeOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [editableProduct, setEditableProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(emptyHardwareItem);
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryModal, setCategoryModal] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", enabled: true });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  const selectCategory = (categoryName) => {
    dispatch(setActiveOption(categoryName));
    const slug = slugifyCategory(categoryName);
    navigate(`/dashboard/hardware/${slug}`, { replace: true });
  };

  const fetchCategories = async (preferredOption = activeOption) => {
    try {
      const response = await api.get(
        `${BASE_API_URL}/admin/hardware-categories`,
        getAuthConfig()
      );
      const nextCategories = response.data || [];
      setCategories(nextCategories);

      const urlVal = categorySlug || searchParams.get("category");
      const matchedName = findCategoryName(urlVal, nextCategories);

      if (matchedName) {
        dispatch(setActiveOption(matchedName));
        const targetSlug = slugifyCategory(matchedName);
        if (categorySlug !== targetSlug) {
          navigate(`/dashboard/hardware/${targetSlug}`, { replace: true });
        }
      } else if (nextCategories.length) {
        const defaultCat = preferredOption && nextCategories.some((c) => c.name === preferredOption)
          ? preferredOption
          : nextCategories[0].name;
        dispatch(setActiveOption(defaultCat));
        navigate(`/dashboard/hardware/${slugifyCategory(defaultCat)}`, { replace: true });
      }
    } catch (err) {
      toast.error("Failed to fetch hardware categories");
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const urlVal = categorySlug || searchParams.get("category");
    if (urlVal && categories.length) {
      const matchedName = findCategoryName(urlVal, categories);
      if (matchedName && matchedName !== activeOption) {
        dispatch(setActiveOption(matchedName));
      }
    }
  }, [categorySlug, searchParams, categories, activeOption, dispatch]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const productsToDisplay =
    searchResults.length > 0
      ? searchResults
      : profileOptions?.products?.[activeOption] || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeOption, searchQuery]);

  const totalProducts = productsToDisplay.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
  const paginatedProducts = productsToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (activeOption) fetchProducts(activeOption);
  }, [activeOption]);

  const fetchProducts = async (reqOption) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(
        `${BASE_API_URL}/admin/getHardwares?reqOption=${encodeURIComponent(
          reqOption
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileData(response.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    setProfileOptions(profileData);
  }, [profileData]);

  const handleSearch = async (e) => {
    typeof e?.preventDefault === "function" && e?.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`${BASE_API_URL}/admin/search-hardware`, {
        params: {
          sapCode: searchQuery,
          perticular: searchQuery,
          option: activeOption,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data.products || []);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const searchProduct = (value) => {
    setSearchResults([]);
    setSearchQuery(value);
  };

  const handleEditClick = (product) => {
    setIsAdding(false);
    setEditableProduct({ ...product });
  };

  const handleInputChange = (e) => {
    const { name, files, value } = e.target;

    if (name === "image" && files?.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64Image = event.target.result;
        setEditableProduct((prevState) => ({
          ...prevState,
          [name]: base64Image,
        }));
      };

      reader.readAsDataURL(file);
    } else {
      setEditableProduct((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await api.put(
        `${BASE_API_URL}/admin/edit-hardware/${activeOption}/${editableProduct._id}`,
        editableProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hardware item updated");
      fetchProducts(activeOption);
      setEditableProduct(null);
    } catch (err) {
      console.error("Error saving product", err);
      toast.error("Failed to update hardware item");
    }
  };

  const handleNewProductChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image" && files?.length > 0) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setNewProduct((current) => ({
          ...current,
          image: readerEvent.target.result,
        }));
      };
      reader.readAsDataURL(files[0]);
      return;
    }

    setNewProduct((current) => ({ ...current, [name]: value }));
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewProduct(emptyHardwareItem);
  };

  const handleAdd = async () => {
    const requiredFields = ["sapCode", "perticular", "rate", "system", "moq"];
    const hasMissingField = requiredFields.some(
      (field) => String(newProduct[field] ?? "").trim() === ""
    );

    if (hasMissingField) {
      toast.error("Please fill all required hardware fields");
      return;
    }

    try {
      setIsSavingNew(true);
      const token = localStorage.getItem("authToken");
      await api.post(
        `${BASE_API_URL}/admin/add-hardware`,
        { option: activeOption, product: newProduct },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSearchQuery("");
      setSearchResults([]);
      cancelAdd();
      await fetchProducts(activeOption);
      toast.success(`Hardware item added under ${activeOption}`);
    } catch (err) {
      console.error("Error adding hardware item", err);
      toast.error(err.response?.data?.message || "Failed to add hardware item");
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this hardware item?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await api.delete(
        `${BASE_API_URL}/admin/delete-hardware/${activeOption}/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Hardware item deleted");
      fetchProducts(activeOption);
      setProfileOptions((prevOptions) => {
        const currentProducts = prevOptions?.products?.[activeOption] || [];
        const updatedProducts = currentProducts.filter(
          (product) => (product._id || product.id) !== productId
        );
        return {
          ...prevOptions,
          products: {
            ...prevOptions.products,
            [activeOption]: updatedProducts,
          },
        };
      });
    } catch (err) {
      console.error("Error deleting product", err);
      toast.error("Failed to delete hardware item");
    }
  };

  const openCreateCategory = () => {
    setCategoryForm({ name: "", description: "", enabled: true });
    setCategoryModal({ mode: "create" });
  };

  const openEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      enabled: category.enabled !== false,
    });
    setCategoryModal({ mode: "edit", category });
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return toast.error("Category name is required");
    try {
      const oldName = categoryModal?.category?.name;
      if (categoryModal.mode === "create") {
        await api.post(
          `${BASE_API_URL}/admin/hardware-categories`,
          categoryForm,
          getAuthConfig()
        );
        toast.success("Hardware category created");
      } else {
        await api.put(
          `${BASE_API_URL}/admin/hardware-categories/${categoryModal.category._id}`,
          categoryForm,
          getAuthConfig()
        );
        if (activeOption === oldName) {
          dispatch(setActiveOption(categoryForm.name.trim().toUpperCase()));
        }
        toast.success("Hardware category updated");
      }
      setCategoryModal(null);
      await fetchCategories(
        categoryModal.mode === "edit" && activeOption === oldName
          ? categoryForm.name.trim().toUpperCase()
          : activeOption
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save hardware category");
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete hardware category "${category.name}"?`)) return;
    try {
      await api.delete(
        `${BASE_API_URL}/admin/hardware-categories/${category._id}`,
        getAuthConfig()
      );
      if (activeOption === category.name) dispatch(setActiveOption(""));
      toast.success("Hardware category deleted");
      await fetchCategories(activeOption === category.name ? "" : activeOption);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete hardware category");
    }
  };

  return (
    <div className="hw-container">
      {/* 1. Hardware Categories Section */}
      <div className="hw-categories-section">
        <div className="hw-categories-header">
          <div className="hw-header-left">
            <div className="hw-header-icon">
              <i className="fas fa-cubes"></i>
            </div>
            <div>
              <h4 className="hw-header-title">Hardware Categories</h4>
              <p className="hw-header-subtitle">
                Manage hardware fittings, accessories, and category specifications
              </p>
            </div>
          </div>
          <button
            type="button"
            className="hw-btn-add-category"
            onClick={openCreateCategory}
          >
            <i className="fas fa-plus"></i>
            <span>Add Category</span>
          </button>
        </div>

        {/* Category Chips */}
        <div className="hw-chips-wrapper">
          {categories.map((category) => {
            const isActive = activeOption === category.name;
            return (
              <div
                key={category._id}
                className={`hw-category-chip ${isActive ? "active" : ""}`}
                onClick={() => selectCategory(category.name)}
              >
                <div className="hw-chip-main">
                  <i className="fas fa-cube hw-chip-icon"></i>
                  <span className="hw-chip-name">{category.name}</span>
                  {!category.enabled && (
                    <span className="hw-chip-disabled-badge">Disabled</span>
                  )}
                </div>
                <div className="hw-chip-actions">
                  <button
                    type="button"
                    className="hw-chip-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditCategory(category);
                    }}
                    title="Edit category"
                  >
                    <i className="far fa-edit"></i>
                  </button>
                  <button
                    type="button"
                    className="hw-chip-btn btn-trash"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category);
                    }}
                    title="Delete category"
                  >
                    <i className="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Products Section Card */}
      {activeOption && (
        <div className="hw-products-card">
          <div className="hw-products-header">
            <div className="hw-products-header-left">
              <div className="hw-products-title-group">
                <div className="hw-products-icon">
                  <i className="fas fa-boxes"></i>
                </div>
                <h5 className="hw-products-title">Products</h5>
                <span className="hw-active-badge">
                  <i className="fas fa-tag me-1"></i>
                  {activeOption}
                </span>
              </div>
              <button
                type="button"
                className="hw-btn-add-item"
                onClick={() => {
                  setEditableProduct(null);
                  setIsAdding(true);
                }}
                disabled={isAdding}
              >
                <i className="fas fa-plus"></i>
                <span>Add Item</span>
              </button>
            </div>

            <div className="hw-search-wrapper">
              <Search
                searchQuery={searchQuery}
                setSearchQuery={searchProduct}
                handleSearch={handleSearch}
              />
            </div>
          </div>

          <div className="hw-table-wrapper">
            <table className="hw-table">
              <thead>
                <tr>
                  <th style={{ width: "5%", textAlign: "center" }}>S NO.</th>
                  <th style={{ width: "7%", textAlign: "center" }}>IMAGE</th>
                  <th style={{ width: "12%" }}>SAP CODE</th>
                  <th style={{ width: "14%" }}>SUB CATEGORY</th>
                  <th style={{ width: "20%" }}>PERTICULAR</th>
                  <th style={{ width: "10%" }}>RATE</th>
                  <th style={{ width: "14%" }}>SYSTEM / UNIT</th>
                  <th style={{ width: "8%" }}>MOQ</th>
                  <th style={{ width: "10%", textAlign: "center" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {/* Adding New Item Row */}
                {isAdding && (
                  <tr className="hw-inline-row">
                    <td className="hw-index-cell">
                      <span className="badge bg-primary">NEW</span>
                    </td>
                    <td>
                      <MDBFile
                        name="image"
                        size="sm"
                        onChange={handleNewProductChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="hw-input-control"
                        name="sapCode"
                        placeholder="SAP Code"
                        value={newProduct.sapCode}
                        onChange={handleNewProductChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="hw-input-control"
                        value={activeOption}
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="hw-input-control"
                        name="perticular"
                        placeholder="Description"
                        value={newProduct.perticular}
                        onChange={handleNewProductChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="hw-input-control"
                        name="rate"
                        placeholder="₹ Rate"
                        value={newProduct.rate}
                        onChange={handleNewProductChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="hw-input-control"
                        name="system"
                        placeholder="System / Unit"
                        value={newProduct.system}
                        onChange={handleNewProductChange}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="hw-input-control"
                        name="moq"
                        placeholder="MOQ"
                        value={newProduct.moq}
                        onChange={handleNewProductChange}
                        required
                      />
                    </td>
                    <td>
                      <div className="hw-actions-cell">
                        <button
                          type="button"
                          className="hw-btn-action hw-btn-save"
                          onClick={handleAdd}
                          disabled={isSavingNew}
                        >
                          <i className="fas fa-check"></i>
                          <span>{isSavingNew ? "Saving..." : "Save"}</span>
                        </button>
                        <button
                          type="button"
                          className="hw-btn-action hw-btn-cancel"
                          onClick={cancelAdd}
                          disabled={isSavingNew}
                        >
                          <i className="fas fa-times"></i>
                          <span>Cancel</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Normal / Editing Product Rows */}
                {paginatedProducts && paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                    const isEditing = editableProduct?._id === product._id || editableProduct?.id === product.id;

                    if (isEditing) {
                      return (
                        <tr key={product._id || product.id || index} className="hw-inline-row">
                          <td className="hw-index-cell">{globalIndex + 1}</td>
                          <td>
                            <MDBFile
                              name="image"
                              size="sm"
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="hw-input-control"
                              name="sapCode"
                              value={editableProduct.sapCode || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="hw-input-control"
                              name="subCategory"
                              value={editableProduct.subCategory || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="hw-input-control"
                              name="perticular"
                              value={editableProduct.perticular || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="hw-input-control"
                              name="rate"
                              value={editableProduct.rate || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="hw-input-control"
                              name="system"
                              value={editableProduct.system || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="hw-input-control"
                              name="moq"
                              value={editableProduct.moq || ""}
                              onChange={handleInputChange}
                            />
                          </td>
                          <td>
                            <div className="hw-actions-cell">
                              <button
                                type="button"
                                className="hw-btn-action hw-btn-save"
                                onClick={handleSave}
                              >
                                <i className="fas fa-check"></i>
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                className="hw-btn-action hw-btn-cancel"
                                onClick={() => setEditableProduct(null)}
                              >
                                <i className="fas fa-times"></i>
                                <span>Cancel</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={product._id || product.id || index}>
                        <td className="hw-index-cell">{globalIndex + 1}</td>
                        <td style={{ textAlign: "center" }}>
                          <ImageZoom productImage={product.image} imageWidth="40px" />
                        </td>
                        <td>
                          <span className="hw-sap-code">{product.sapCode}</span>
                        </td>
                        <td>
                          <span className="hw-sub-category">{product.subCategory}</span>
                        </td>
                        <td>
                          <span className="hw-perticular">{product.perticular}</span>
                        </td>
                        <td>
                          <span className="hw-rate-cell">₹ {product.rate}</span>
                        </td>
                        <td>
                          <span className="hw-system-badge">{product.system}</span>
                        </td>
                        <td>
                          <span className="hw-moq-badge">{product.moq}</span>
                        </td>
                        <td>
                          <div className="hw-actions-cell">
                            <button
                              type="button"
                              className="hw-btn-action hw-btn-edit"
                              onClick={() => handleEditClick(product)}
                              title="Edit item"
                            >
                              <i className="far fa-edit"></i>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="hw-btn-action hw-btn-delete"
                              onClick={() => handleDelete(product._id || product.id)}
                              title="Delete item"
                            >
                              <i className="far fa-trash-alt"></i>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  !isAdding && (
                    <tr>
                      <td colSpan={9}>
                        <div className="hw-empty-state">
                          <div className="hw-empty-icon">
                            <i className="fas fa-box-open"></i>
                          </div>
                          <h6 className="hw-empty-title">No products found</h6>
                          <p className="hw-empty-desc">
                            No hardware items found under "{activeOption}". Click "Add Item" to register one.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Hardware Table Pagination Bar */}
          {productsToDisplay.length > 0 && (
            <div className="hw-pagination-bar">
              <div className="hw-pagination-info">
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong>
                  {Math.min(currentPage * itemsPerPage, productsToDisplay.length)}
                </strong>{" "}
                of <strong>{productsToDisplay.length}</strong> products
              </div>

              <div className="hw-pagination-controls">
                <button
                  type="button"
                  className="hw-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  title="Go to previous page"
                >
                  <i className="fas fa-chevron-left"></i>
                  <span>Previous</span>
                </button>

                <div className="hw-page-indicator">
                  Page <strong>{currentPage}</strong> of <span>{totalPages}</span>
                </div>

                <button
                  type="button"
                  className="hw-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  title="Go to next page"
                >
                  <span>Next</span>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Modal (Create / Edit) */}
      <MDBModal
        open={Boolean(categoryModal)}
        onClose={() => setCategoryModal(null)}
        tabIndex="-1"
      >
        <MDBModalDialog className="glazia-modal-dialog">
          <MDBModalContent className="glazia-modal-content">
            <MDBModalHeader className="glazia-modal-header">
              <div className="glazia-modal-header-content">
                <div className="glazia-modal-icon-badge">
                  <i className="fas fa-layer-group"></i>
                </div>
                <div>
                  <MDBModalTitle className="glazia-modal-title">
                    {categoryModal?.mode === "create"
                      ? "Create Hardware Category"
                      : "Edit Hardware Category"}
                  </MDBModalTitle>
                  <p className="glazia-modal-subtitle">
                    {categoryModal?.mode === "create"
                      ? "Add a new hardware fitting category"
                      : "Update hardware category details"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="glazia-modal-close-btn"
                onClick={() => setCategoryModal(null)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </MDBModalHeader>
            <MDBModalBody className="glazia-modal-body">
              <div className="glazia-form-group">
                <label className="glazia-form-label">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="glazia-form-control"
                  placeholder="e.g. CORNER JOINERY, LOCKING PARTS..."
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((current) => ({ ...current, name: e.target.value }))
                  }
                />
              </div>

              <div className="glazia-form-group">
                <label className="glazia-form-label">Description</label>
                <textarea
                  className="glazia-form-control glazia-textarea"
                  placeholder="Category description or specifications..."
                  rows="3"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="glazia-switch-group">
                <div className="glazia-switch-info">
                  <span className="glazia-switch-title">Category Status</span>
                  <span className="glazia-switch-desc">Enable category for hardware selection</span>
                </div>
                <label className="glazia-toggle-switch">
                  <input
                    type="checkbox"
                    checked={categoryForm.enabled}
                    onChange={(e) =>
                      setCategoryForm((current) => ({
                        ...current,
                        enabled: e.target.checked,
                      }))
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </MDBModalBody>
            <MDBModalFooter className="glazia-modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setCategoryModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={saveCategory}
              >
                <i className="fas fa-save me-1"></i>
                Save Category
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

export default HardwareTable;
