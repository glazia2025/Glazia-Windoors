import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBTypography } from 'mdb-react-ui-kit';
import Nalco from './Nalco';

const NalcoDemo = () => {
  return (
    <MDBContainer className="mt-4">
      <MDBRow>
        <MDBCol md="12">
          <MDBCard className="mb-4">
            <MDBCardBody>
              <MDBTypography tag="h3" className="mb-3">
                Enhanced NALCO Component Demo
              </MDBTypography>
              
              <div className="mb-4">
                <MDBTypography tag="h5" className="mb-3">Features:</MDBTypography>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Interactive Price Card:</strong> Click to view detailed price graph
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Real-time Graph:</strong> Displays price trends with timestamp data
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Mobile Responsive:</strong> Optimized for all screen sizes
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Date Range Display:</strong> Shows visible range of graph data
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Price Statistics:</strong> Highest, lowest, and current prices
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Recent Data Table:</strong> Last 10 price entries in tabular format
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Keyboard Accessible:</strong> Full keyboard navigation support
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    <strong>Loading States:</strong> Smooth loading animations
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <MDBTypography tag="h5" className="mb-3">API Integration:</MDBTypography>
                <div className="bg-light p-3 rounded">
                  <p className="mb-2">
                    <strong>Current Price API:</strong> <code>/admin/get-nalco</code>
                  </p>
                  <p className="mb-2">
                    <strong>Graph Data API:</strong> <code>/admin/get-nalco-graph</code>
                  </p>
                  <p className="mb-0">
                    <strong>Expected Response:</strong> Array of objects with <code>timestamp</code> and <code>price</code> fields
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <MDBTypography tag="h5" className="mb-3">Mobile Responsive Features:</MDBTypography>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="fas fa-mobile-alt text-primary me-2"></i>
                        Adaptive chart sizing
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-mobile-alt text-primary me-2"></i>
                        Touch-friendly interactions
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-mobile-alt text-primary me-2"></i>
                        Optimized modal layout
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="fas fa-tablet-alt text-info me-2"></i>
                        Responsive table design
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-tablet-alt text-info me-2"></i>
                        Flexible grid layout
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-tablet-alt text-info me-2"></i>
                        Smooth animations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="fas fa-info-circle me-2"></i>
                  How to Test:
                </h6>
                <ol className="mb-0">
                  <li>Click on the NALCO price card below</li>
                  <li>View the interactive price graph in the modal</li>
                  <li>Check the date range and price statistics</li>
                  <li>Scroll through the recent data table</li>
                  <li>Test on different screen sizes for responsiveness</li>
                  <li>Try keyboard navigation (Tab + Enter/Space)</li>
                </ol>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

      <MDBRow>
        <MDBCol md="6" className="mx-auto">
          <MDBTypography tag="h4" className="text-center mb-3">
            Live NALCO Component
          </MDBTypography>
          <Nalco isLogin={true} />
        </MDBCol>
      </MDBRow>

      <MDBRow className="mt-4">
        <MDBCol md="12">
          <MDBCard>
            <MDBCardBody>
              <MDBTypography tag="h5" className="mb-3">
                Technical Implementation Details:
              </MDBTypography>
              
              <div className="row">
                <div className="col-md-6">
                  <h6>Chart Features:</h6>
                  <ul className="small">
                    <li>Custom HTML5 Canvas implementation</li>
                    <li>Responsive scaling and aspect ratio</li>
                    <li>Interactive data points</li>
                    <li>Grid lines and axis labels</li>
                    <li>Price range visualization</li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h6>Responsive Design:</h6>
                  <ul className="small">
                    <li>CSS Grid and Flexbox layout</li>
                    <li>Media queries for breakpoints</li>
                    <li>Touch-optimized interactions</li>
                    <li>Scalable typography</li>
                    <li>Adaptive spacing and padding</li>
                  </ul>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-6">
                  <h6>Accessibility:</h6>
                  <ul className="small">
                    <li>ARIA labels and roles</li>
                    <li>Keyboard navigation support</li>
                    <li>Focus management</li>
                    <li>Screen reader compatibility</li>
                    <li>High contrast support</li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h6>Performance:</h6>
                  <ul className="small">
                    <li>Efficient canvas rendering</li>
                    <li>Optimized API calls</li>
                    <li>Lazy loading of graph data</li>
                    <li>Smooth animations</li>
                    <li>Memory-efficient state management</li>
                  </ul>
                </div>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default NalcoDemo;
