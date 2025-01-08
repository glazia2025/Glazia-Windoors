import React, { useEffect, useState } from 'react';
import {
  MDBContainer, MDBRow, MDBCol, MDBBtn, MDBInput, MDBCard, MDBCardBody, MDBCardHeader, MDBFile
} from 'mdb-react-ui-kit';
import './AdminForm.css';
import axios from 'axios';

const AdminForm = () => {
  const [profileOptions, setProfileOptions] = useState({
    Casement: {
      options: ["40mm", "50mm", "55mm", "27mm"],
      products: {
        "40mm": [
          {
            id: 1,
            sapCode: "SAP001",
            description: "Inward Door Sash",
            rate: 300,
            per: "Unit",
            kgm: 2.5,
            length: "3m",
            image: "/Assets/Images/product_image.jpeg",
          },
        ],
      },
    },
  });

  const [mainOption, setMainOption] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    sapCode: "",
    description: "",
    rate: "",
    per: "",
    kgm: "",
    length: "",
    image: null,  // Change to null initially for image file
  });

  useEffect(() => {
    const fetchProducts = async () => {
        const token = localStorage.getItem('authToken'); 
        try {
            const response = await axios.get('http://localhost:5000/api/admin/getProducts', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }); // Backend route
              console.log("response.categories", response)
              setProfileOptions(response.data.categories);
        } catch (err) {
            // setError('Failed to fetch products');
            // setLoading(false);
        }
    };

    fetchProducts();
  }, []);

  const handleMainOptionChange = (option) => {
    setMainOption(option);
    setSelectedCategory("");
    setSelectedSubCategory("");
    setProductDetails(null);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
    setProductDetails(null);
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
    const products = profileOptions[selectedCategory]?.products[e.target.value];
    setProductDetails(products);
  };

  const addCategory = () => {
    if (newCategory && !profileOptions[newCategory]) {
      setProfileOptions({
        ...profileOptions,
        [newCategory]: { options: [], products: {} },
      });
      setNewCategory("");
    }
  };

  const addSubCategory = () => {
    if (newSubCategory && selectedCategory) {
      const updatedCategory = { ...profileOptions[selectedCategory] };
      updatedCategory.options.push(newSubCategory);
      updatedCategory.products[newSubCategory] = [];
      setProfileOptions({
        ...profileOptions,
        [selectedCategory]: updatedCategory,
      });
      setNewSubCategory("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the base64 string of the image to the state
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);  // Convert file to base64 string
    }
  };
  
  
  const addProduct = async () => {
    if (selectedCategory && selectedSubCategory) {
      const productData = {
        category: selectedCategory,
        option: selectedSubCategory,
        product: {
          id: Date.now(),
          sapCode: newProduct.sapCode,
          description: newProduct.description,
          rate: newProduct.rate,
          per: newProduct.per,
          kgm: newProduct.kgm,
          length: newProduct.length,
          image: newProduct.image,  // This will contain the base64 string
        },
      };
  
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch("http://localhost:5000/api/admin/add-product", {
          method: "POST",
          body: JSON.stringify(productData),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('Product added successfully');
          // Optionally update the UI with the new product
        } else {
          // alert('Failed to add product');
        }
      } catch (error) {
        console.error('Error adding product:', error);
        // alert('An error occurred while adding the product');
      }
    }
  };  

  return (
    <MDBContainer>
      <MDBRow className='justify-content-center'>
        <MDBCol md="8">
          <h2 className="text-center my-4">Product Management Form</h2>

          {/* Main Options (Profile, Hardware, Accessories) */}
          <div className="d-flex justify-content-center mb-4">
            <MDBBtn
              color={mainOption === 'profile' ? 'primary' : 'outline-primary'}
              onClick={() => handleMainOptionChange('profile')}
              className="mx-2"
            >
              Profile
            </MDBBtn>
            <MDBBtn
              color={mainOption === 'hardware' ? 'primary' : 'outline-primary'}
              onClick={() => handleMainOptionChange('hardware')}
              className="mx-2"
            >
              Hardware
            </MDBBtn>
            <MDBBtn
              color={mainOption === 'accessories' ? 'primary' : 'outline-primary'}
              onClick={() => handleMainOptionChange('accessories')}
              className="mx-2"
            >
              Accessories
            </MDBBtn>
          </div>

          {mainOption && (
            <>
              {/* Categories */}
              <div className="form-group mb-4">
                <label htmlFor="category">Select Category</label>
                <select
                  id="category"
                  className="form-control"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  size='lg'
                >
                  <option value="">Select Category</option>
                  {Object.keys(profileOptions).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <div className="d-flex align-items-center mt-3">
                  <MDBInput 
                    label="Add New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-75"
                    size='lg'
                  />
                  <MDBBtn size="sm" onClick={addCategory} className="ms-2">
                    Add Category
                  </MDBBtn>
                </div>
              </div>

              {selectedCategory && (
                <>
                  {/* Subcategories */}
                  <div className="form-group mb-4">
                    <label htmlFor="subcategory">Select Subcategory</label>
                    <select
                      id="subcategory"
                      className="form-control"
                      value={selectedSubCategory}
                      onChange={handleSubCategoryChange}
                    >
                      <option value="">Select Subcategory</option>
                      {profileOptions[selectedCategory]?.options.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    <div className="d-flex align-items-center mt-3">
                      <MDBInput
                        label="Add New Subcategory"
                        value={newSubCategory}
                        onChange={(e) => setNewSubCategory(e.target.value)}
                        className="w-75"
                        size='lg'
                      />
                      <MDBBtn size="sm" onClick={addSubCategory} className="ms-2">
                        Add Subcategory
                      </MDBBtn>
                    </div>
                  </div>

                  {selectedSubCategory && (
                    <>
                      {/* Add Product */}
                      <MDBCard className="mt-4">
                        <MDBCardHeader className="text-center">
                          Add Product
                        </MDBCardHeader>
                        <MDBCardBody>
                          <MDBRow>
                            <MDBCol md="6">
                              <MDBInput className="admin-form-input"
                                label="SAP Code"
                                value={newProduct.sapCode}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, sapCode: e.target.value })
                                }
                                size="lg"
                              />
                              <MDBInput className="admin-form-input"
                                label="Description"
                                value={newProduct.description}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, description: e.target.value })
                                }
                                size="lg"
                              />
                              <MDBInput className="admin-form-input"
                                label="Rate"
                                value={newProduct.rate}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, rate: e.target.value })
                                }
                                size="lg"
                              />
                              <MDBInput className="admin-form-input"
                                label="Per"
                                value={newProduct.per}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, per: e.target.value })
                                }
                                size="lg"
                              />
                            </MDBCol>
                            <MDBCol md="6">
                              <MDBInput className="admin-form-input"
                                label="KGM"
                                value={newProduct.kgm}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, kgm: e.target.value })
                                }
                                size="lg"
                              />
                              <MDBInput className="admin-form-input"
                                label="Length"
                                value={newProduct.length}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, length: e.target.value })
                                }
                                size="lg"
                              />
                              {/* Image Upload */}
                              <MDBFile
                                label="Select Image"
                                onChange={handleImageChange}
                                size="lg"
                              />
                            </MDBCol>
                          </MDBRow>
                          <div className="d-flex justify-content-center mt-3">
                            <MDBBtn color="primary" onClick={addProduct}>
                              Add Product
                            </MDBBtn>
                          </div>
                        </MDBCardBody>
                      </MDBCard>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default AdminForm;
