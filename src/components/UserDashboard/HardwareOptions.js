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
  MDBTooltip,
  MDBBtn
} from "mdb-react-ui-kit";
import api, { BASE_API_URL } from '../../utils/api';
import { clearSelectedProducts, setActiveOption } from "../../redux/selectionSlice";
import { useDispatch, useSelector } from "react-redux";
import ImageZoom from "./ImageZoom";
import Search from '../Search';
import { fetchProductsFailure, fetchProductsStart, setHardwareProducts } from "../../redux/hardwareSlice";

const ProfileSelection = forwardRef(({ onProductSelect, onRemoveProduct, selectedHardwares }, ref) => {
  const { productsByOption } = useSelector((state) => state.selection);
  
  const selectedProducts = Object.values(productsByOption).flat();
  const { activeOption } = useSelector((state) => state.selection);
  const [quantities, setQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { hardwareHeirarchy } = useSelector((state) => state.heirarchy);
  const { products: hardwareData } = useSelector((state) => state.hardwares);
  const [searchResults, setSearchResults] = useState(null);

  const dispatch = useDispatch();

  const productsToDisplay = searchResults?.length > 0
    ? searchResults
    : hardwareData?.[activeOption];

  useEffect(() => {
    if(hardwareHeirarchy.includes(activeOption) && !hardwareData?.[activeOption]) {
      fetchProducts(activeOption);
    }
  }, [activeOption]);

  const fetchProducts = async (reqOption) => {
    dispatch(fetchProductsStart());
    const token = localStorage.getItem("authToken");
    try {
      const response = await api.get(
        `${BASE_API_URL}/admin/getHardwares?reqOption=${encodeURIComponent(reqOption)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      dispatch(setHardwareProducts({ option: activeOption, payload: response.data.products[activeOption] }));
      
    } catch (err) {
      dispatch(fetchProductsFailure("Failed to fetch products"));
    }
  };

  useImperativeHandle(ref, () => ({
    fetchProducts,
  }));

  useEffect(() => {
    dispatch(setActiveOption(hardwareHeirarchy[0]));
  }, [hardwareHeirarchy]);
  
  useEffect(() => {
    if (!selectedHardwares || selectedHardwares.length === 0) {
      setQuantities((prev) => {
        return {};
      });
    } else {
        setQuantities((prevQuantities) => {
          const updatedQuantities = { ...prevQuantities };
    
          selectedHardwares.forEach((element) => {
            const key = `${element.option}-${element.id}`;
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
  }, [selectedHardwares, onProductSelect]);
  
  const handleSearch = async (query) => {
    setSearchResults(null);
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.get(`${BASE_API_URL}/admin/search-hardware`, {
        params: { sapCode: query, perticular: query, option: activeOption },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResults(response.data.products);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
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
        const product = hardwareData[option]?.find(
          (prod) => prod.id === id
        );
        return {
          ...product,
          profile,
          option,
          quantity,
          rate: product?.rate,
          amount: product?.rate*quantity
        };
      });

    onProductSelect(selectedProducts);
  };

  const onConfirmRow = (product) => {
    const key = `${activeOption}-${product.id}`;
    const selectedProduct = {
      ...product,
      option: activeOption,
      id: product.id,
      quantity: quantities[key]?.quantity || 0,
      rate: product?.rate,
      amount: (quantities[`${activeOption}-${product.id}`]?.quantity || 0) * (product?.rate || 0)
    };
  
    if (selectedProduct.quantity > 0) {
      onProductSelect(selectedProduct);
    } else {
      alert("Please enter a valid quantity before confirming.");
    }
  };

  const onCancelRow = (product) => {
    const key = `${activeOption}-${product.id}`;
    onRemoveProduct(product?.sapCode);
    delete quantities[key];
    setQuantities(quantities);
  };

  const onClear = () => {
    dispatch(clearSelectedProducts({option: 'hardware'}));
  };

  const renderCardContent = () => {
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

  if (!productsToDisplay || productsToDisplay?.length === 0) {
    return (
      <div className="text-center p-4">
        <MDBTypography tag="h5" className="text-muted">
          <MDBIcon far icon="folder-open" className="me-2" />
          No products available for this category
        </MDBTypography>
        <p className="text-muted mt-2">
          Please select a different category or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="row">
      {productsToDisplay?.map((product, index) => {
        const key = `${activeOption}-${product.id}`;
        const quantity = quantities[key]?.quantity || 0;
        const isSelected = selectedProducts.find((sp) => sp.sapCode === product.sapCode);

        return (
          <div className="col-md-4 mb-3" key={product.id}>
            <MDBCard className="h-100 shadow-sm">
              {/* Image */}
              <div className="card-img-top d-flex justify-content-center align-items-center p-3">
                {product.image !== '' ? <ImageZoom imageWidth="200px" productImage={product.image} /> : 'N.A'}
              </div>

              {/* Card Body */}
              <MDBCardBody>
                <h6 className="fw-bold" style={{textAlign: 'center'}}>SAP Code: {product.sapCode}</h6>
                

                <div className="grid mb-3" style={{fontSize: '0.9rem'}}>
                  <p className="grid-col-2 mb-1"><strong>Sub Category:</strong> {product.subCategory}</p>
                  <p className="grid-col-2 mb-1"><strong>Perticular:</strong> {product.perticular}</p>
                  <p className="grid-col-2 mb-1"><strong>Rate:</strong> ₹{product.rate}</p>
                  <p className="grid-col-2 mb-1"><strong>MOQ:</strong> {product.moq}</p>
                  <p className="grid-col-2 mb-1"><strong>Amount:</strong> ₹{quantity * (product.rate || 0)}</p>
                </div>
                

                {/* Quantity Control */}
                <div className="d-flex align-items-center mb-3">
                  <MDBBtn
                    color="link"
                    size="sm"
                    className="d-flex align-items-center justify-content-center px-2"
                    onClick={() =>
                      handleQuantityChange(activeOption, product.id, Math.max(0, quantity - 1).toString())
                    }
                  >
                    <MDBIcon fas icon="minus" />
                  </MDBBtn>

                  <MDBInput
                    type="number"
                    min="0"
                    value={quantity || ""}
                    onChange={(e) => handleQuantityChange(activeOption, product.id, e.target.value)}
                    size="sm"
                    style={{ width: "60px", textAlign: "center" }}
                    className="mx-1"
                  />

                  <MDBBtn
                    color="link"
                    size="sm"
                    className="d-flex align-items-center justify-content-center px-2"
                    onClick={() =>
                      handleQuantityChange(activeOption, product.id, (quantity + 1).toString())
                    }
                  >
                    <MDBIcon fas icon="plus" />
                  </MDBBtn>
                </div>

                {/* Action Buttons */}
                {!isSelected ? (
                  <MDBBtn
                    disabled={!quantity}
                    onClick={() => onConfirmRow(product)}
                    className="w-100"
                  >
                    Save
                  </MDBBtn>
                ) : (
                  <MDBBtn
                    color="danger"
                    onClick={() => onCancelRow(product)}
                    className="w-100"
                  >
                    X
                  </MDBBtn>
                )}
              </MDBCardBody>
            </MDBCard>
          </div>
        );
      })}
    </div>
  );
};

  return (
    <>
      <MDBTabs className="mb-4">
        {hardwareHeirarchy?.map((option) => (
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
      {/* <hr/> */}

      {activeOption && (
        <>
            <div 
              className="table-controller d-flex justify-content-between align-items-center mb-3 sticky-top table-responsive"
              style={{ 
                top: "0", 
                zIndex: 1 
              }}
            >
              <div className="table-controller d-flex align-items-center">
                <MDBTypography tag="h5" className="mb-0 me-3">
                  Hardware {'>'} {activeOption}
                </MDBTypography>
                <Search 
                  searchQuery={searchQuery} 
                  setSearchQuery={(value) => {
                    if (value === '') {
                      setSearchResults([]);
                      setSearchQuery('');
                    }
                  }} 
                  handleSearch={handleSearch} 
                />
              </div>
              <div className="d-flex action-wrapper">
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClear}
                  style={{minWidth: 'fit-content'}}
                >
                  Clear
                </button>
                <div className="action-wrapper">
                  <MDBTooltip tag='div' title='Please enter quantity' className="d-flex">
                    <button 
                      style={{ flex: '1 1 auto', width: '100%' }}
                      className="btn btn-primary"
                      onClick={onConfirmation}
                      disabled={!Object.values(quantities).some((q) => q.quantity > 0)}
                    >
                      Confirm
                    </button>
                  </MDBTooltip>
                </div>
              </div>
            </div>
            <h6 className="scroll-right">Scroll right <MDBIcon fas icon="angle-double-right" style={{color: '#3b71ca'}}/></h6>
            
          {renderCardContent()}
          </>
      )}
    </>
  );
});

export default ProfileSelection;