import React, { useEffect, useImperativeHandle, useState, forwardRef } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBInput,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBTooltip
} from "mdb-react-ui-kit";
import { clearSelectedProducts, setActiveOption, setActiveProfile } from "../../redux/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ImageZoom from "./ImageZoom";
import itemImg from './product_image.jpeg';
import api from '../../utils/api';
import Search from '../Search';
import { fetchProductsFailure, fetchProductsStart, fetchProductsSuccess } from "../../redux/profileSlice";
import TechSheet from "./Technical-sheet/TechnicalSheet";

const ProfileSelection = forwardRef(({ onProductSelect, selectedProfiles }, ref) => {
  const [quantities, setQuantities] = useState({});
  const [powderCoating, setPowderCoating] = useState({});
  // const [activeProfile, setActiveProfile] = useState();
  // const [activeOption, setActiveOption] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sheetData, setSheetData] = useState({
    shutterHeight: null,
    shutterWidth: null,
    lockingMechanism: null,
    glassSize: null,
    alloy: null,
    interlock: null,
  });

  const { activeProfile, activeOption } = useSelector((state) => state.selection);

  const dispatch = useDispatch();
  const { data: profileData } = useSelector((state) => state.profiles);

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
    fetchProducts();
  }, [dispatch]);

  useImperativeHandle(ref, () => ({
    fetchProducts,
  }));

  const fetchProducts = async () => {
    dispatch(fetchProductsStart());
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.get("https://api.glazia.in/api/admin/getProducts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProductsSuccess(response.data.categories));
    } catch (err) {
      dispatch(fetchProductsFailure("Failed to fetch products"));
    }
  };

  useEffect(() => {
    if (Object.keys(profileData).length > 0) {
      const firstProfile = Object.keys(profileData)[0];
      dispatch(setActiveProfile(firstProfile));
      dispatch(setActiveOption(profileData[firstProfile]?.options[0]));
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

  const fetchTechSheet = async () => {
    try {
      const response = await api.get(`https://api.glazia.in/api/admin/get-tech-sheet?main=profile&category=${activeProfile}&subCategory=${activeOption}`);
      setSheetData({
        shutterHeight: response.data.shutterHeight || null,
        shutterWidth: response.data.shutterWidth || null,
        lockingMechanism: response.data.lockingMechanism || '',
        glassSize: response.data.glassSize || '',
        alloy: response.data.alloy || '',
        interlock: response.data.interlock || null,
      });
    } catch (err) {
      console.error("Error fetching products", err);
    }
  }

  useEffect(() => {
    if (activeProfile && activeOption) {
      setSheetData({
        shutterHeight: null,
        shutterWidth: null,
        lockingMechanism: null,
        glassSize: null,
        alloy: null,
        interlock: null,
      })
      fetchTechSheet();
    }
  }, [activeProfile, activeOption]); 
  
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

  const handleQuantityChange = (profile, option, id, value) => {
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
          rate: profileData[activeProfile].rate[activeOption],
          amount: (quantities[`${activeProfile}-${activeOption}-${product.id}`]?.quantity || 0) * (profileData[activeProfile]?.rate[activeOption] || 0)
        };
      });
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
                dispatch(setActiveProfile(profile));
                dispatch(setActiveOption(profileData[profile]?.options[0]));
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
                onClick={() => dispatch(setActiveOption(option))}
              >
                {option}
              </MDBTabsLink>
            </MDBTabsItem>
          ))}
        </MDBTabs>
      )}
      {(sheetData.shutterHeight || sheetData.shutterWidth || sheetData.lockingMechanism || sheetData.glassSize || sheetData.alloy ||    sheetData.interlock) && (
        <TechSheet sheetData={sheetData}/>
      )}

      {activeOption && (
        <MDBCard className="mt-4">
          <MDBCardBody style={{overflowX: 'scroll', maxWidth: '100%'}}>
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
                <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Please enter quantity'>
                  <button
                    className="btn btn-primary"
                    onClick={onConfirmation}
                    disabled={
                      !Object.values(quantities).some((q) => q.quantity > 0)
                    }
                  >
                    Confirm
                  </button>
                </MDBTooltip>
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
                  <td>{'₹' + profileData[activeProfile]?.rate[activeOption]}</td>
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
});

export default ProfileSelection;
