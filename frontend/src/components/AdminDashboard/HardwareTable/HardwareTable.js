import React, { useEffect, useState } from "react";
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

const HardwareTable = () => {
  const dispatch = useDispatch();
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
  const { hardwareHeirarchy } = useSelector((state) => state.heirarchy);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  const fetchCategories = async (preferredOption = activeOption) => {
    try {
      const response = await api.get(
        `${BASE_API_URL}/admin/hardware-categories`,
        getAuthConfig()
      );
      const nextCategories = response.data || [];
      setCategories(nextCategories);
      if (nextCategories.length && !nextCategories.some((category) => category.name === preferredOption)) {
        dispatch(setActiveOption(nextCategories[0].name));
      }
    } catch (err) {
      toast.error("Failed to fetch hardware categories");
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const productsToDisplay =
    searchResults.length > 0
      ? searchResults
      : profileOptions?.products?.[activeOption];

  useEffect(() => {
    if (activeOption) fetchProducts(activeOption);
  }, [activeOption]);

  useEffect(() => {
    if (hardwareHeirarchy && hardwareHeirarchy.length > 0) {
      dispatch(setActiveOption(hardwareHeirarchy[0]));
    }
  }, [hardwareHeirarchy, dispatch]);

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
    if (!activeOption && profileData?.options?.length > 0) {
      dispatch(setActiveOption(profileData.options[0]));
    }
  }, [profileData, activeOption, dispatch]);

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
                onClick={() => dispatch(setActiveOption(category.name))}
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
                {productsToDisplay && productsToDisplay.length > 0 ? (
                  productsToDisplay.map((product, index) => {
                    const isEditing = editableProduct?._id === product._id || editableProduct?.id === product.id;

                    if (isEditing) {
                      return (
                        <tr key={product._id || product.id || index} className="hw-inline-row">
                          <td className="hw-index-cell">{index + 1}</td>
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
                        <td className="hw-index-cell">{index + 1}</td>
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
        </div>
      )}

      {/* Category Modal (Create / Edit) */}
      <MDBModal
        open={Boolean(categoryModal)}
        onClose={() => setCategoryModal(null)}
        tabIndex="-1"
      >
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>
                <i className="fas fa-layer-group me-2 text-primary"></i>
                {categoryModal?.mode === "create"
                  ? "Create Hardware Category"
                  : "Edit Hardware Category"}
              </MDBModalTitle>
              <button
                type="button"
                className="btn-close"
                onClick={() => setCategoryModal(null)}
              ></button>
            </MDBModalHeader>
            <MDBModalBody>
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small">Category Name</label>
                <MDBInput
                  placeholder="e.g. CORNER JOINERY"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((current) => ({ ...current, name: e.target.value }))
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold text-dark small">Description</label>
                <MDBInput
                  placeholder="Category description or specifications"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="mt-3">
                <MDBSwitch
                  label="Category Enabled"
                  checked={categoryForm.enabled}
                  onChange={(e) =>
                    setCategoryForm((current) => ({
                      ...current,
                      enabled: e.target.checked,
                    }))
                  }
                />
              </div>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn
                color="secondary"
                size="sm"
                onClick={() => setCategoryModal(null)}
              >
                Cancel
              </MDBBtn>
              <button
                type="button"
                className="hw-btn-add-category"
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
