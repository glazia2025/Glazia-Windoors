import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBInput, MDBCard, MDBCardBody, MDBCardHeader, MDBFile } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import api from '../../utils/api';

const ProfileForm = () => {
  const [profileOptions, setProfileOptions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [proceedWithProductAdd, setProceedWithProductAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [subCategoryRate, setSubCategoryRate] = useState("");
  const [newProduct, setNewProduct] = useState({
    sapCode: "",
    part: "",
    description: "",
    degree: "",
    per: "",
    kgm: "",
    length: "",
    image: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
        const token = localStorage.getItem('authToken'); 
        try {
            const response = await api.get('http://localhost:5000/api/admin/getProducts', {
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory("");
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
    console.log("rofileOptions[selectedCategory].rate", profileOptions[selectedCategory].rate)
    if(profileOptions && profileOptions[selectedCategory].rate) {
      const rate = profileOptions[selectedCategory]?.rate[e.target.value] || ''
      setSubCategoryRate(rate);
      setNewProduct({ ...newProduct, rate });
    } else {
      setSubCategoryRate('');
    }
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
      updatedCategory[newSubCategory] = { rate: "" };  // Add rate at the subcategory level
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

  const handleRateChange = (value) => {
    setSubCategoryRate(value)
    setProfileOptions({
      ...profileOptions,
      [selectedCategory]: {
        ...profileOptions[selectedCategory],
        [selectedSubCategory]: {
          rate: value,
        },
      },
    })
  }

  const isFormValid = () => {
    return (
      subCategoryRate
    );
  };

  const addProduct = async () => {
    if (selectedCategory && selectedSubCategory) {
      let productData = {
        category: selectedCategory,
        option: selectedSubCategory,
        rate: subCategoryRate || '',
      };

      if(proceedWithProductAdd) {
        productData = {
          ...productData,
          product: {
            id: Date.now(),
            sapCode: newProduct.sapCode,
            part: newProduct.part,
            description: newProduct.description,
            degree: newProduct.degree,
            per: newProduct.per,
            kgm: newProduct.kgm,
            length: newProduct.length,
            image: newProduct.image,
          },
        }
      }
      console.log("productData", productData)
      try {
        const token = localStorage.getItem('authToken');
        
        const response = await api.post(
          "http://localhost:5000/api/admin/add-product",
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.status === 200) {
          setProceedWithProductAdd(false);
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
        {profileOptions && Object.keys(profileOptions).map((key) => (
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
            {profileOptions[selectedCategory]?.options?.map((sub) => (
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
          <div className='d-flex'>
            <MDBInput
              label="Rate for Subcategory"
              value={subCategoryRate}
              onChange={(e) =>
                handleRateChange(e.target.value)
              }
              size='lg'
            />
            <MDBBtn size="m-3" onClick={addProduct} style={{marginLeft: '10px'}}>
              Save
            </MDBBtn>
          </div>
          <MDBBtn size="lg" onClick={() => setProceedWithProductAdd(true)} className="w-100 mt-4 mb-4">
            Add Product
          </MDBBtn>

            {/* Add Product */}
          </>
        )}
        { proceedWithProductAdd &&
            <MDBCard className="mt-4 mb-4">
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
                    label="Part"
                    value={newProduct.part}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, part: e.target.value })
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
                    label="Degree"
                    value={newProduct.degree}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, degree: e.target.value })
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
                    onChange={handleImageChange}
                    size="lg"
                  />
                </MDBCol>
              </MDBRow>
              <div className="d-flex justify-content-center mt-3">
              <MDBBtn 
                color="primary" 
                onClick={addProduct} 
                disabled={!isFormValid()}  // Disable button if form is not valid
              >
                Add Product
              </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        }
      </>
    )}
  </>
  )
}

export default ProfileForm;