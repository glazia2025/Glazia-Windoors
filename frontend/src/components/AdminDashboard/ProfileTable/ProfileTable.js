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
  MDBIcon,
  MDBFile
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveOption, setActiveProfile } from "../../../redux/selectionSlice";
import api from '../../../utils/api';
import Search from '../../Search';
import ImageZoom from "../../UserDashboard/ImageZoom";
import './ProfileTable.css';

const ProfileTable = () => {
  const dispatch = useDispatch();
  const { activeProfile, activeOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [editableProduct, setEditableProduct] = useState(null);

  const productsToDisplay = searchResults.length > 0
    ? searchResults
    : profileOptions[activeProfile]?.products[activeOption];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get('https://api.glazia.in/api/admin/getProducts');
      setProfileData(response.data.categories);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    setProfileOptions(profileData);
    if (!activeProfile && Object.keys(profileData).length > 0) {
      const firstProfile = Object.keys(profileData)[0];
      dispatch(setActiveProfile(firstProfile));
      dispatch(setActiveOption(profileData[firstProfile]?.options[0]));
    }
  }, [profileData]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('https://api.glazia.in/api/admin/search-product', {
        params: { sapCode: searchQuery, description: searchQuery, profile: activeProfile, option: activeOption },
      });
      setSearchResults(response.data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const searchProduct = (value) => {
    setSearchResults([]);
    setSearchQuery(value);
  }

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
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.put(
        `https://api.glazia.in/api/admin/edit-product/${activeProfile}/${activeOption}/${editableProduct._id}`,
        editableProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchProducts();
      setEditableProduct(null); // Exit editing mode
    } catch (err) {
      console.error("Error saving product", err);
    }
  };

  const handleDelete = async (productId) => {
    const token = localStorage.getItem('authToken');
    try {
      await api.delete(`https://api.glazia.in/api/admin/delete-product/${activeProfile}/${activeOption}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
      // Remove product from the state after successful deletion
      setProfileOptions((prevOptions) => {
        const updatedProducts = prevOptions[activeProfile]?.products[activeOption].filter(
          (product) => product.id !== productId
        );
        return {
          ...prevOptions,
          [activeProfile]: {
            ...prevOptions[activeProfile],
            products: {
              ...prevOptions[activeProfile].products,
              [activeOption]: updatedProducts
            }
          }
        };
      });
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  return (
    <>
      <MDBTabs className="mb-4">
        {Object.keys(profileOptions).map((profile) => (
          <MDBTabsItem key={profile}>
            <MDBTabsLink
              active={activeProfile === profile}
              onClick={() => {
                dispatch(setActiveProfile(profile));
                dispatch(setActiveOption(profileOptions[profile]?.options[0]));
              }}
            >
              {profile}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>
      <hr />
      {activeProfile && (
        <MDBTabs className="mb-4">
          {profileOptions[activeProfile]?.options.map((option) => (
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
      )}

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
              <table className="table table-bordered"  style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th className="w5">S No.</th>
                    <th className="w10">Image</th>
                    <th>SAP Code</th>
                    <th>Part</th>
                    <th className="w15">Description</th>
                    <th>90 degree/ 45 degree</th>
                    <th className="w5">Rate</th>
                    <th>Per</th>
                    <th>Kg/m</th>
                    <th>Length</th>
                    <th className="w15">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsToDisplay?.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{editableProduct?.id === product.id ? <MDBFile name="image" size='sm' onChange={handleInputChange} id='formFileSm' /> : product.image ? <ImageZoom productImage={product.image} /> : 'N.A'}</td>
                      <td>{product.sapCode}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="part" value={editableProduct.part} onChange={handleInputChange} /> : product.part || 'N.A'}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="description" value={editableProduct.description} onChange={handleInputChange} /> : product.description || 'N.A'}</td>
                      <td>{product.degree}</td>
                      <td>{profileOptions[activeProfile].rate[activeOption]}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="per" value={editableProduct.per} onChange={handleInputChange} /> : product.per}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="kgm" value={editableProduct.kgm} onChange={handleInputChange} /> : product.kgm}</td>
                      <td>{editableProduct?.id === product.id ? <MDBInput name="length" value={editableProduct.length} onChange={handleInputChange} /> : product.length}</td>
                      <td className="d-flex">
                        {editableProduct?.id === product.id ? (
                          <>
                            <MDBBtn color="success" size="sm" className="m-1" onClick={handleSave}><MDBIcon far icon="save" /></MDBBtn>
                            <MDBBtn color="secondary" size="sm" className="m-1" onClick={() => setEditableProduct(null)}>
                              <MDBIcon fas icon="times" />
                            </MDBBtn>
                          </>
                        ) : (
                          <MDBBtn color="warning" size="sm" className="m-1" onClick={() => handleEditClick(product)}>
                            <MDBIcon fas icon="pen" />&nbsp;
                          </MDBBtn>
                        )}
                        <MDBBtn color="danger" size="sm" className="m-1" onClick={() => handleDelete(product._id)}>
                          <MDBIcon fas icon="trash" />&nbsp;
                        </MDBBtn>
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

export default ProfileTable;
