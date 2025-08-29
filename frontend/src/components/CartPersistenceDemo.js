import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MDBBtn, MDBCard, MDBCardBody, MDBCardTitle, MDBContainer } from 'mdb-react-ui-kit';
import { 
  addSelectedProducts, 
  clearAllCartData,
  updateProductQuantity 
} from '../redux/selectionSlice';
import { 
  loadCartFromStorage, 
  hasCartItems, 
  getCartItemsCount 
} from '../utils/cartStorage';

const CartPersistenceDemo = () => {
  const dispatch = useDispatch();
  const { productsByOption } = useSelector(state => state.selection);
  const [storageInfo, setStorageInfo] = useState('');

  // Sample products for testing
  const sampleProducts = [
    {
      sapCode: 'DEMO001',
      description: 'Demo Aluminium Profile 1',
      rate: 100,
      quantity: 1,
      amount: '100.00',
      option: 'profile'
    },
    {
      sapCode: 'DEMO002', 
      description: 'Demo Hardware Item 1',
      rate: 50,
      quantity: 2,
      amount: '100.00',
      option: 'hardware'
    }
  ];

  useEffect(() => {
    // Check localStorage on component mount
    checkStorageStatus();
  }, [productsByOption]);

  const checkStorageStatus = () => {
    const savedData = loadCartFromStorage();
    const itemsCount = getCartItemsCount({ productsByOption });
    const hasItems = hasCartItems({ productsByOption });
    
    setStorageInfo(`
      Items in cart: ${itemsCount}
      Has items: ${hasItems}
      Saved data exists: ${savedData ? 'Yes' : 'No'}
      Last saved: ${savedData?.timestamp ? new Date(savedData.timestamp).toLocaleString() : 'Never'}
    `);
  };

  const addSampleProduct = (product) => {
    dispatch(addSelectedProducts({
      option: product.option,
      product: product
    }));
  };

  const updateQuantity = (product, newQuantity) => {
    dispatch(updateProductQuantity({
      option: product.option,
      sapCode: product.sapCode,
      quantity: newQuantity
    }));
  };

  const clearCart = () => {
    dispatch(clearAllCartData());
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <MDBContainer className="mt-4">
      <MDBCard>
        <MDBCardBody>
          <MDBCardTitle>Cart Persistence Demo</MDBCardTitle>
          
          <div className="mb-3">
            <h6>Current Cart Status:</h6>
            <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
              {storageInfo}
            </pre>
          </div>

          <div className="mb-3">
            <h6>Test Actions:</h6>
            <div className="d-flex gap-2 flex-wrap">
              <MDBBtn 
                size="sm" 
                color="primary"
                onClick={() => addSampleProduct(sampleProducts[0])}
              >
                Add Profile Item
              </MDBBtn>
              
              <MDBBtn 
                size="sm" 
                color="secondary"
                onClick={() => addSampleProduct(sampleProducts[1])}
              >
                Add Hardware Item
              </MDBBtn>
              
              <MDBBtn 
                size="sm" 
                color="warning"
                onClick={clearCart}
              >
                Clear Cart
              </MDBBtn>
              
              <MDBBtn 
                size="sm" 
                color="info"
                onClick={reloadPage}
              >
                Reload Page (Test Persistence)
              </MDBBtn>
            </div>
          </div>

          <div className="mb-3">
            <h6>Current Cart Items:</h6>
            {Object.entries(productsByOption).map(([option, products]) => (
              <div key={option} className="mb-2">
                <strong>{option.charAt(0).toUpperCase() + option.slice(1)}:</strong>
                {products.length === 0 ? (
                  <span className="text-muted ms-2">No items</span>
                ) : (
                  <ul className="mt-1">
                    {products.map((product, index) => (
                      <li key={index} className="d-flex align-items-center justify-content-between">
                        <span>
                          {product.description} - ₹{product.rate} x {product.quantity} = ₹{product.amount}
                        </span>
                        <div>
                          <MDBBtn 
                            size="sm" 
                            color="light"
                            onClick={() => updateQuantity(product, parseInt(product.quantity) - 1)}
                            disabled={parseInt(product.quantity) <= 1}
                            className="me-1"
                          >
                            -
                          </MDBBtn>
                          <span className="mx-2">{product.quantity}</span>
                          <MDBBtn 
                            size="sm" 
                            color="light"
                            onClick={() => updateQuantity(product, parseInt(product.quantity) + 1)}
                          >
                            +
                          </MDBBtn>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="alert alert-info">
            <strong>How to test persistence:</strong>
            <ol className="mb-0 mt-2">
              <li>Add some items to the cart using the buttons above</li>
              <li>Click "Reload Page" to refresh the browser</li>
              <li>Notice that your cart items are still there after reload!</li>
              <li>Open browser DevTools → Application → Local Storage to see the saved data</li>
            </ol>
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default CartPersistenceDemo;
