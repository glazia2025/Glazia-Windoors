import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBBtn,
  MDBInput,
  MDBFile
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveOption, setActiveProfile } from "../../../redux/selectionSlice";
import api from '../../../utils/api';
import Search from '../../Search';
import ImageZoom from "../../UserDashboard/ImageZoom";

const HardwareTable = () => {
  const dispatch = useDispatch();
  const { activeOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [editableProduct, setEditableProduct] = useState(null);
  const { hardwareHeirarchy } = useSelector((state) => state.heirarchy);
  const { products: hardwareData } = useSelector((state) => state.hardwares);

  const productsToDisplay = searchResults.length > 0
    ? searchResults
    : profileOptions?.products?.[activeOption];

  useEffect(() => {
    if(hardwareHeirarchy.includes(activeOption) && !hardwareData?.[activeOption]) {
      fetchProducts(activeOption);
    }
  }, [activeOption]);

  useEffect(() => {
    dispatch(setActiveOption(hardwareHeirarchy[0]));
  }, [hardwareHeirarchy]);

  const fetchProducts = async (reqOption) => {
    try {
      const response = await api.get(`https://api.glazia.in/api/admin/getHardwares?reqOption=${encodeURIComponent(reqOption)}`);
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
    e.preventDefault();
    try {
      const response = await api.get('https://api.glazia.in/api/admin/search-hardware', {
        params: { sapCode: searchQuery, perticular: searchQuery, option: activeOption },
      });
      setSearchResults(response.data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const searchProduct = (value) => {
    setSearchResults([]);
    setSearchQuery(value);
  };

  const handleEditClick = (product) => {
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
      const token = localStorage.getItem('authToken');
      await api.put(
        `https://api.glazia.in/api/admin/edit-hardware/${activeOption}/${editableProduct._id}`,
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

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      await api.delete(`https://api.glazia.in/api/admin/delete-hardware/${activeOption}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  return (
    <>
      <MDBTabs className="mb-4">
        {profileOptions?.options?.map((option) => (
          <MDBTabsItem key={option}>
            <MDBTabsLink
              active={activeOption === option}
              onClick={() => dispatch(setActiveOption(option))}
            >
              {option}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>
      <hr />
      {activeOption && (
        <MDBCard className="mt-4">
          <MDBCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white p-3" style={{ top: "0", zIndex: 1 }}>
              <div className="d-flex align-items-center">
                <MDBTypography tag="h4" className="mb-0" style={{ marginRight: '20px' }}>
                  Products
                </MDBTypography>
              </div>
              <Search searchQuery={searchQuery} setSearchQuery={searchProduct} handleSearch={handleSearch} />
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
                    <th>MOQ</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsToDisplay?.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{editableProduct?.id === product.id ? <MDBFile name="image" size='sm' onChange={handleInputChange} id='formFileSm' /> : <ImageZoom productImage={product.image} />}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="sapCode" value={editableProduct.sapCode} onChange={handleInputChange} /> : product.sapCode}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="subCategory" value={editableProduct.subCategory} onChange={handleInputChange} /> : product.subCategory}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="perticular" value={editableProduct.perticular} onChange={handleInputChange} /> : product.perticular}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="rate" value={editableProduct.rate} onChange={handleInputChange} /> : product.rate}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="moq" value={editableProduct.moq} onChange={handleInputChange} /> : product.moq}</td>
                      <td className="d-flex">
                        {editableProduct?.id === product.id ? (
                          <>
                            <MDBBtn color="success" size="sm" className="m-1" onClick={handleSave}>Save</MDBBtn>
                            <MDBBtn color="secondary" size="sm" className="m-1" onClick={() => setEditableProduct(null)}>Cancel</MDBBtn>
                          </>
                        ) : (
                          <>
                            <MDBBtn color="warning" size="sm" className="m-1" onClick={() => handleEditClick(product)}>Edit</MDBBtn>
                            <MDBBtn color="danger" size="sm" className="m-1" onClick={() => handleDelete(product._id)}>Delete</MDBBtn>
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
    </>
  );
};

export default HardwareTable;
