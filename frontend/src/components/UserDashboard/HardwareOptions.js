import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBInput,
  MDBIcon,
  MDBTooltip
} from "mdb-react-ui-kit";
import api from '../../utils/api';
import { clearSelectedProducts, setActiveOption } from "../../redux/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ImageZoom from "./ImageZoom";
import Search from '../Search';
import { fetchProductsFailure, fetchProductsStart, fetchProductsSuccess } from "../../redux/hardwareSlice";

const ProfileSelection = forwardRef(({ onProductSelect, selectedHardwares }, ref) => {
  const { activeOption } = useSelector((state) => state.selection);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const dispatch = useDispatch();
  const { data: hardwareData } = useSelector((state) => state.hardwares);

  const productsToDisplay = searchResults.length > 0
    ? searchResults
    : hardwareData?.products?.[activeOption];

  useEffect(() => {
    fetchProducts();
  }, [dispatch]);

  const fetchProducts = async () => {
    dispatch(fetchProductsStart());
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.get("https://api.glazia.in/api/admin/getHardwares", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProductsSuccess(response.data));
    } catch (err) {
      dispatch(fetchProductsFailure("Failed to fetch products"));
    }
  };

  useImperativeHandle(ref, () => ({
    fetchProducts,
  }));

  useEffect(() => {
    if (Object.keys(hardwareData).length > 0) {
      if(!hardwareData?.options?.includes(activeOption)) {
        dispatch(setActiveOption(hardwareData?.options[0]));
      }
    }
  }, [hardwareData]);
  
  useEffect(() => {
    if (!selectedHardwares || selectedHardwares.length === 0) {
      setQuantities((prev) => {
        // if (Object.keys(prev).length > 0) {
        //   onProductSelect([]);
        // }
        return {}; // Clear quantities
      });
    } else {
      const updatedQuantities = {};
      selectedHardwares.forEach((element) => {
        updatedQuantities[`${element.option}-${element.id}`] = {
          profile: element.profile,
          option: element.option,
          id: element.id,
          quantity: element.quantity || 0,
        };
      });
      setQuantities(updatedQuantities);
    }
  }, [selectedHardwares, onProductSelect]);
  
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

  const handleQuantityChange = (option, id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [`${option}-${id}`]: {
        option,
        id,
        quantity: parseInt(value, 10) || 0,
      },
    }));
  };

  const onConfirmation = () => {
    const selectedProducts = Object.values(quantities)
      .filter((item) => item.quantity > 0)
      .map(({ profile, option, id, quantity }) => {
        const product = hardwareData?.products[option]?.find(
          (prod) => prod.id === id
        );
        return {
          ...product,
          profile,
          option,
          quantity,
          rate: product.rate,
          amount: product.rate*quantity
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
        {hardwareData?.options?.map((option) => (
          <MDBTabsItem key={option}>
            <MDBTabsLink
              active={activeOption === option}
              onClick={() =>  dispatch(setActiveOption(option))}
            >
              {option}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>
        <hr/>

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
                  Hardware {'>'} {activeOption}
                </MDBTypography>
                <Search searchQuery={searchQuery} setSearchQuery={searchProduct} handleSearch={handleSearch} />
              </div>
              <div className="d-flex action-wrapper">
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClear}
                  disabled={!selectedHardwares.length}
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
                    <th>Sub Category</th>
                    <th>Perticular</th>
                    <th>Rate</th>
                    <th>MOQ</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                {productsToDisplay?.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>
                      {product.image !== '' ? <ImageZoom productImage={product.image} /> : 'N.A'}
                    </td>
                    <td>{product.sapCode}</td>
                    <td>{product.subCategory}</td>
                    <td>{product?.perticular}</td>
                    <td>{'₹' + product.rate}</td>
                    <td>{product.moq}</td>
                    <td>
                      <MDBInput
                        type="number"
                        min="0"
                        value={quantities[`${activeOption}-${product.id}`]?.quantity || ""}
                        onChange={(e) => handleQuantityChange(activeOption, product.id, e.target.value)}
                        size="sm"
                        style={{ minWidth: '80px' }}
                      />
                    </td>
                    <td>
                      <MDBInput
                        disabled
                        type="number"
                        value={(quantities[`${activeOption}-${product.id}`]?.quantity || 0) * (product.rate || 0)}
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
