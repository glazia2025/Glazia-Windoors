import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBBtn,
  MDBInput,
  MDBFile,
  MDBIcon,
  MDBSwitch,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import { setActiveOption } from "../../../redux/selectionSlice";
import api, { BASE_API_URL } from "../../../utils/api";
import Search from "../../Search";
import ImageZoom from "../../UserDashboard/ImageZoom";
import { toast } from "react-toastify";

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
    dispatch(setActiveOption(hardwareHeirarchy[0]));
  }, [hardwareHeirarchy]);

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
      setSearchResults(response.data.products);
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
    const { name, files } = e.target;

    if (name === "image" && files.length > 0) {
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
      const { value } = e.target;
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
      fetchProducts(activeOption); // Refresh product list
      setEditableProduct(null); // Exit edit mode
    } catch (err) {
      console.error("Error saving product", err);
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
      fetchProducts(activeOption);
      // Update state after deletion
      setProfileOptions((prevOptions) => {
        const updatedProducts = prevOptions.products[activeOption].filter(
          (product) => product.id !== productId
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
    }
  };

  const openCreateCategory = () => {
    setCategoryForm({ name: "", description: "", enabled: true });
    setCategoryModal({ mode: "create" });
  };

  const openEditCategory = (category) => {
    setCategoryForm({ name: category.name, description: category.description || "", enabled: category.enabled !== false });
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
        if (activeOption === oldName) dispatch(setActiveOption(categoryForm.name.trim().toUpperCase()));
        toast.success("Hardware category updated");
      }
      setCategoryModal(null);
      await fetchCategories(categoryModal.mode === "edit" && activeOption === oldName
        ? categoryForm.name.trim().toUpperCase()
        : activeOption);
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
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <MDBTypography tag="h4" className="mb-0">Hardware Categories</MDBTypography>
        <MDBBtn size="sm" onClick={openCreateCategory}><MDBIcon fas icon="plus" className="me-2" />Add Category</MDBBtn>
      </div>
      <MDBTabs className="mb-4 d-flex align-items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <MDBTabsItem key={category._id} className="d-flex align-items-center">
            <MDBTabsLink
              className="rounded-2"
              active={activeOption === category.name}
              onClick={() => dispatch(setActiveOption(category.name))}
            >
              {category.name}{!category.enabled && " (Disabled)"}
            </MDBTabsLink>
            <MDBBtn color="link" size="sm" className="px-2" onClick={() => openEditCategory(category)} title="Edit category"><MDBIcon fas icon="pen" /></MDBBtn>
            <MDBBtn color="link" size="sm" className="px-2 text-danger" onClick={() => deleteCategory(category)} title="Delete category"><MDBIcon fas icon="trash" /></MDBBtn>
          </MDBTabsItem>
        ))}
      </MDBTabs>
      {/* <hr /> */}
      {activeOption && (
        <MDBCard className="mt-4">
          <MDBCardBody>
            <div
              className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white p-3"
              style={{ top: "0", zIndex: 1 }}
            >
              <div className="d-flex align-items-center">
                <MDBTypography
                  tag="h4"
                  className="mb-0"
                  style={{ marginRight: "20px" }}
                >
                  Products
                </MDBTypography>
                <MDBBtn
                  size="sm"
                  onClick={() => {
                    setEditableProduct(null);
                    setIsAdding(true);
                  }}
                  disabled={isAdding}
                >
                  Add Item
                </MDBBtn>
              </div>
              <Search
                searchQuery={searchQuery}
                setSearchQuery={searchProduct}
                handleSearch={handleSearch}
              />
            </div>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Image</th>
                    <th>SAP Code</th>
                    <th>Sub Category</th>
                    <th>Perticular</th>
                    <th>Rate</th>
                    <th>System / Unit</th>
                    <th>MOQ</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr>
                      <td>New</td>
                      <td>
                        <MDBFile
                          name="image"
                          size="sm"
                          onChange={handleNewProductChange}
                        />
                      </td>
                      <td>
                        <MDBInput
                          name="sapCode"
                          value={newProduct.sapCode}
                          onChange={handleNewProductChange}
                          required
                        />
                      </td>
                      <td>
                        <MDBInput value={activeOption} disabled />
                      </td>
                      <td>
                        <MDBInput
                          name="perticular"
                          value={newProduct.perticular}
                          onChange={handleNewProductChange}
                          required
                        />
                      </td>
                      <td>
                        <MDBInput
                          name="rate"
                          type="number"
                          min="0"
                          value={newProduct.rate}
                          onChange={handleNewProductChange}
                          required
                        />
                      </td>
                      <td>
                        <MDBInput
                          name="system"
                          value={newProduct.system}
                          onChange={handleNewProductChange}
                          required
                        />
                      </td>
                      <td>
                        <MDBInput
                          name="moq"
                          value={newProduct.moq}
                          onChange={handleNewProductChange}
                          required
                        />
                      </td>
                      <td>
                        <div className="d-flex">
                          <MDBBtn
                            color="success"
                            size="sm"
                            className="m-1"
                            onClick={handleAdd}
                            disabled={isSavingNew}
                          >
                            {isSavingNew ? "Saving..." : "Save"}
                          </MDBBtn>
                          <MDBBtn
                            color="secondary"
                            size="sm"
                            className="m-1"
                            onClick={cancelAdd}
                            disabled={isSavingNew}
                          >
                            Cancel
                          </MDBBtn>
                        </div>
                      </td>
                    </tr>
                  )}
                  {productsToDisplay?.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBFile
                            name="image"
                            size="sm"
                            onChange={handleInputChange}
                            id="formFileSm"
                          />
                        ) : (
                          <ImageZoom productImage={product.image} />
                        )}
                      </td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBInput
                            name="sapCode"
                            value={editableProduct.sapCode}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.sapCode
                        )}
                      </td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBInput
                            name="subCategory"
                            value={editableProduct.subCategory}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.subCategory
                        )}
                      </td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBInput
                            name="perticular"
                            value={editableProduct.perticular}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.perticular
                        )}
                      </td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBInput
                            name="rate"
                            value={editableProduct.rate}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.rate
                        )}
                      </td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBInput
                            name="system"
                            value={editableProduct.system}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.system
                        )}
                      </td>
                      <td>
                        {editableProduct?.id === product.id ? (
                          <MDBInput
                            name="moq"
                            value={editableProduct.moq}
                            onChange={handleInputChange}
                          />
                        ) : (
                          product.moq
                        )}
                      </td>
                      <td className="d-flex">
                        {editableProduct?.id === product.id ? (
                          <>
                            <MDBBtn
                              color="success"
                              size="sm"
                              className="m-1"
                              onClick={handleSave}
                            >
                              Save
                            </MDBBtn>
                            <MDBBtn
                              color="secondary"
                              size="sm"
                              className="m-1"
                              onClick={() => setEditableProduct(null)}
                            >
                              Cancel
                            </MDBBtn>
                          </>
                        ) : (
                          <>
                            <MDBBtn
                              color="warning"
                              size="sm"
                              className="m-1"
                              onClick={() => handleEditClick(product)}
                            >
                              Edit
                            </MDBBtn>
                            <MDBBtn
                              color="danger"
                              size="sm"
                              className="m-1"
                              onClick={() => handleDelete(product._id)}
                            >
                              Delete
                            </MDBBtn>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MDBCardBody>
        </MDBCard>
      )}
      <MDBModal open={Boolean(categoryModal)} onClose={() => setCategoryModal(null)} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{categoryModal?.mode === "create" ? "Create Hardware Category" : "Edit Hardware Category"}</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => setCategoryModal(null)} />
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput label="Category Name" className="mb-3" value={categoryForm.name} onChange={(e) => setCategoryForm((current) => ({ ...current, name: e.target.value }))} />
              <MDBInput label="Description" className="mb-3" value={categoryForm.description} onChange={(e) => setCategoryForm((current) => ({ ...current, description: e.target.value }))} />
              <MDBSwitch label="Enabled" checked={categoryForm.enabled} onChange={(e) => setCategoryForm((current) => ({ ...current, enabled: e.target.checked }))} />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setCategoryModal(null)}>Cancel</MDBBtn>
              <MDBBtn onClick={saveCategory}>Save</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
};

export default HardwareTable;
