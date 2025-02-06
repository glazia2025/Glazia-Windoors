import React, { useState, useEffect, useRef } from "react";
import { MDBRow, MDBCol, MDBBtn, MDBIcon, MDBTooltip } from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";

import ProfileOptions from "./ProfileOptions";
import HardwareOptions from "./HardwareOptions";
import AccessoriesOptions from "./AcessoriesOptions";
import logo from "./glazia_logo.png";
import { addSelectedProducts } from "../../redux/selectionSlice";
import { setUser } from "../../redux/userSlice";
import api from "../../utils/api";

import "./SelectionContainer.css";
import Nalco from "./Nalco/Nalco";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SelectionContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profileOptionsRef = useRef();
  const hardwareOptionsRef = useRef();

  const { user } = useSelector((state) => state.user);
  const { selectedOption, productsByOption } = useSelector((state) => state.selection);
  const [isSliderOpen, setIsSliderOpen] = useState(false); // State for slider visibility

  // Aggregate products from all options
  const selectedProducts = Object.values(productsByOption).flat();

  const canvasRef = useRef(null);
  const prevSelectedProducts = useRef([]);

  useEffect(() => {
    if (!selectedProducts?.length) {
      generatePDFPreview();
    }
  }, [selectedProducts]);

  useEffect(() => {
    if (selectedProducts.length > 0 && (selectedProducts.length !== prevSelectedProducts.current.length)) {
      generatePDFPreview();
    }
    prevSelectedProducts.current = selectedProducts;
  }, [selectedProducts]);

  useEffect(() => {
    if (!user) authenticateUser();
  }, []);

  const authenticateUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return navigate('/admin/login');
    try {
      const { data } = await api.get('/admin/getUser', { headers: { Authorization: `Bearer ${token}` } });
      dispatch(setUser(data.user));
    } catch {
      navigate('/admin/login');
    }
  };

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileOptions ref={profileOptionsRef} onProductSelect={onProductSelect} selectedProfiles={productsByOption.profile}/>;
      case "hardware":
        return <HardwareOptions ref={hardwareOptionsRef} onProductSelect={onProductSelect} selectedHardwares={productsByOption.hardware}/>;
      case "accessories":
        return <AccessoriesOptions onProductSelect={onProductSelect} selectedAccessories={productsByOption.accessories}/>;
      default:
        return <p>Please select an option.</p>;
    }
  };

  const onProductSelect = (products) => {
    dispatch(
      addSelectedProducts({
        option: selectedOption,
        products,
      })
    );
  };

  const generatePDFPreview = () => {
    const doc = createProformaInvoice();
    const pdfOutput = doc.output("datauristring");
    renderPDF(pdfOutput);
  };

  const currentRenderTask = useRef(null);

  const renderPDF = async (pdfData) => {
    const loadingTask = pdfjs.getDocument(pdfData);

    try {
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const containerWidth = canvas.parentNode.clientWidth;
      const viewport = page.getViewport({ scale: containerWidth / page.getViewport({ scale: 1 }).width });

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Clear previous content
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Cancel any ongoing render task
      if (currentRenderTask.current) {
        currentRenderTask.current.cancel();
      }

      // Start new render task
      currentRenderTask.current = page.render({ canvasContext: context, viewport: viewport });

      // Wait for the render to finish
      await currentRenderTask.current.promise;
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  };

  const registerUserProducts = async (user, selectedProducts) => {
    try {
      const orderPayload = {
        user: {
          name: user.name,
          city: user.city,
          phoneNumber: user.phoneNumber,
        },
        products: selectedProducts.map((product) => ({
          productId: product.sapCode,
          description: product.description || product.perticular,
          quantity: product.quantity,
          amount: product.amount,
        })),
      };
      
      const token = localStorage.getItem('authToken');
  
      await api.post('https://api.glazia.in/api/admin/pi-generate', {
        ...orderPayload
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Order created successfully.');
    } catch (error) {
      console.error('Error creating order:', error.response?.data?.message || error.message);
    }
  };  

  const generatePDF = () => {
    const doc = createProformaInvoice();
    registerUserProducts(user, selectedProducts);

    doc.save("Galzia Performa Invoice.pdf");
  };

  const createProformaInvoice = () => {
    const doc = new jsPDF();
  
    // Add logo and company details
    doc.setFontSize(16);
    doc.text("PROFORMA INVOICE", 105, 15, { align: "center" });
    doc.addImage(logo, "PNG", 15, 30, 50, 20);
    doc.setFontSize(12);
    doc.text("Glazia Windoors Pvt Ltd.", 70, 30);
    doc.text("Shop in H. No. 275 G/F, Near Talab, Ghitorni, M G Road,", 70, 35);
    doc.text("New Delhi - 110030 (India)", 70, 40);
    doc.text("Phone: 6388406765, 9958053708", 70, 45);
    doc.text("Email: sales@glazia.com", 70, 50);
  
    // Invoice details
    doc.text("Order No: 001", 15, 60);
    const today = new Date();
    const dateString = today.toLocaleDateString('en-GB'); // Formats date as dd-mm-yyyy

    doc.text(`Dated: ${dateString}`, 50, 60);
    doc.text("Supplier's Ref: N.A", 15, 70);
    // doc.text("Despatch Through: 10-jan-2025", 15, 80);
    doc.text("Destination: Gurgaon", 15, 90);
    doc.text("Terms of Delivery: N.A", 15, 100);
  
    // Add table with selected products
    doc.autoTable({
      startY: 110,
      head: [
        [
          "S.No.",
          "Description of Goods",
          "SAP Code",
          "Quantity",
          "Price",
          "Per",
          "Amount",
        ],
      ],
      body: selectedProducts.map((product, index) => [
        index + 1,
        product.description || product.perticular,
        product.sapCode,
        product.quantity,
        product.rate,
        product.per || "Piece",
        (product.quantity * product.rate).toFixed(2),
      ]),
    });
  
    // Check space for totals
    let currentY = doc.lastAutoTable.finalY + 10;
    if (currentY + 30 > doc.internal.pageSize.height - 10) {
      doc.addPage(); // Add a new page if there's not enough space
      currentY = 10;
    }
  
    // Add totals
    const subtotal = selectedProducts.reduce(
      (total, product) => total + product.quantity * product.rate,
      0
    );
    const gst = subtotal * 0.18; // 18% GST
    const netAmount = subtotal + gst;
  
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 15, currentY);
    doc.text(`GST @ 18%: ₹${gst.toFixed(2)}`, 15, currentY + 10);
    doc.text(`Net Amount: ₹${netAmount.toFixed(2)}`, 15, currentY + 20);
  
    // Add bank details
    currentY += 50;
    if (currentY + 20 > doc.internal.pageSize.height - 10) {
      doc.addPage(); // Add a new page for bank details if needed
      currentY = 10;
    }
    doc.text("OUR BANK DETAILS:", 15, currentY);
    doc.text(
      "Glazia Windoors Pvt Ltd, Axis Bank, IFSC: 00202030GJSS, AC No: 82837539293740",
      15,
      currentY + 10
    );
  
    return doc;
  };
  
  const setSlider = () => {
    if(currentRenderTask.current && selectedProducts.length > 0) {
      currentRenderTask.current.cancel();
      generatePDFPreview();
    }
    setIsSliderOpen(true);
  }

  const clearCurrentPdfView = () => {
    if(currentRenderTask.current) {
      currentRenderTask.current.cancel();
    }
    setIsSliderOpen(false)
  }

  return (
    <MDBRow className="pdf-row-wrapper">
      <MDBCol className="main-selectors" style={{minWidth: '70%'}}>
        <MDBRow className="d-flex justify-content-between align-items-end">
          <MDBCol className="btns-container w-100 justify-content-between">
            <MDBRow>
              <h1 style={{ width: 'max-content' }}>
                 Welcome to Glazia Windoors
              </h1>
            </MDBRow>
            <MDBRow className="d-flex justify-content-between align-items-center">
              <h4 style={{ width: 'max-content' }}>
                Please select the categories <MDBIcon fas icon="check-circle" />
              </h4>
              <div style={{ width: 'max-content' }}>
                <MDBTooltip tag="span" wrapperClass="d-inline-block" title="Please add products">
                  <MDBBtn
                    className="download-pdf"
                    disabled={selectedProducts.length === 0}
                    onClick={generatePDF}
                  >
                    <MDBIcon fas icon="cloud-download-alt" />&nbsp; Download pdf
                  </MDBBtn>
                </MDBTooltip>
                <MDBBtn style={{ width: 'max-content', marginLeft: '10px' }} onClick={setSlider}>
                  <MDBIcon fas icon="expand" />&nbsp; Expand PI
                </MDBBtn>
              </div>
            </MDBRow>

            <MDBRow className="d-flex" style={{ marginTop: '20px' }}>
              <MDBCol md="auto" className="mb-3" style={{ flex: '1 1 auto' }}>
                <MDBBtn
                  style={{ width: '100%' }}
                  size="lg"
                  color={selectedOption === 'profile' ? 'primary' : 'light'}
                  onClick={() => dispatch({ type: 'selection/setSelectedOption', payload: 'profile' })}
                >
                  Profile
                </MDBBtn>
              </MDBCol>
              <MDBCol md="auto" className="mb-3" style={{ flex: '1 1 auto' }}>
                <MDBBtn
                  style={{ width: '100%' }}
                  size="lg"
                  color={selectedOption === 'hardware' ? 'primary' : 'light'}
                  onClick={() => dispatch({ type: 'selection/setSelectedOption', payload: 'hardware' })}
                >
                  Hardware
                </MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBCol>

          <MDBCol md="auto" className="nalco-rate">
            <Nalco />
          </MDBCol>
        </MDBRow>


        <MDBRow>
          <MDBCol md="12" className="mt-4">
            <div>{renderSelectedComponent()}</div>
          </MDBCol>
        </MDBRow>
      </MDBCol>

      {selectedProducts.length > 0 && (
        <MDBCol
          className="mt-3"
          style={{
            flex: "1 1 auto",
            width: "100%", // Ensure the column spans the full width
            maxWidth: "100%", // Avoid limiting the maximum width
            borderLeft: "1px solid #ddd",
          }}
        >
          <div
            style={{
              padding: "10px",
              height: "100%",
              position: "fixed", // Fixed positioning might need adjustments
              top: "50%",
              transform: 'translate(0%, -40%)'
            }}
          >
            <canvas
              key={selectedProducts.length}
              ref={canvasRef}
              style={{
                width: "100%", // Full width within its container
                height: "auto", // Maintain aspect ratio
                background: "#fff",
                display: "block", // Prevent extra margin from inline elements
              }}
            />
          </div>
        </MDBCol>
      )}

      {isSliderOpen && <div className="overlay" onClick={() => clearCurrentPdfView()}></div>}
      {/* Slider component */}
      {isSliderOpen && (
        <div className="slider" style={{
          transform: isSliderOpen ? 'translateX(0)' : 'translateX(100%)',
        }}>
          <button onClick={() => setIsSliderOpen(false)} style={{
            position: 'absolute',
            top: '12%',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '30px',
          }}>×</button>
          <div>
            <canvas ref={canvasRef} style={{ width: '100%', backgroundColor: 'white', marginTop: '100px' }} />
          </div>
        </div>
      )}
    </MDBRow>
  );
};

export default SelectionContainer;
