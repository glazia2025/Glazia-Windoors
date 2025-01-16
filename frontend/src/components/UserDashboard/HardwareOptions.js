import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBInput,
} from "mdb-react-ui-kit";
import axios from "axios";
import api from '../../utils/api';
import { clearSelectedProducts } from "../../redux/selectionSlice";
import { useDispatch } from "react-redux";
import ImageZoom from "./ImageZoom";
import itemImg from './product_image.jpeg';
import Search from '../Search';

const ProfileSelection = ({ onProductSelect, selectedHardwares }) => {
  const [quantities, setQuantities] = useState({});
  const [hardwareData, setHardwareData] = useState({});
  const [activeOption, setActiveOption] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const dispatch = useDispatch();

  const productsToDisplay = searchResults.length > 0
    ? searchResults
    : hardwareData?.products?.[activeOption];

  useEffect(() => {
    const fetchProducts = async () => {
        const token = localStorage.getItem('authToken'); 
        try {
            const response = await api.get('http://localhost:5000/api/admin/getHardwares', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }); 
              setHardwareData(response.data);
        } catch (err) {
            // setError('Failed to fetch products');
            // setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (Object.keys(hardwareData).length > 0) {
      setActiveOption(hardwareData?.options[0]);
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
      const response = await api.get('http://localhost:5000/api/admin/search-hardware', {
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
          rate: product.rate
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
              onClick={() => setActiveOption(option)}
            >
              {option}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>
        <hr/>

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
                  disabled={!selectedHardwares.length}
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
                  <th>Sub Category</th>
                  <th>Perticular</th>
                  <th>Rate</th>
                  <th>MOQ</th>
                  <th>Quantity</th>
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
                  <td>{product.subCategory}</td>
                  <td>{product?.perticular}</td>
                  <td>{product.rate}</td>
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
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
};

export default ProfileSelection;
