import { MDBRow, MDBCol, MDBBtn, MDBInput, MDBCard, MDBCardBody, MDBCardHeader, MDBFile } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import api from '../../utils/api';

const HardwareForm = () => {
  const [profileOptions, setProfileOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({
    sapCode: "",
    perticular: "",
    rate: "",
    system: "",
    moq: "",
    image: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await api.get(`https://api.glazia.in/api/admin/get-hardware-heirarchy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data.products);
        setProfileOptions(response.data.products);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };
    fetchProducts();
  }, []);
  

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const addCategory = () => {
    if (newCategory && (!profileOptions || !profileOptions[newCategory])) {
      setProfileOptions([
        ...profileOptions,
        newCategory
      ]);
      setNewCategory("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProduct = async () => {
    if (selectedCategory) {
      const productData = {
        category: selectedCategory,
        option: selectedCategory,
        product: {
          id: Date.now(),
          sapCode: newProduct.sapCode,
          perticular: newProduct.perticular,
          rate: newProduct.rate,
          system: newProduct.system,
          moq: newProduct.moq,
          image: newProduct.image,
          subCategory: selectedCategory
        },
      };

      try {
        const token = localStorage.getItem('authToken');
        const response = await api.post(
          "https://api.glazia.in/api/admin/add-hardware",
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status === 200) {
          console.log('Product added successfully');
        }
      } catch (error) {
        console.error('Error adding product:', error);
      }
    }
  };

  return (
    <>
      <div className="form-group mb-4">
        <label htmlFor="category">Select Category</label>
        <select
          id="category"
          className="form-control"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Select Category</option>
          {profileOptions && profileOptions.map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        <div className="d-flex align-items-center mt-3">
          <MDBInput 
            size='lg'
            label="Add New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-75"
          />
          <MDBBtn size="sm" onClick={addCategory} className="ms-2">
            Add Category
          </MDBBtn>
        </div>
      </div>

      {selectedCategory && (
        <MDBCard className="mt-4 mb-4">
          <MDBCardHeader className="text-center">Add Product</MDBCardHeader>
          <MDBCardBody>
            <MDBRow>
              <MDBCol md="6">
                <MDBInput className='m-4' size="lg" label="SAP Code" value={newProduct.sapCode} onChange={(e) => setNewProduct({ ...newProduct, sapCode: e.target.value })} />
                <MDBInput className='m-4' size="lg" label="Perticular" value={newProduct.perticular} onChange={(e) => setNewProduct({ ...newProduct, perticular: e.target.value })} />
                <MDBInput className='m-4' size="lg" label="Rate" value={newProduct.rate} onChange={(e) => setNewProduct({ ...newProduct, rate: e.target.value })} />
              </MDBCol>
              <MDBCol md="6">
                <MDBInput className='m-4' size="lg" label="System" value={newProduct.system} onChange={(e) => setNewProduct({ ...newProduct, system: e.target.value })} />
                <MDBInput className='m-4' size="lg" label="MOQ" value={newProduct.moq} onChange={(e) => setNewProduct({ ...newProduct, moq: e.target.value })} />
                <MDBFile onChange={handleImageChange} />
              </MDBCol>
            </MDBRow>
            <div className="d-flex justify-content-center mt-3">
              <MDBBtn color="primary" onClick={addProduct}>Add Product</MDBBtn>
            </div>
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
};

export default HardwareForm;
