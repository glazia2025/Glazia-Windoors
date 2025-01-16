import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBInput,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { clearSelectedProducts } from "../../redux/selectionSlice";
import { useDispatch } from "react-redux";
import ImageZoom from "./ImageZoom";
import itemImg from './product_image.jpeg';
import api from '../../utils/api';
import Search from '../Search';

const ProfileSelection = ({ onProductSelect, selectedProfiles }) => {
  const [quantities, setQuantities] = useState({});
  const [powderCoating, setPowderCoating] = useState({});
  const [profileData, setProfileData] = useState({});
  const [activeProfile, setActiveProfile] = useState();
  const [activeOption, setActiveOption] = useState();
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const dispatch = useDispatch();

  const productsToDisplay = searchResults.length > 0
  ? searchResults
  : profileData[activeProfile]?.products[activeOption] || [];

  const powderColors = [
    { name: "#FF0000", hex: "#FF0000" },
    { name: "#0000FF", hex: "#0000FF" },
    { name: "#008000", hex: "#008000" },
    { name: "#000000", hex: "#000000" }
  ];

  useEffect(() => {
    console.log("coll")
    const fetchProducts = async () => {
        const token = localStorage.getItem('authToken'); 
        try {
            const response = await api.get('http://localhost:5000/api/admin/getProducts', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }); 
              setProfileData(response.data.categories);
        } catch (err) {
            // setError('Failed to fetch products');
            // setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (Object.keys(profileData).length > 0) {
      const firstProfile = Object.keys(profileData)[0];
      setActiveProfile(firstProfile);
      setActiveOption(profileData[firstProfile]?.options[0]);
    }
  }, [profileData]);
  
  useEffect(() => {
    if (!selectedProfiles || selectedProfiles.length === 0) {
      setQuantities((prev) => {
        // if (Object.keys(prev).length > 0) {
        //   onProductSelect([]);
        // }
        return {}; // Clear quantities
      });
    } else {
      const updatedQuantities = {};
      selectedProfiles.forEach((element) => {
        updatedQuantities[`${element.profile}-${element.option}-${element.id}`] = {
          profile: element.profile,
          option: element.option,
          id: element.id,
          quantity: element.quantity || 0,
        };
      });
      setQuantities(updatedQuantities);
    }
  }, [selectedProfiles, onProductSelect]);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('http://localhost:5000/api/admin/search-product', {
        params: { sapCode: searchQuery, description: searchQuery, profile: activeProfile, option: activeOption },
      });
      setSearchResults(response.data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };  

  const handleQuantityChange = (profile, option, id, value) => {
    setIsProfileChanged(true)
    setQuantities((prev) => ({
      ...prev,
      [`${profile}-${option}-${id}`]: {
        profile,
        option,
        id,
        quantity: parseInt(value, 10) || 0,
      },
    }));
  };

  const handlePowderCoating = (profile, option, id, value) => {
    setPowderCoating((prev) => ({
      ...prev,
      [`${profile}-${option}-${id}`]: {
        profile,
        option,
        id,
        powderCoating: value,
      },
    }));
  };


  const onConfirmation = () => {
    setIsProfileChanged(false);
    const selectedProducts = Object.values(quantities)
      .filter((item) => item.quantity > 0)
      .map(({ profile, option, id, quantity }) => {
        const product = profileData[profile]?.products[option]?.find(
          (prod) => prod.id === id
        );
        return {
          ...product,
          profile,
          option,
          quantity,
          rate: profileData[activeProfile].rate[activeOption]
        };
      });

    console.log("Selected Products:", selectedProducts);
    onProductSelect(selectedProducts);
  };

  const onClear = () => {
    dispatch(clearSelectedProducts({option: 'profile'}));
  };

  const searchProduct = (value) => {
    setSearchResults([]);
    setSearchQuery(value);
  }

  return (
    <>
      <MDBTabs className="mb-4">
        {Object.keys(profileData).map((profile) => (
          <MDBTabsItem key={profile}>
            <MDBTabsLink
              active={activeProfile === profile}
              onClick={() => {
                setActiveProfile(profile);
                setActiveOption(profileData[profile].options[0]);
              }}
            >
              {profile}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>
        <hr/>
      {activeProfile && (
        <MDBTabs className="mb-4">
          {profileData[activeProfile]?.options.map((option) => (
            <MDBTabsItem key={option}>
              <MDBTabsLink
                active={activeOption === option}
                onClick={() => setActiveOption(option)}
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
            <div
              className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white p-3"
              style={{ top: "0", zIndex: 1 }}
            >
              <div className="d-flex align-items-center">
                <MDBTypography tag="h4" className="mb-0" style={{marginRight: '20px'}}>
                  Products
                </MDBTypography>
                <Search searchQuery={searchQuery} setSearchQuery={searchProduct} handleSearch={handleSearch} />
              </div>
              <div>
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClear}
                  disabled={!selectedProfiles.length}
                >
                  Clear
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onConfirmation}
                  disabled={
                    !Object.values(quantities).some((q) => q.quantity > 0)
                  }
                >
                  Confirm
                </button>
              </div>
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Image</th> 
                  <th>SAP Code</th>
                  <th>Description</th>
                  <th>Rate</th>
                  <th>Per</th>
                  <th>Kg/m</th>
                  <th>Length</th>
                  <th>Quantity</th>
                  <th>Powder Coating</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
              {productsToDisplay.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>
                    <ImageZoom productImage={itemImg} />
                  </td>
                  <td>{product.sapCode}</td>
                  <td>{product.description}</td>
                  <td>{profileData[activeProfile]?.rate[activeOption]}</td>
                  <td>{product.per}</td>
                  <td>{product.kgm}</td>
                  <td>{product.length}</td>
                  <td>
                    <MDBInput
                      type="number"
                      min="0"
                      value={quantities[`${activeProfile}-${activeOption}-${product.id}`]?.quantity || ""}
                      onChange={(e) => handleQuantityChange(activeProfile, activeOption, product.id, e.target.value)}
                      size="sm"
                      style={{ minWidth: '80px' }}
                    />
                  </td>
                  <td>
                    <MDBDropdown>
                      <MDBDropdownToggle color="secondary">
                        {powderCoating[`${activeProfile}-${activeOption}-${product.id}`]?.powderCoating || "Select Color"}
                      </MDBDropdownToggle>
                      <MDBDropdownMenu>
                        {powderColors.map((color) => (
                          <MDBDropdownItem
                            className="d-flex"
                            key={color.hex}
                            onClick={() => handlePowderCoating(activeProfile, activeOption, product.id, color.name)}
                          >
                            <div style={{ width: "20px", height: "20px", backgroundColor: color.hex, marginRight: "8px" }}></div>
                            {color.name}
                          </MDBDropdownItem>
                        ))}
                      </MDBDropdownMenu>
                    </MDBDropdown>
                  </td>
                  <td>
                    <MDBInput
                      disabled
                      type="number"
                      value={(quantities[`${activeProfile}-${activeOption}-${product.id}`]?.quantity || 0) * (profileData[activeProfile]?.rate[activeOption] || 0)}
                      size="sm"
                      style={{ minWidth: '80px' }}
                    />
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
};

export default ProfileSelection;
