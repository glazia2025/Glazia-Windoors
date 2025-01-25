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
  MDBTooltip,
  MDBIcon
} from "mdb-react-ui-kit";
import { clearSelectedProducts, setActiveOption, setActiveProfile } from "../../redux/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ImageZoom from "./ImageZoom";
import itemImg from './product_image.jpeg';
import api from '../../utils/api';
import Search from '../Search';
import { fetchProductsFailure, fetchProductsStart, fetchProductsSuccess } from "../../redux/profileSlice";
import TechSheet from "./Technical-sheet/TechnicalSheet";
import './ProfileOptions.css';

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
    {name: 'Metallic Shades', colors: [
      { name: "Matt Metro Gold", hex: "#989084" },
      { name: "Satin RAL 9006", hex: "#A7A2A0" },
      { name: "Matt Eco Grey", hex: "#9E9E94" },
      { name: "Satin RAL 9007", hex: "#A19C9A" },
      { name: "Fine Texture Sparkle Grey", hex: "#4C4F4E" },
      { name: "Fine Texture 2900 MT Grey", hex: "#45403D" },
      { name: "Fine Texture Noir 2200 Sable", hex: "#3A4244" },
      { name: "Fine Texture 2500 MT Grey", hex: "#796A5A" },
      { name: "Matt Anodic Bronze III", hex: "#41362F" },
    ]},
    {name: 'Solid Shades', colors: [
      { name: "Satin RAL 9016", hex: "#FFFEF7" },
      { name: "Satin RAL 9003", hex: "#FFFFFF" },
      { name: "Satin RAL 9010", hex: "#F7FBF2" },
      { name: "Satin RAL 9002", hex: "#D6D5C8" },
      { name: "Matt Champagne", hex: "#ACA27D" },
      { name: "Satin RAL 7035", hex: "#CDD3D1" },
      { name: "Satin RAL 7032", hex: "#C0BEAC" },
      { name: "Satin RAL 7037", hex: "#868A8C" },
      { name: "Matt RAL 7043", hex: "#484F54" },
      { name: "Matt RAL 7015", hex: "#46494E" },
      { name: "Matt RAL 7024", hex: "#444A4A" },
      { name: "Satin RAL 7022", hex: "#393A34" },
      { name: "Satin RAL 7016", hex: "#3F4648" },
      { name: "Fine Texture", hex: "#353536" },
      { name: "Matt RAL 9005", hex: "#00181B" },
      { name: "Fine Texture RAL 9005", hex: "#00181B" },
      { name: "Satin RAL 8003", hex: "#7B4D28" },
      { name: "Matt RAL 8016", hex: "#56382D" },
    ]},
    {name: 'Bonded Metallic Shades', colors: [
      { name: "Matt Soft Silver", hex: "#B0B2A1" },
      { name: "Matt Steel Blue Platinum", hex: "#5B6162" },
      { name: "Matt Steel Blue Grey 715", hex: "#49484E" },
      { name: "Matt Silver Champagne", hex: "#C3BEA7" },
      { name: "Matt Gold Splendor", hex: "#B28637" },
      { name: "Matt Steel Bronze-1", hex: "#7B6540" },
      { name: "Matt Golden Beach", hex: "#A69982" },
      { name: "Satin Golden Bronze", hex: "#977145" },
      { name: "Satin (Dry Blended Metallic) RAL 9006", hex: "#A2A6A4" },
    ]},
    {name: 'Solid Shades', colors: [
      { name: "Satin RAL 9016", hex: "#FFFEF7" },
      { name: "Satin RAL 9003", hex: "#FFFFFF" },
      { name: "Satin RAL 9010", hex: "#FFFEF7" },
      { name: "Matt RAL 7035", hex: "#CDD3D1" },
      { name: "Matt RAL 7043", hex: "#565C5B" },
    ]}
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
              className="table-controller d-flex justify-content-between align-items-center mb-3 sticky-top bg-white table-responsive"
              style={{ 
                top: "0", 
                zIndex: 1 
              }}
            >
              <div className="table-controller d-flex align-items-center">
                <MDBTypography tag="h5" className="mb-0 me-3">
                  Profile {'>'} {activeProfile} {'>'} {activeOption}
                </MDBTypography>
                <Search searchQuery={searchQuery} setSearchQuery={searchProduct} handleSearch={handleSearch} />
              </div>
              <div className="d-flex action-wrapper">
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClear}
                  disabled={!selectedProfiles.length}
                >
                  Clear
                </button>
                <div className="action-wrapper">
                  <MDBTooltip tag='div' wrapperClass="w-100"  title='Please enter quantity' className="d-flex">
                    <button style={{ flex: '1 1 auto', width: '100%' }}
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
            </div>
            <h6 className="scroll-right">Scroll right <MDBIcon fas icon="angle-double-right" style={{color: '#3b71ca'}}/></h6>
            <div className="table-responsive">
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
                            <MDBDropdownMenu style={{padding: '10px', maxHeight: '300px', overflowY: 'auto', width: 'max-content'}}>
                              {powderColors.map((color, index) => (
                                <>
                                <div key={color.name + index} style={{marginTop: '10px', marginBottom: '5px', fontWeight: '600'}}>{color.name} -</div>
                                {color.colors.map((value, index) => (
                                  <>
                                  <MDBDropdownItem
                                    className="d-flex cursor-pointer m-2"
                                    key={value.hex + value.index}
                                    onClick={() => handlePowderCoating(activeProfile, activeOption, product.id, value.name)}
                                  >
                                    <div style={{ width: "20px", height: "20px", backgroundColor: value.hex, marginRight: "8px" }}></div>
                                    {value.name}
                                  </MDBDropdownItem>
                                    <hr/>
                                    </>
                                ))}
                                </>
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
            </div>
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
});

export default ProfileSelection;
