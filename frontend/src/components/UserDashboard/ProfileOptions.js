import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
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
  MDBIcon,
  MDBBtn,
} from "mdb-react-ui-kit";
import {
  clearSelectedProducts,
  setActiveOption,
  setActiveProfile,
} from "../../redux/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ImageZoom from "./ImageZoom";
import itemImg from "./product_image.jpeg";
import api, { BASE_API_URL } from "../../utils/api";
import Search from "../Search";
import {
  fetchProductsFailure,
  fetchProductsStart,
  fetchProductsSuccess,
} from "../../redux/profileSlice";
import TechSheet from "./Technical-sheet/TechnicalSheet";
import "./ProfileOptions.css";

const ProfileSelection = forwardRef(
  ({ onProductSelect, selectedProfiles, onRemoveProduct }, ref) => {
    const [quantities, setQuantities] = useState({});
    const [powderCoating, setPowderCoating] = useState({});
    const { productsByOption } = useSelector((state) => state.selection);
    const selectedProducts = Object.values(productsByOption).flat();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [sheetData, setSheetData] = useState({
      shutterHeight: null,
      shutterWidth: null,
      lockingMechanism: null,
      glassSize: null,
      alloy: null,
      interlock: null,
    });

    const { activeProfile, activeOption } = useSelector(
      (state) => state.selection
    );
    const dispatch = useDispatch();
    const { data: profileData } = useSelector((state) => state.profiles);

    const productsToDisplay = searchQuery
      ? searchResults
      : profileData[activeProfile]?.products[activeOption] || [];

    const powderColors = [
      {
        name: "Metallic Shades",
        colors: [
          { name: "Matt Metro Gold", hex: "#989084" },
          { name: "Satin RAL 9006", hex: "#A7A2A0" },
          { name: "Matt Eco Grey", hex: "#9E9E94" },
          { name: "Satin RAL 9007", hex: "#A19C9A" },
          { name: "Fine Texture Sparkle Grey", hex: "#4C4F4E" },
          { name: "Fine Texture 2900 MT Grey", hex: "#45403D" },
          { name: "Fine Texture Noir 2200 Sable", hex: "#3A4244" },
          { name: "Fine Texture 2500 MT Grey", hex: "#796A5A" },
          { name: "Matt Anodic Bronze III", hex: "#41362F" },
        ],
      },
      {
        name: "Solid Shades",
        colors: [
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
        ],
      },
      {
        name: "Bonded Metallic Shades",
        colors: [
          { name: "Matt Soft Silver", hex: "#B0B2A1" },
          { name: "Matt Steel Blue Platinum", hex: "#5B6162" },
          { name: "Matt Steel Blue Grey 715", hex: "#49484E" },
          { name: "Matt Silver Champagne", hex: "#C3BEA7" },
          { name: "Matt Gold Splendor", hex: "#B28637" },
          { name: "Matt Steel Bronze-1", hex: "#7B6540" },
          { name: "Matt Golden Beach", hex: "#A69982" },
          { name: "Satin Golden Bronze", hex: "#977145" },
          { name: "Satin (Dry Blended Metallic) RAL 9006", hex: "#A2A6A4" },
        ],
      },
      {
        name: "Solid Shades",
        colors: [
          { name: "Satin RAL 9016", hex: "#FFFEF7" },
          { name: "Satin RAL 9003", hex: "#FFFFFF" },
          { name: "Satin RAL 9010", hex: "#FFFEF7" },
          { name: "Matt RAL 7035", hex: "#CDD3D1" },
          { name: "Matt RAL 7043", hex: "#565C5B" },
        ],
      },
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
        const response = await api.get(`${BASE_API_URL}/admin/getProducts`, {
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
        // Keep existing quantities
      } else {
        setQuantities((prevQuantities) => {
          const updatedQuantities = { ...prevQuantities };
          selectedProfiles.forEach((element) => {
            const key = `${element.profile}-${element.option}-${element.id}`;
            updatedQuantities[key] = {
              profile: element.profile,
              option: element.option,
              id: element.id,
              quantity: element.quantity ?? prevQuantities[key]?.quantity ?? 0,
            };
          });
          return updatedQuantities;
        });
      }
    }, [selectedProfiles, onProductSelect]);

    const fetchTechSheet = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(
          `${BASE_API_URL}/admin/get-tech-sheet?main=profile&category=${activeProfile}&subCategory=${activeOption}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSheetData({
          shutterHeight: response.data.shutterHeight || null,
          shutterWidth: response.data.shutterWidth || null,
          lockingMechanism: response.data.lockingMechanism || "",
          glassSize: response.data.glassSize || "",
          alloy: response.data.alloy || "",
          interlock: response.data.interlock || null,
        });
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };

    useEffect(() => {
      if (activeProfile && activeOption) {
        setSheetData({
          shutterHeight: null,
          shutterWidth: null,
          lockingMechanism: null,
          glassSize: null,
          alloy: null,
          interlock: null,
        });
        fetchTechSheet();
      }
    }, [activeProfile, activeOption]);

    const handleSearch = async (value) => {
      setSearchResults(null);
      setSearchQuery(value);
      if (!value.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`${BASE_API_URL}/admin/search-product`, {
          params: {
            sapCode: value,
            description: value,
            profile: activeProfile,
            option: activeOption,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSearchResults(response.data.products);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
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
            powderCoating: powderCoating,
            rate: profileData[activeProfile].rate[activeOption],
            amount:
              (quantities[`${activeProfile}-${activeOption}-${product.id}`]
                ?.quantity || 0) *
              (profileData[activeProfile]?.rate[activeOption] || 0),
          };
        });
      onProductSelect(selectedProducts);
    };

    const onConfirmRow = (product) => {
      const key = `${activeProfile}-${activeOption}-${product.id}`;
      const selectedProduct = {
        ...product,
        profile: activeProfile,
        option: activeOption,
        powderCoating: powderCoating[key]?.powderCoating ?? "",
        id: product.id,
        quantity: quantities[key]?.quantity || 0,
        rate: profileData[activeProfile].rate[activeOption],
        amount:
          (quantities[key]?.quantity || 0) *
          (profileData[activeProfile]?.rate[activeOption] || 0),
      };

      if (selectedProduct.quantity > 0) {
        onProductSelect(selectedProduct);
      } else {
        alert("Please enter a valid quantity before confirming.");
      }
    };

    const onCancelRow = (product) => {
      const key = `${activeProfile}-${activeOption}-${product.id}`;
      onRemoveProduct(product?.sapCode);
      const newQuantities = { ...quantities };
      delete newQuantities[key];
      setQuantities(newQuantities);
    };

    const onClear = () => {
      dispatch(clearSelectedProducts({ option: "profile" }));
      setQuantities({});
    };

    const renderTableContent = () => {
      if (searchQuery && searchResults?.length === 0) {
        return (
          <div className="text-center p-4">
            <MDBTypography tag="h5" className="text-muted">
              <MDBIcon far icon="folder-open" className="me-2" />
              No results found for "{searchQuery}"
            </MDBTypography>
            <p className="text-muted mt-2">
              Try adjusting your search terms or browse all products
            </p>
          </div>
        );
      }

      return (
        <div className="d-flex w-100">
          <table
            className="table table-custom stop-sticky-left"
            style={{
              marginLeft: "-1px",
              marginRight: "-1px",
            }}
          >
            <thead>
              <tr>
                <th className="col-sno">S No.</th>
                <th className="description-cell col-description">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {productsToDisplay?.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td className="description-cell">
                    <div className="description-content">
                      {product.description}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="table table-custom position-relative">
            <thead>
              <tr>
                <th className="col-image">Image</th>
                <th className="col-sap-code">SAP Code</th>
                <th className="col-rate">Rate</th>
                <th className="col-per">Per</th>
                <th className="col-kgm">Kg/m</th>
                <th className="col-length">Length (mm)</th>
                <th className="col-quantity">Quantity</th>
                <th className="col-powder-coating">Powder Coating</th>
              </tr>
            </thead>
            <tbody>
              {productsToDisplay?.map((product, index) => (
                <tr key={product.id}>
                  <td>
                    <ImageZoom productImage={itemImg} />
                  </td>
                  <td>{product.sapCode}</td>
                  <td>
                    {"₹" + profileData[activeProfile]?.rate[activeOption]}
                  </td>
                  <td>{product.per}</td>
                  <td>{product.kgm}</td>
                  <td>{product.length}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <MDBBtn
                        color="link"
                        size="sm"
                        className="d-flex align-items-center justify-content-center px-2 me-1"
                        onClick={() => {
                          const currentValue =
                            quantities[
                              `${activeProfile}-${activeOption}-${product.id}`
                            ]?.quantity || 0;
                          handleQuantityChange(
                            activeProfile,
                            activeOption,
                            product.id,
                            Math.max(0, currentValue - 1).toString() // Ensure value doesn't go below 0
                          );
                        }}
                      >
                        <MDBIcon fas icon="minus" />
                      </MDBBtn>
                      <MDBInput
                        type="number"
                        min="0"
                        value={
                          quantities[
                            `${activeProfile}-${activeOption}-${product.id}`
                          ]?.quantity || ""
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            activeProfile,
                            activeOption,
                            product.id,
                            e.target.value
                          )
                        }
                        size="sm"
                        style={{ minWidth: "60px", textAlign: "center" }}
                        className="hide-spin-buttons mx-0"
                      />
                      <MDBBtn
                        color="link"
                        size="sm"
                        className="d-flex align-items-center justify-content-center px-2 ms-1"
                        onClick={() => {
                          const currentValue =
                            quantities[
                              `${activeProfile}-${activeOption}-${product.id}`
                            ]?.quantity || 0;
                          handleQuantityChange(
                            activeProfile,
                            activeOption,
                            product.id,
                            (currentValue + 1).toString()
                          );
                        }}
                      >
                        <MDBIcon fas icon="plus" />
                      </MDBBtn>
                    </div>
                  </td>
                  <td>
                    <MDBDropdown>
                      <MDBDropdownToggle color="secondary">
                        {powderCoating[
                          `${activeProfile}-${activeOption}-${product.id}`
                        ]?.powderCoating || "No Color"}
                      </MDBDropdownToggle>
                      <MDBDropdownMenu
                        style={{
                          padding: "10px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          width: "max-content",
                        }}
                      >
                        <MDBDropdownItem
                          className="d-flex align-items-center cursor-pointer"
                          onClick={() =>
                            handlePowderCoating(
                              activeProfile,
                              activeOption,
                              product.id,
                              "No Color"
                            )
                          }
                        >
                          <MDBIcon
                            style={{ fontSize: "20px", marginRight: "10px" }}
                            fas
                            icon="ban"
                          />
                          No Color
                        </MDBDropdownItem>
                        {powderColors.map((colorGroup, groupIndex) => (
                          <React.Fragment key={colorGroup.name + groupIndex}>
                            <div
                              style={{
                                marginTop: "10px",
                                marginBottom: "5px",
                                fontWeight: "600",
                              }}
                            >
                              {colorGroup.name} -
                            </div>
                            {colorGroup.colors.map((color, colorIndex) => (
                              <React.Fragment key={color.hex + colorIndex}>
                                <MDBDropdownItem
                                  className="d-flex align-items-center cursor-pointer"
                                  onClick={() =>
                                    handlePowderCoating(
                                      activeProfile,
                                      activeOption,
                                      product.id,
                                      color.name
                                    )
                                  }
                                >
                                  <div
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      backgroundColor: color.hex,
                                      marginRight: "8px",
                                    }}
                                  />
                                  {color.name}
                                </MDBDropdownItem>
                                <hr />
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </MDBDropdownMenu>
                    </MDBDropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table
            className="table table-custom stop-sticky-right"
            style={{
              marginLeft: "-1px",
              marginRight: "-1px",
            }}
          >
            <thead>
              <tr>
                <th className="col-amount">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {productsToDisplay?.map((product, index) => (
                <tr key={product.id}>
                  <td className="d-flex align-items-center justify-content-start col-amount">
                    {/* <MDBInput
                    disabled
                    type="number"
                    value={
                      (quantities[
                        `${activeProfile}-${activeOption}-${product.id}`
                      ]?.quantity || 0) *
                      (profileData[activeProfile]?.rate[activeOption] || 0)
                    }
                    size="sm"
                    style={{ minWidth: "80px" }}
                  /> */}

                    <span
                      className="amount-value"
                      style={
                        (quantities[
                          `${activeProfile}-${activeOption}-${product.id}`
                        ]?.quantity || 0) *
                          (profileData[activeProfile]?.rate[activeOption] ||
                            0) >
                        0
                          ? {
                              fontWeight: "600",
                              background: "#fff",
                              border: "1px solid #ccc",
                              borderRadius: "5px",
                              padding: "5px 10px",
                            }
                          : {}
                      }
                    >
                      {(quantities[
                        `${activeProfile}-${activeOption}-${product.id}`
                      ]?.quantity || 0) *
                        (profileData[activeProfile]?.rate[activeOption] || 0) >
                      0 ? (
                        "₹" +
                        (quantities[
                          `${activeProfile}-${activeOption}-${product.id}`
                        ]?.quantity || 0) *
                          (profileData[activeProfile]?.rate[activeOption] || 0)
                      ) : (
                        <></>
                      )}
                    </span>
                    {!selectedProducts.find(
                      (sp) => sp.sapCode === product.sapCode
                    ) ? (
                      <MDBBtn
                        disabled={
                          !quantities[
                            `${activeProfile}-${activeOption}-${product.id}`
                          ]?.quantity
                        }
                        onClick={() => onConfirmRow(product)}
                        style={{ marginLeft: "10px" }}
                        className="confirm-button w-auto text-nowrap d-flex justify-content-center align-items-center"
                      >
                        Save
                      </MDBBtn>
                    ) : (
                      <MDBBtn
                        color="danger"
                        disabled={
                          !quantities[
                            `${activeProfile}-${activeOption}-${product.id}`
                          ]?.quantity
                        }
                        onClick={() => onCancelRow(product)}
                        style={{ marginLeft: "10px" }}
                        className="confirm-button w-auto text-nowrap d-flex justify-content-center align-items-center"
                      >
                        X
                      </MDBBtn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div className="profile-selection">
        <MDBTabs className="mb-4 gap-2">
          {Object.keys(profileData).map((profile) => (
            <MDBTabsItem key={profile}>
              <MDBTabsLink
                style={{borderRadius: "5px"}}
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
        {/* <hr /> */}
        {activeProfile && (
          <MDBTabs className="mb-4 gap-2">
            {profileData[activeProfile]?.options.map((option) => (
              <MDBTabsItem key={option}>
                <MDBTabsLink
                  style={{borderRadius: "5px"}}
                  active={activeOption === option}
                  onClick={() => dispatch(setActiveOption(option))}
                >
                  {option}
                </MDBTabsLink>
              </MDBTabsItem>
            ))}
          </MDBTabs>
        )}

        {(sheetData.shutterHeight ||
          sheetData.shutterWidth ||
          sheetData.lockingMechanism ||
          sheetData.glassSize ||
          sheetData.alloy ||
          sheetData.interlock) && <TechSheet sheetData={sheetData} />}

        {activeOption && (
          <MDBCard className="mt-2 p-0">
            <MDBCardBody style={{ overflowX: "scroll", maxWidth: "100%", padding: "0px" }}>
              <div
                className="px-3 pt-2 table-main-header table-controller d-flex justify-content-between align-items-center pb-2 mb-1 sticky-top bg-white rounded-3 table-responsive"
                style={{ position: "sticky", top: "0", zIndex: 1 }}
              >
                <div className="table-controller d-flex align-items-center">
                  <MDBTypography tag="h5" className="mb-0 me-3 d-flex align-items-center gap-2 fs-5 fw-bold">
                    Profile <span className="mx-1 text-muted fw-light fs-6 my-1">{">"}</span> {activeProfile} <span className="mx-1 text-muted fw-light fs-6 my-1">{">"}</span> {activeOption}
                  </MDBTypography>
                  <Search
                    searchQuery={searchQuery}
                    setSearchQuery={(value) => {
                      if (value === "") {
                        setSearchResults([]);
                        setSearchQuery("");
                      }
                    }}
                    handleSearch={handleSearch}
                  />
                </div>
                <div className="d-flex action-wrapper">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={onClear}
                    style={{ minWidth: "fit-content" }}
                  >
                    Clear All
                  </button>
                  <div className="action-wrapper">
                    <MDBTooltip
                      tag="div"
                      title="Please enter quantity"
                      className="d-flex"
                    >
                      <button
                        style={{ flex: "1 1 auto", width: "100%" }}
                        className="btn btn-primary"
                        onClick={onConfirmation}
                        disabled={
                          !Object.values(quantities).some((q) => q.quantity > 0)
                        }
                      >
                        Save All
                      </button>
                    </MDBTooltip>
                  </div>
                </div>
              </div>
              <h6 className="scroll-right">
                Scroll right{" "}
                <MDBIcon
                  fas
                  icon="angle-double-right"
                  style={{ color: "#3b71ca" }}
                />
              </h6>
              <div className="table-responsive">{renderTableContent()}</div>
            </MDBCardBody>
          </MDBCard>
        )}
      </div>
    );
  }
);

export default ProfileSelection;
