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
      await api.put(`${BASE_API_URL}/profile/product/${productId}/toggle-enabled`);
      toast.success("Product status updated");
      fetchCategories();

    } catch (err) {
      console.error("Error toggling product", err);
      toast.error("Failed to update product status");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await api.put(`${BASE_API_URL}/profile/product/${editableProduct._id}`, {
        sapCode: editableProduct.sapCode,
        part: editableProduct.part,
        description: editableProduct.description,
        degree: editableProduct.degree,
        per: editableProduct.per,
        kgm: editableProduct.kgm,
        length: editableProduct.length,
        image: editableProduct.image
      });
      toast.success("Product updated successfully");
      setEditableProduct(null);
      fetchCategories();

    } catch (err) {
      console.error("Error updating product", err);
      toast.error("Failed to update product");
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
  const renderProductRow = (product, index, sizeRate) => {
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
          <div className="actions-container">
            {isEditing ? (
              <>
                <MDBBtn
                  color="success"
                  size="sm"
                  className="action-btn"
                  onClick={handleUpdateProduct}
                  title="Save changes"
                >
                  <MDBIcon far icon="save" />
                </MDBBtn>
                <MDBBtn
                  color="secondary"
                  size="sm"
                  className="action-btn"
                  onClick={() => setEditableProduct(null)}
                  title="Cancel editing"
                >
                  <MDBIcon fas icon="times" />
                </MDBBtn>
              </>
            ) : (
              <MDBBtn
                color="warning"
                size="sm"
                className="action-btn"
                onClick={() => handleEditClick(product)}
                title="Edit product"
              >
                <MDBIcon fas icon="pen" />
              </MDBBtn>
            )}
            <MDBSwitch
              checked={product.enabled}
              onChange={() => handleToggleProductEnabled(product._id)}
              className="visibility-switch"
              title="Toggle visibility"
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="profile-management">
      {/* Header with Add Category Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <MDBTypography tag="h4" className="mb-0">
          <MDBIcon fas icon="layer-group" className="me-2" />
          Profile Management
        </MDBTypography>
        <MDBBtn color="primary" onClick={() => setShowCategoryModal(true)}>
          <MDBIcon fas icon="plus" className="me-2" />
          Add Category
        </MDBBtn>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-5">
          <MDBIcon fas icon="folder-open" size="3x" className="text-muted mb-3" />
          <p className="text-muted">No categories found. Create one to get started.</p>
        </div>
      ) : (
        <div className="categories-container">
          {
            categories.map((category) => {
              const sizes = sizesMap[category._id] || [];
              const isCategoryExpanded = expandedCategories[category._id];
              return (
                <MDBCard key={category._id} className="mb-3 category-card">
                  {/* Category Header */}
                  <div
                    className={`category-header p-3 d-flex justify-content-between align-items-center ${!category.enabled ? 'disabled-item' : ''}`}
                    style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                  >
                    <div
                      className="d-flex align-items-center flex-grow-1"
                      onClick={() => toggleCategoryExpand(category._id)}
                    >
                      <MDBIcon
                        fas
                        icon={isCategoryExpanded ? "chevron-down" : "chevron-right"}
                        className="me-3"
                      />
                      <div>
                        <MDBTypography tag="h5" className="mb-0 d-flex align-items-center">
                          <MDBIcon fas icon="folder" className="me-2 text-warning" />
                          {category.name}
                          <span className={`ms-2 badge ${category.enabled ? 'bg-success' : 'bg-secondary'}`}>
                            {category.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </MDBTypography>
                        {category.description && (
                          <small className="text-muted">{category.description}</small>
                        )}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <MDBBtn
                        color="warning"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCategoryModal(category);
                        }}
                        title="Edit category"
                      >
                        <MDBIcon fas icon="pen" />
                      </MDBBtn>
                      <MDBSwitch
                        checked={category.enabled}
                        onChange={() => handleToggleCategoryEnabled(category._id)}
                        id={`cat-switch-${category._id}`}
                        title="Toggle category"
                      />
                      <MDBBtn
                        color="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSizeModal(category._id);
                        }}
                        title="Add Size"
                      >
                        <MDBIcon fas icon="plus" className="me-1" />
                        Add Size
                      </MDBBtn>
                    </div>
                  </div>
                  {/* Sizes Container (Collapsible) */}
                  {isCategoryExpanded && (
                    <MDBCardBody className="p-0">
                      {sizes.length === 0 ? (
                        <div className="text-center py-3 text-muted">
                          <MDBIcon fas icon="ruler" className="me-2" />
                          No sizes found for this category
                        </div>
                      ) : (
                        sizes.map((size) => {
                          const products = productsMap[size._id] || [];
                          const isSizeExpanded = expandedSizes[size._id];
                          return (
                            <div key={size._id} className="size-block ms-4 border-start">
                              {/* Size Header */}
                              <div
                                className={`size-header p-2 d-flex justify-content-between align-items-center ${!size.enabled ? 'disabled-item' : ''}`}
                                style={{ cursor: 'pointer', backgroundColor: '#f1f3f5' }}
                              >
                                <div
                                  className="d-flex align-items-center flex-grow-1"
                                  onClick={() => toggleSizeExpand(size._id)}
                                >
                                  <MDBIcon
                                    fas
                                    icon={isSizeExpanded ? "chevron-down" : "chevron-right"}
                                    className="me-2"
                                  />
                                  <div>
                                    <span className="fw-bold">
                                      <MDBIcon fas icon="ruler" className="me-2 text-info" />
                                      {size.label || 'Unnamed Size'}
                                    </span>
                                    <span className={`ms-2 badge ${size.enabled ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                                      {size.enabled ? 'Active' : 'Inactive'}
                                    </span>
                                    {size.rate && (
                                      <span className="ms-2 text-muted small">
                                        Rate: ₹{size.rate}
                                      </span>
                                    )}
                                    <span className="ms-2 text-muted small">
                                      ({products.length} products)
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <MDBBtn
                                    color="warning"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditSizeModal(size);
                                    }}
                                    title="Edit size"
                                  >
                                    <MDBIcon fas icon="pen" />
                                  </MDBBtn>
                                  <MDBSwitch
                                    checked={size.enabled}
                                    onChange={() => handleToggleSizeEnabled(size._id)}
                                    id={`size-switch-${size._id}`}
                                    title="Toggle size"
                                  />
                                  <MDBBtn
                                    color="info"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openProductModal(size._id);
                                    }}
                                    title="Add Product"
                                  >
                                    <MDBIcon fas icon="plus" className="me-1" />
                                    Add Product
                                  </MDBBtn>
                                </div>
                              </div>
                              {/* Products Table (Collapsible) */}
                              {isSizeExpanded && (
                                <div className="products-container ms-4 p-2">
                                  {products.length === 0 ? (
                                    <div className="text-center py-2 text-muted">
                                      <MDBIcon fas icon="box-open" className="me-2" />
                                      No products found for this size
                                    </div>
                                  ) : (
                                    <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                      <table className="table table-bordered profile-table table-sm">
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
                                          {products.map((product, index) =>
                                            renderProductRow(product, index, size.rate)
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
                    </MDBCardBody>
                  )}
                </MDBCard>
              );
            })}
        </div>
      )}

      {/* Create Category Modal */}
      <MDBModal open={showCategoryModal} onClose={() => setShowCategoryModal(false)} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Create New Category</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => setShowCategoryModal(false)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Category Name"
                className="mb-3"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <MDBInput
                label="Description"
                className="mb-3"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
              <MDBSwitch
                label="Enabled"
                checked={newCategory.enabled}
                onChange={(e) => setNewCategory({ ...newCategory, enabled: e.target.checked })}
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowCategoryModal(false)}>Cancel</MDBBtn>
              <MDBBtn color="primary" onClick={handleCreateCategory}>Create Category</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Edit Category Modal */}
      <MDBModal open={showEditCategoryModal} onClose={() => setShowEditCategoryModal(false)} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Edit Category</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => setShowEditCategoryModal(false)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Category Name"
                className="mb-3"
                value={editableCategory.name}
                onChange={(e) => setEditableCategory({ ...editableCategory, name: e.target.value })}
              />
              <MDBInput
                label="Description"
                className="mb-3"
                value={editableCategory.description}
                onChange={(e) => setEditableCategory({ ...editableCategory, description: e.target.value })}
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowEditCategoryModal(false)}>Cancel</MDBBtn>
              <MDBBtn color="primary" onClick={handleUpdateCategory}>Save Changes</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Create Size Modal */}
      <MDBModal open={showSizeModal} onClose={() => setShowSizeModal(false)} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Create New Size</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => setShowSizeModal(false)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Size Label"
                className="mb-3"
                value={newSize.label}
                onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
              />
              <MDBInput
                label="Rate"
                type="number"
                className="mb-3"
                value={newSize.rate}
                onChange={(e) => setNewSize({ ...newSize, rate: parseFloat(e.target.value) || 0 })}
              />
              <MDBSwitch
                label="Enabled"
                checked={newSize.enabled}
                onChange={(e) => setNewSize({ ...newSize, enabled: e.target.checked })}
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowSizeModal(false)}>Cancel</MDBBtn>
              <MDBBtn color="primary" onClick={handleCreateSize}>Create Size</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Edit Size Modal */}
      <MDBModal open={showEditSizeModal} onClose={() => setShowEditSizeModal(false)} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Edit Size</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => setShowEditSizeModal(false)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <MDBInput
                label="Size Label"
                className="mb-3"
                value={editableSize.label}
                onChange={(e) => setEditableSize({ ...editableSize, label: e.target.value })}
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowEditSizeModal(false)}>Cancel</MDBBtn>
              <MDBBtn color="primary" onClick={handleUpdateSize}>Save Changes</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* Create Product Modal */}
      <MDBModal open={showProductModal} onClose={() => setShowProductModal(false)} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Create New Product</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => setShowProductModal(false)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <MDBInput
                    label="SAP Code"
                    value={newProduct.sapCode}
                    onChange={(e) => setNewProduct({ ...newProduct, sapCode: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <MDBInput
                    label="Part"
                    value={newProduct.part}
                    onChange={(e) => setNewProduct({ ...newProduct, part: e.target.value })}
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <MDBInput
                    label="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <MDBInput
                    label="Degree (90°/45°)"
                    value={newProduct.degree}
                    onChange={(e) => setNewProduct({ ...newProduct, degree: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <MDBInput
                    label="Per"
                    value={newProduct.per}
                    onChange={(e) => setNewProduct({ ...newProduct, per: e.target.value })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <MDBInput
                    label="Kg/m"
                    type="number"
                    step="0.01"
                    value={newProduct.kgm}
                    onChange={(e) => setNewProduct({ ...newProduct, kgm: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <MDBInput
                    label="Length"
                    type="number"
                    value={newProduct.length}
                    onChange={(e) => setNewProduct({ ...newProduct, length: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <MDBFile
                    label="Product Image"
                    name="image"
                    onChange={handleNewProductInputChange}
                  />
                </div>
                <div className="col-md-12">
                  <MDBSwitch
                    label="Enabled"
                    checked={newProduct.enabled}
                    onChange={(e) => setNewProduct({ ...newProduct, enabled: e.target.checked })}
                  />
                </div>
              </div>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" onClick={() => setShowProductModal(false)}>Cancel</MDBBtn>
              <MDBBtn color="primary" onClick={handleCreateProduct}>Create Product</MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

export default ProfileTable;
