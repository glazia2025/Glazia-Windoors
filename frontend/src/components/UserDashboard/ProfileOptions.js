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
  MDBBtn,
  MDBIcon,
  MDBTooltip,
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedProducts,
  setActiveOption,
  setActiveProfile,
} from "../../redux/selectionSlice";
import {
  fetchProductsFailure,
  fetchProductsStart,
  fetchProductsSuccess,
} from "../../redux/profileSlice";
import api, { BASE_API_URL } from "../../utils/api";
import Search from "../Search";
import ImageZoom from "./ImageZoom";
import itemImg from "./product_image.jpeg";
import "./ProfileOptions.css";

const ProfileOptions = forwardRef(
  ({ onProductSelect, selectedProfiles, onRemoveProduct }, ref) => {
    const dispatch = useDispatch();
    const { activeProfile, activeOption, productsByOption } = useSelector(
      (state) => state.selection
    );
    const { data: profileData } = useSelector((state) => state.profiles);

    const selectedProducts = Object.values(productsByOption).flat();
    const [quantities, setQuantities] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    const productsToDisplay = searchQuery
      ? searchResults
      : profileData[activeProfile]?.products[activeOption] || [];

    // fetch products
    const fetchProducts = async () => {
      dispatch(fetchProductsStart());
      const token = localStorage.getItem("authToken");
      try {
        const response = await api.get(`${BASE_API_URL}/user/getProducts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(fetchProductsSuccess(response.data.categories));
      } catch (err) {
        dispatch(fetchProductsFailure("Failed to fetch products"));
      }
    };

    useEffect(() => {
      fetchProducts();
    }, []);

    useImperativeHandle(ref, () => ({
      fetchProducts,
    }));

    useEffect(() => {
      if (Object.keys(profileData).length > 0) {
        const firstProfile = Object.keys(profileData)[0];
        dispatch(setActiveProfile(firstProfile));
        dispatch(setActiveOption(profileData[firstProfile]?.options[0]));
      }
    }, [profileData]);

    useEffect(() => {
      if (!selectedProfiles || selectedProfiles.length === 0) {
        setQuantities({});
      } else {
        setQuantities((prevQuantities) => {
          const updated = { ...prevQuantities };
          selectedProfiles.forEach((el) => {
            const key = `${el.profile}-${el.option}-${el.id}`;
            updated[key] = {
              profile: el.profile,
              option: el.option,
              id: el.id,
              quantity: el.quantity ?? prevQuantities[key]?.quantity ?? 0,
            };
          });
          return updated;
        });
      }
    }, [selectedProfiles]);

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
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(response.data.products);
      } catch (err) {
        console.error("Error searching products:", err);
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

    const onConfirmRow = (product) => {
      const key = `${activeProfile}-${activeOption}-${product.id}`;
      const selectedProduct = {
        ...product,
        profile: activeProfile,
        option: activeOption,
        quantity: quantities[key]?.quantity || 0,
        rate: profileData[activeProfile]?.rate[activeOption] || 0,
        amount:
          (quantities[key]?.quantity || 0) *
          (profileData[activeProfile]?.rate[activeOption] || 0),
      };
      if (selectedProduct.quantity > 0) {
        onProductSelect(selectedProduct);
      } else {
        alert("Please enter a valid quantity before saving.");
      }
    };

    const onCancelRow = (product) => {
      const key = `${activeProfile}-${activeOption}-${product.id}`;
      onRemoveProduct(product?.sapCode);
      const updated = { ...quantities };
      delete updated[key];
      setQuantities(updated);
    };

    const onClear = () => {
      dispatch(clearSelectedProducts({ option: "profile" }));
      setQuantities({});
    };

    return (
      <div className="profile-selection">
        {/* Profile Tabs */}
        <MDBTabs className="mb-4 gap-2">
          {Object.keys(profileData).map((profile) => (
            <MDBTabsItem key={profile}>
              <MDBTabsLink
                style={{ borderRadius: "5px" }}
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

        {/* Option Tabs */}
        {activeProfile && (
          <MDBTabs className="mb-4 gap-2">
            {profileData[activeProfile]?.options.map((option) => (
              <MDBTabsItem key={option}>
                <MDBTabsLink
                  style={{ borderRadius: "5px" }}
                  active={activeOption === option}
                  onClick={() => dispatch(setActiveOption(option))}
                >
                  {option}
                </MDBTabsLink>
              </MDBTabsItem>
            ))}
          </MDBTabs>
        )}

        {/* Search + Actions */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Search
            searchQuery={searchQuery}
            setSearchQuery={(val) => {
              if (val === "") {
                setSearchResults([]);
                setSearchQuery("");
              }
            }}
            handleSearch={handleSearch}
          />
          <div className="d-flex">
            <button className="btn btn-secondary me-2" onClick={onClear}>
              Clear
            </button>
            <MDBTooltip tag="div" title="Confirm selected quantities">
              <button
                className="btn btn-primary"
                disabled={!Object.values(quantities).some((q) => q.quantity > 0)}
                onClick={() =>
                  onProductSelect(
                    Object.values(quantities)
                      .filter((q) => q.quantity > 0)
                      .map((q) => {
                        const product = productsToDisplay.find(
                          (p) => p.id === q.id
                        );
                        return {
                          ...product,
                          profile: q.profile,
                          option: q.option,
                          quantity: q.quantity,
                          rate: profileData[q.profile]?.rate[q.option] || 0,
                          amount:
                            q.quantity *
                            (profileData[q.profile]?.rate[q.option] || 0),
                        };
                      })
                  )
                }
              >
                Confirm
              </button>
            </MDBTooltip>
          </div>
        </div>

        {/* Product Cards */}
        <div className="row">
          {productsToDisplay?.map((product) => (
            <div className="col-md-4 mb-3" key={product.id}>
              <div className="card h-100 shadow-2-md hover-shadow-lg">
                <div className="card-img-top d-flex justify-content-center align-items-center p-3">
                  <ImageZoom productImage={product.image || itemImg} imageWidth="200px" />
                </div>
                <MDBTypography
                  style={{ textAlign: "center" }}
                  tag="h5"
                  className="px-2"
                >
                  {product.description}
                </MDBTypography>

                <div className="card-body">
                  <p>
                    <strong>Rate:</strong> ₹
                    {profileData[activeProfile]?.rate[activeOption]}
                  </p>
                  <p>
                    <strong>SAP Code:</strong> {product.sapCode}
                  </p>
                  <p>
                    <strong>Per:</strong> {product.per}
                  </p>
                  <p>
                    <strong>Kg/m:</strong> {product.kgm}
                  </p>
                  <p>
                    <strong>Length:</strong> {product.length} mm
                  </p>
                </div>

                <div className="card-footer d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <MDBBtn
                      color="link"
                      size="sm"
                      className="px-2"
                      onClick={() => {
                        const current =
                          quantities[
                            `${activeProfile}-${activeOption}-${product.id}`
                          ]?.quantity || 0;
                        handleQuantityChange(
                          activeProfile,
                          activeOption,
                          product.id,
                          Math.max(0, current - 1).toString()
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
                      style={{ width: "60px", textAlign: "center" }}
                      className="mx-1 hide-spin-buttons"
                    />

                    <MDBBtn
                      color="link"
                      size="sm"
                      className="px-2"
                      onClick={() => {
                        const current =
                          quantities[
                            `${activeProfile}-${activeOption}-${product.id}`
                          ]?.quantity || 0;
                        handleQuantityChange(
                          activeProfile,
                          activeOption,
                          product.id,
                          (current + 1).toString()
                        );
                      }}
                    >
                      <MDBIcon fas icon="plus" />
                    </MDBBtn>
                  </div>

                  {!selectedProducts.find(
                      (sp) => (sp.sapCode === product.sapCode)&& (sp.quantity === quantities[`${activeProfile}-${activeOption}-${product.id}`]?.quantity)
                    ) && (
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
                    )}
                    {selectedProducts.find(
                      (sp) => (sp.sapCode === product.sapCode)
                    ) && (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default ProfileOptions;
