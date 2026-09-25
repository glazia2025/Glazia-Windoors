import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTypography,
  MDBBtn,
  MDBInput,
  MDBIcon,
  MDBFile,
  MDBSwitch,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import api, { BASE_API_URL } from "../../../utils/api";
import ImageZoom from "../../UserDashboard/ImageZoom";
import { toast } from "react-toastify";
import "./ProfileTable.css";

const ProfileTable = () => {

  const [categories, setCategories] = useState([]);
  const [sizesMap, setSizesMap] = useState({});
  const [productsMap, setProductsMap] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSizes, setExpandedSizes] = useState({});
  const [editableProduct, setEditableProduct] = useState(null);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSizeModal, setShowEditSizeModal] = useState(false);

  // Form states for creating new items
  const [newCategory, setNewCategory] = useState({ name: "", description: "", enabled: true });
  const [newSize, setNewSize] = useState({ categoryId: "", label: "", rate: 0, enabled: true });
  const [newProduct, setNewProduct] = useState({
    sizeId: "", sapCode: "", part: "", description: "",
    degree: "", per: "", kgm: 0, length: 0, image: "", enabled: true
  });
  const [editableCategory, setEditableCategory] = useState({ id: "", name: "", description: "" });
  const [editableSize, setEditableSize] = useState({ id: "", label: "" });


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`${BASE_API_URL}/profile/categories`);
      setCategories(response.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategoryExpand = async (categoryId) => {
    const isExpanded = expandedCategories[categoryId];

    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));

    if (!isExpanded && !sizesMap[categoryId]) {
      const response = await api.get(
        `${BASE_API_URL}/profile/sizes/category/${categoryId}`
      );

      setSizesMap(prev => ({
        ...prev,
        [categoryId]: response.data
      }));
    }
  };

  const toggleSizeExpand = async (sizeId) => {
    const isExpanded = expandedSizes[sizeId];

    setExpandedSizes(prev => ({
      ...prev,
      [sizeId]: !prev[sizeId]
    }));

    if (!isExpanded && !productsMap[sizeId]) {
      const response = await api.get(
        `${BASE_API_URL}/profile/size/${sizeId}/products`
      );

      setProductsMap(prev => ({
        ...prev,
        [sizeId]: response.data
      }));
    }
  };


  // ==================== CATEGORY CRUD ====================
  const handleCreateCategory = async () => {
    try {
      await api.post(`${BASE_API_URL}/profile/category`, newCategory);
      toast.success("Category created successfully");
      setShowCategoryModal(false);
      setNewCategory({ name: "", description: "", enabled: true });
      fetchCategories();

    } catch (err) {
      console.error("Error creating category", err);
      toast.error("Failed to create category");
    }
  };

  const handleToggleCategoryEnabled = async (categoryId) => {
    try {
      await api.put(`${BASE_API_URL}/profile/category/${categoryId}/toggle-enabled`);
      toast.success("Category status updated");
      fetchCategories();

    } catch (err) {
      console.error("Error toggling category", err);
      toast.error("Failed to update category status");
    }
  };

  const openEditCategoryModal = (category) => {
    setEditableCategory({
      id: category._id,
      name: category.name || "",
      description: category.description || ""
    });
    setShowEditCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    try {
      await api.put(`${BASE_API_URL}/profile/category/${editableCategory.id}`, {
        name: editableCategory.name,
        description: editableCategory.description
      });
      toast.success("Category updated successfully");
      setShowEditCategoryModal(false);
      fetchCategories();

    } catch (err) {
      console.error("Error updating category", err);
      toast.error("Failed to update category");
    }
  };

  // ==================== SIZE CRUD ====================
  const openSizeModal = (categoryId) => {
    setNewSize({ ...newSize, categoryId });
    setShowSizeModal(true);
  };

  const handleCreateSize = async () => {
    try {
      await api.post(`${BASE_API_URL}/profile/size`, newSize);
      toast.success("Size created successfully");
      setShowSizeModal(false);
      setNewSize({ categoryId: "", label: "", rate: 0, enabled: true });
      fetchCategories();

    } catch (err) {
      console.error("Error creating size", err);
      toast.error("Failed to create size");
    }
  };

  const handleToggleSizeEnabled = async (sizeId) => {
    try {
      await api.put(`${BASE_API_URL}/profile/size/${sizeId}/toggle-enabled`);
      toast.success("Size status updated");
      fetchCategories();

    } catch (err) {
      console.error("Error toggling size", err);
      toast.error("Failed to update size status");
    }
  };

  const openEditSizeModal = (size) => {
    setEditableSize({
      id: size._id,
      label: size.label || ""
    });
    setShowEditSizeModal(true);
  };

  const handleUpdateSize = async () => {
    try {
      await api.put(`${BASE_API_URL}/profile/size/${editableSize.id}`, {
        label: editableSize.label
      });
      toast.success("Size updated successfully");
      setShowEditSizeModal(false);
      fetchCategories();

    } catch (err) {
      console.error("Error updating size", err);
      toast.error("Failed to update size");
    }
  };

  // ==================== PRODUCT CRUD ====================
  const openProductModal = (sizeId) => {
    setNewProduct({ ...newProduct, sizeId });
    setShowProductModal(true);
  };

  const handleCreateProduct = async () => {
    try {
      await api.post(`${BASE_API_URL}/profile/product`, newProduct);
      toast.success("Product created successfully");
      setShowProductModal(false);
      setNewProduct({
        sizeId: "", sapCode: "", part: "", description: "",
        degree: "", per: "", kgm: 0, length: 0, image: "", enabled: true
      });
      fetchCategories();

    } catch (err) {
      console.error("Error creating product", err);
      toast.error("Failed to create product");
    }
  };

  const handleToggleProductEnabled = async (productId) => {
    try {
      const response = await api.put(
        `${BASE_API_URL}/profile/product/${productId}/toggle-enabled`
      );

      setProductsMap(prev => {
        const updated = { ...prev };

        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(product =>
            product._id === response.data.product._id
              ? response.data.product
              : product
          );
        });

        return updated;
      });

      toast.success("Product status updated");
      // fetchCategories(); 
    } catch (err) {
      console.error("Error toggling product", err);
      toast.error("Failed to update product status");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await api.put(
        `${BASE_API_URL}/profile/product/${editableProduct._id}`,
        {
          sapCode: editableProduct.sapCode,
          part: editableProduct.part,
          description: editableProduct.description,
          degree: editableProduct.degree,
          per: editableProduct.per,
          kgm: editableProduct.kgm,
          length: editableProduct.length,
          image: editableProduct.image
        }
      );
      setProductsMap(prev => {
        const updated = { ...prev };

        Object.keys(updated).forEach(key => {
          updated[key] = updated[key].map(product =>
            product._id === response.data._id
              ? response.data
              : product
          );
        });

        return updated;
      });

      toast.success("Product updated successfully");
      setEditableProduct(null);
      // fetchCategories();

    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId, sizeId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `${BASE_API_URL}/profile/delete?module=profile&type=product&id=${productId}`
      );

      toast.success("Product deleted successfully");

      const response = await api.get(
        `${BASE_API_URL}/profile/size/${sizeId}/products`
      );

      setProductsMap(prev => ({
        ...prev,
        [sizeId]: response.data,
      }));

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };
  const handleEditClick = (product) => {
    setEditableProduct({ ...product });
  };

  const handleInputChange = (e) => {
    const { name, files } = e.target;

    if (name === "image" && files && files.length > 0) {
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

  const handleNewProductInputChange = (e) => {
    const { name, files } = e.target;

    if (name === "image" && files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64Image = event.target.result;
        setNewProduct((prevState) => ({
          ...prevState,
          [name]: base64Image,
        }));
      };

      reader.readAsDataURL(file);
    } else {
      const { value } = e.target;
      setNewProduct((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  // Render product row
  const renderProductRow = (product, index, sizeRate, sizeId) => {
    const isEditing = editableProduct?._id === product._id;

    return (
      <tr key={product._id} className={isEditing ? 'editable-row' : ''}>
        <td className="col-sno">{index + 1}</td>
        <td className="col-image">
          {isEditing ? (
            <MDBFile
              name="image"
              size="sm"
              onChange={handleInputChange}
              id="formFileSm"
              className="editable-file"
            />
          ) : product.image ? (
            <ImageZoom productImage={product.image} />
          ) : (
            "N.A"
          )}
        </td>
        <td className="col-sapcode">
          {isEditing ? (
            <MDBInput
              name="sapCode"
              value={editableProduct.sapCode || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
            />
          ) : (
            <span title={product.sapCode}>{product.sapCode || "N.A"}</span>
          )}
        </td>
        <td className="col-part">
          {isEditing ? (
            <MDBInput
              name="part"
              value={editableProduct.part || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
            />
          ) : (
            <span title={product.part}>{product.part || "N.A"}</span>
          )}
        </td>
        <td className="col-description">
          {isEditing ? (
            <MDBInput
              name="description"
              value={editableProduct.description || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
            />
          ) : (
            <span title={product.description}>{product.description || "N.A"}</span>
          )}
        </td>
        <td className="col-degree">
          {isEditing ? (
            <MDBInput
              name="degree"
              value={editableProduct.degree || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
            />
          ) : (
            <span title={product.degree}>{product.degree || "N.A"}</span>
          )}
        </td>
        <td className="col-rate">
          <span>{sizeRate || "N.A"}</span>
        </td>
        <td className="col-per">
          {isEditing ? (
            <MDBInput
              name="per"
              value={editableProduct.per || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
            />
          ) : (
            <span title={product.per}>{product.per || "N.A"}</span>
          )}
        </td>
        <td className="col-kgm">
          {isEditing ? (
            <MDBInput
              name="kgm"
              value={editableProduct.kgm || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
              type="number"
              step="0.01"
            />
          ) : (
            <span title={product.kgm}>{product.kgm || "N.A"}</span>
          )}
        </td>
        <td className="col-length">
          {isEditing ? (
            <MDBInput
              name="length"
              value={editableProduct.length || ""}
              onChange={handleInputChange}
              className="editable-input"
              size="sm"
              type="number"
            />
          ) : (
            <span title={product.length}>{product.length || "N.A"}</span>
          )}
        </td>
        <td className="col-actions">
          <div className="product-actions-container">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="product-action-btn btn-save"
                  onClick={handleUpdateProduct}
                  title="Save changes"
                >
                  <MDBIcon far icon="save" />
                </button>
                <button
                  type="button"
                  className="product-action-btn btn-cancel"
                  onClick={() => setEditableProduct(null)}
                  title="Cancel editing"
                >
                  <MDBIcon fas icon="times" />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="product-action-btn btn-edit"
                onClick={() => handleEditClick(product)}
                title="Edit product"
              >
                <MDBIcon fas icon="pen" />
              </button>
            )}
            <label
              className="glazia-toggle-switch product-toggle-switch"
              title="Toggle visibility"
            >
              <input
                type="checkbox"
                checked={product.enabled}
                onChange={() => handleToggleProductEnabled(product._id)}
              />
              <span className="toggle-slider" />
            </label>
            <button
              type="button"
              className="product-action-btn btn-delete"
              onClick={() => handleDeleteProduct(product._id, sizeId)}
              title="Delete Product"
            >
              <MDBIcon fas icon="trash" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="profile-management-container">
      {/* Profile Management Card matching the reference image */}
      <div className="profile-management-card">
        {/* Card Header */}
        <div className="profile-card-header">
          <div className="profile-header-left">
            <div className="profile-icon-box">
              <MDBIcon fas icon="users" />
            </div>
            <div>
              <h2 className="profile-card-title">Profile Management</h2>
              <p className="profile-card-subtitle">
                Manage all window system profiles and categories.
              </p>
            </div>
          </div>
          <button
            className="btn-add-category"
            onClick={() => setShowCategoryModal(true)}
          >
            <i className="fas fa-plus me-1" />
            Add Category
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading profiles...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <MDBIcon fas icon="folder-open" size="2x" className="mb-3" />
            <p>No categories found. Create one to get started.</p>
          </div>
        ) : (
          <div className="profile-table-wrapper">
            <table className="profile-main-table">
              <thead>
                <tr>
                  <th style={{ width: "36px" }}></th>
                  <th style={{ width: "44px" }}>#</th>
                  <th>NAME</th>
                  <th>DESCRIPTION</th>
                  <th style={{ width: "140px" }}>STATUS</th>
                  <th style={{ width: "230px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => {
                  const sizes = sizesMap[category._id] || [];
                  const isCategoryExpanded = expandedCategories[category._id];
                  return (
                    <React.Fragment key={category._id}>
                      <tr
                        className={`category-row ${
                          isCategoryExpanded ? "expanded" : ""
                        }`}
                        onClick={() => toggleCategoryExpand(category._id)}
                      >
                        <td className="col-chevron">
                          <i
                            className={`fas fa-chevron-right ${
                              isCategoryExpanded ? "rotated" : ""
                            }`}
                          />
                        </td>
                        <td className="col-num">{index + 1}</td>
                        <td className="col-name">
                          <div className="category-name-block">
                            <i className="fas fa-folder category-folder-icon" />
                            <div>
                              <div className="cat-title">{category.name}</div>
                              <div className="cat-desc-inline d-md-none">
                                {category.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="col-desc">
                          {category.description || `${category.name} window system`}
                        </td>
                        <td className="col-status">
                          <span
                            className={`status-pill ${
                              category.enabled ? "active" : "inactive"
                            }`}
                          >
                            <span className="status-dot" />
                            {category.enabled ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td
                          className="col-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="category-actions-group">
                            <button
                              className="action-btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCategoryModal(category);
                              }}
                              title="Edit category"
                            >
                              <i className="fas fa-pen" />
                            </button>

                            <label
                              className="glazia-toggle-switch"
                              title={
                                category.enabled
                                  ? "Deactivate category"
                                  : "Activate category"
                              }
                            >
                              <input
                                type="checkbox"
                                checked={category.enabled}
                                onChange={() =>
                                  handleToggleCategoryEnabled(category._id)
                                }
                              />
                              <span className="toggle-slider" />
                            </label>

                            <button
                              className="action-btn-add-size"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSizeModal(category._id);
                              }}
                              title="Add Size"
                            >
                              <i className="fas fa-plus me-1" />
                              Add Size
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Nested Details Row */}
                      {isCategoryExpanded && (
                        <tr className="nested-details-row">
                          <td colSpan="6">
                            <div className="nested-content-panel">
                              {sizes.length === 0 ? (
                                <div className="text-muted py-2 small">
                                  <i className="fas fa-ruler me-2" />
                                  No sizes found for this category. Click "+ Add Size" above to add one.
                                </div>
                              ) : (
                                sizes.map((size) => {
                                  const products = productsMap[size._id] || [];
                                  const isSizeExpanded = expandedSizes[size._id];
                                  return (
                                    <div
                                      key={size._id}
                                      className="nested-size-card"
                                    >
                                      <div
                                        className="nested-size-header"
                                        onClick={() => toggleSizeExpand(size._id)}
                                      >
                                        <div className="d-flex align-items-center">
                                          <i
                                            className={`fas fa-chevron-right me-2 text-muted small ${
                                              isSizeExpanded ? "fa-rotate-90" : ""
                                            }`}
                                          />
                                          <span className="size-label-text">
                                            {size.label || "Unnamed Size"}
                                          </span>
                                          <span
                                            className={`status-pill ms-2 ${
                                              size.enabled ? "active" : "inactive"
                                            }`}
                                            style={{ padding: "2px 10px", fontSize: "11px" }}
                                          >
                                            <span className="status-dot" />
                                            {size.enabled ? "Active" : "Inactive"}
                                          </span>
                                          {size.rate && (
                                            <span className="size-meta-badge">
                                              Rate: ₹{size.rate}
                                            </span>
                                          )}
                                          <span className="size-meta-badge">
                                            ({products.length} products)
                                          </span>
                                        </div>

                                        <div
                                          className="d-flex align-items-center gap-2"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            className="action-btn-edit"
                                            onClick={() => openEditSizeModal(size)}
                                            title="Edit size"
                                          >
                                            <i className="fas fa-pen" />
                                          </button>

                                          <label
                                            className="glazia-toggle-switch"
                                            title="Toggle size active"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={size.enabled}
                                              onChange={() =>
                                                handleToggleSizeEnabled(size._id)
                                              }
                                            />
                                            <span className="toggle-slider" />
                                          </label>

                                          <button
                                            className="action-btn-add-size"
                                            onClick={() => openProductModal(size._id)}
                                          >
                                            <i className="fas fa-plus me-1" />
                                            Add Product
                                          </button>
                                        </div>
                                      </div>

                                      {isSizeExpanded && (
                                        <div className="nested-products-table-wrapper">
                                          {products.length === 0 ? (
                                            <div className="text-muted small py-2">
                                              No products found for this size.
                                            </div>
                                          ) : (
                                            <div className="table-responsive" style={{ maxHeight: "380px" }}>
                                              <table className="table table-bordered table-sm profile-table">
                                                <thead>
                                                  <tr>
                                                    <th className="col-sno">S No.</th>
                                                    <th className="col-image">Image</th>
                                                    <th className="col-sapcode">SAP Code</th>
                                                    <th className="col-part">Part</th>
                                                    <th className="col-description">Description</th>
                                                    <th className="col-degree">90°/45°</th>
                                                    <th className="col-rate">Rate</th>
                                                    <th className="col-per">Per</th>
                                                    <th className="col-kgm">Kg/m</th>
                                                    <th className="col-length">Length</th>
                                                    <th className="col-actions">Actions</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {products.map((product, pIndex) =>
                                                    renderProductRow(
                                                      product,
                                                      pIndex,
                                                      size.rate,
                                                      size._id
                                                    )
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <MDBModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} tabIndex="-1">
        <MDBModalDialog className="glazia-modal-dialog">
          <MDBModalContent className="glazia-modal-content">
            <MDBModalHeader className="glazia-modal-header">
              <div className="glazia-modal-header-content">
                <div className="glazia-modal-icon-badge">
                  <i className="fas fa-folder-plus"></i>
                </div>
                <div>
                  <MDBModalTitle className="glazia-modal-title">Create New Category</MDBModalTitle>
                  <p className="glazia-modal-subtitle">Add a new profile system category</p>
                </div>
              </div>
              <button
                type="button"
                className="glazia-modal-close-btn"
                onClick={() => setShowCategoryModal(false)}
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
                  placeholder="e.g. Casement, Sliding, Railings..."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>

              <div className="glazia-form-group">
                <label className="glazia-form-label">Description</label>
                <textarea
                  className="glazia-form-control glazia-textarea"
                  placeholder="Brief description of this window/door category..."
                  rows="3"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>

              <div className="glazia-switch-group">
                <div className="glazia-switch-info">
                  <span className="glazia-switch-title">Category Status</span>
                  <span className="glazia-switch-desc">Enable category for selection in quotations</span>
                </div>
                <label className="glazia-toggle-switch">
                  <input
                    type="checkbox"
                    checked={newCategory.enabled}
                    onChange={(e) => setNewCategory({ ...newCategory, enabled: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </MDBModalBody>
            <MDBModalFooter className="glazia-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-modal-submit" onClick={handleCreateCategory}>
                <i className="fas fa-plus me-1"></i> Create Category
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Edit Category Modal */}
      <MDBModal open={showEditCategoryModal} onClose={() => setShowEditCategoryModal(false)} tabIndex="-1">
        <MDBModalDialog className="glazia-modal-dialog">
          <MDBModalContent className="glazia-modal-content">
            <MDBModalHeader className="glazia-modal-header">
              <div className="glazia-modal-header-content">
                <div className="glazia-modal-icon-badge navy-badge">
                  <i className="fas fa-edit"></i>
                </div>
                <div>
                  <MDBModalTitle className="glazia-modal-title">Edit Category</MDBModalTitle>
                  <p className="glazia-modal-subtitle">Update profile category information</p>
                </div>
              </div>
              <button
                type="button"
                className="glazia-modal-close-btn"
                onClick={() => setShowEditCategoryModal(false)}
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
                  value={editableCategory.name}
                  onChange={(e) => setEditableCategory({ ...editableCategory, name: e.target.value })}
                />
              </div>

              <div className="glazia-form-group">
                <label className="glazia-form-label">Description</label>
                <textarea
                  className="glazia-form-control glazia-textarea"
                  rows="3"
                  value={editableCategory.description}
                  onChange={(e) => setEditableCategory({ ...editableCategory, description: e.target.value })}
                />
              </div>
            </MDBModalBody>
            <MDBModalFooter className="glazia-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowEditCategoryModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-modal-submit navy" onClick={handleUpdateCategory}>
                <i className="fas fa-save me-1"></i> Save Changes
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Create Size Modal */}
      <MDBModal open={showSizeModal} onClose={() => setShowSizeModal(false)} tabIndex="-1">
        <MDBModalDialog className="glazia-modal-dialog">
          <MDBModalContent className="glazia-modal-content">
            <MDBModalHeader className="glazia-modal-header">
              <div className="glazia-modal-header-content">
                <div className="glazia-modal-icon-badge">
                  <i className="fas fa-ruler-combined"></i>
                </div>
                <div>
                  <MDBModalTitle className="glazia-modal-title">Create New Size</MDBModalTitle>
                  <p className="glazia-modal-subtitle">Add a size series to the category</p>
                </div>
              </div>
              <button
                type="button"
                className="glazia-modal-close-btn"
                onClick={() => setShowSizeModal(false)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </MDBModalHeader>
            <MDBModalBody className="glazia-modal-body">
              <div className="glazia-form-group">
                <label className="glazia-form-label">
                  Size Label <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="glazia-form-control"
                  placeholder="e.g. 1.2 mm, 1.4 mm, Eco Lite..."
                  value={newSize.label}
                  onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
                />
              </div>
              <div className="glazia-form-group">
                <label className="glazia-form-label">Rate (₹)</label>
                <input
                  type="number"
                  className="glazia-form-control"
                  placeholder="0.00"
                  value={newSize.rate}
                  onChange={(e) => setNewSize({ ...newSize, rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="glazia-switch-group">
                <div className="glazia-switch-info">
                  <span className="glazia-switch-title">Size Status</span>
                  <span className="glazia-switch-desc">Enable size series for selection</span>
                </div>
                <label className="glazia-toggle-switch">
                  <input
                    type="checkbox"
                    checked={newSize.enabled}
                    onChange={(e) => setNewSize({ ...newSize, enabled: e.target.checked })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </MDBModalBody>
            <MDBModalFooter className="glazia-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowSizeModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-modal-submit" onClick={handleCreateSize}>
                <i className="fas fa-plus me-1"></i> Create Size
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Edit Size Modal */}
      <MDBModal open={showEditSizeModal} onClose={() => setShowEditSizeModal(false)} tabIndex="-1">
        <MDBModalDialog className="glazia-modal-dialog">
          <MDBModalContent className="glazia-modal-content">
            <MDBModalHeader className="glazia-modal-header">
              <div className="glazia-modal-header-content">
                <div className="glazia-modal-icon-badge navy-badge">
                  <i className="fas fa-edit"></i>
                </div>
                <div>
                  <MDBModalTitle className="glazia-modal-title">Edit Size</MDBModalTitle>
                  <p className="glazia-modal-subtitle">Update size series label</p>
                </div>
              </div>
              <button
                type="button"
                className="glazia-modal-close-btn"
                onClick={() => setShowEditSizeModal(false)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </MDBModalHeader>
            <MDBModalBody className="glazia-modal-body">
              <div className="glazia-form-group">
                <label className="glazia-form-label">
                  Size Label <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="glazia-form-control"
                  value={editableSize.label}
                  onChange={(e) => setEditableSize({ ...editableSize, label: e.target.value })}
                />
              </div>
            </MDBModalBody>
            <MDBModalFooter className="glazia-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowEditSizeModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-modal-submit navy" onClick={handleUpdateSize}>
                <i className="fas fa-save me-1"></i> Save Changes
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Create Product Modal */}
      <MDBModal open={showProductModal} onClose={() => setShowProductModal(false)} tabIndex="-1">
        <MDBModalDialog className="glazia-modal-dialog modal-lg-custom">
          <MDBModalContent className="glazia-modal-content">
            <MDBModalHeader className="glazia-modal-header">
              <div className="glazia-modal-header-content">
                <div className="glazia-modal-icon-badge">
                  <i className="fas fa-box-open"></i>
                </div>
                <div>
                  <MDBModalTitle className="glazia-modal-title">Create New Product</MDBModalTitle>
                  <p className="glazia-modal-subtitle">Add a profile item to this size series</p>
                </div>
              </div>
              <button
                type="button"
                className="glazia-modal-close-btn"
                onClick={() => setShowProductModal(false)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </MDBModalHeader>
            <MDBModalBody className="glazia-modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">
                      SAP Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="glazia-form-control"
                      placeholder="e.g. SAP10293"
                      value={newProduct.sapCode}
                      onChange={(e) => setNewProduct({ ...newProduct, sapCode: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Part Name</label>
                    <input
                      type="text"
                      className="glazia-form-control"
                      placeholder="e.g. Outer Frame"
                      value={newProduct.part}
                      onChange={(e) => setNewProduct({ ...newProduct, part: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Description</label>
                    <input
                      type="text"
                      className="glazia-form-control"
                      placeholder="Enter profile description..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Degree (90° / 45°)</label>
                    <input
                      type="text"
                      className="glazia-form-control"
                      placeholder="e.g. 90°"
                      value={newProduct.degree}
                      onChange={(e) => setNewProduct({ ...newProduct, degree: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Per Unit</label>
                    <input
                      type="text"
                      className="glazia-form-control"
                      placeholder="e.g. Mtr / Pc"
                      value={newProduct.per}
                      onChange={(e) => setNewProduct({ ...newProduct, per: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Kg/m Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      className="glazia-form-control"
                      placeholder="0.00"
                      value={newProduct.kgm}
                      onChange={(e) => setNewProduct({ ...newProduct, kgm: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Standard Length (mm)</label>
                    <input
                      type="number"
                      className="glazia-form-control"
                      placeholder="0"
                      value={newProduct.length}
                      onChange={(e) => setNewProduct({ ...newProduct, length: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="glazia-form-group">
                    <label className="glazia-form-label">Product Image</label>
                    <input
                      type="file"
                      className="glazia-form-control"
                      name="image"
                      accept="image/*"
                      onChange={handleNewProductInputChange}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="glazia-switch-group">
                    <div className="glazia-switch-info">
                      <span className="glazia-switch-title">Product Status</span>
                      <span className="glazia-switch-desc">Enable or disable product item in size series</span>
                    </div>
                    <label className="glazia-toggle-switch">
                      <input
                        type="checkbox"
                        checked={newProduct.enabled}
                        onChange={(e) => setNewProduct({ ...newProduct, enabled: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </MDBModalBody>
            <MDBModalFooter className="glazia-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowProductModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-modal-submit" onClick={handleCreateProduct}>
                <i className="fas fa-plus me-1"></i> Create Product
              </button>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

export default ProfileTable;
