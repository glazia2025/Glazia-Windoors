import React, { useState, useEffect, useRef } from "react";
import "./SelectionContainer.css";
import { MDBRow, MDBCol, MDBBtn, MDBIcon } from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import ProfileOptions from "./ProfileOptions";
import HardwareOptions from "./HardwareOptions";
import AccessoriesOptions from "./AcessoriesOptions";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";
import logo from "./glazia_logo.png";
import { addSelectedProducts } from "../../redux/selectionSlice";
import axios from "axios";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const SelectionContainer = () => {
  const dispatch = useDispatch();
  const { selectedOption, productsByOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});
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
    const fetchProducts = async () => {
        const token = localStorage.getItem('authToken'); 
        try {
            const response = await axios.get('http://localhost:5000/api/admin/getProducts', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }); // Backend route
              setProfileOptions(response.data.categories);
        } catch (err) {
            // setError('Failed to fetch products');
            // setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileOptions onProductSelect={onProductSelect} profileData={profileOptions} selectedProfiles={productsByOption.profile}/>;
      case "hardware":
        return <HardwareOptions onProductSelect={onProductSelect} selectedHardwares={productsByOption.hardware}/>;
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

    // setTimeout(() => {
      // if(products.length === 0 && !isSliderOpen){
      //   generatePDFPreview()
      // }
    // }, 500)
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

  const generatePDF = () => {
    const doc = createProformaInvoice();
    doc.save("Galzia Performa Invoice.pdf");
  };

  const createProformaInvoice = () => {
    const doc = new jsPDF();

    // Add logo and company details
    doc.setFontSize(16); // Increase font size for "PROFORMA INVOICE"
    doc.text("PROFORMA INVOICE", 105, 15, { align: "center" }); // Center the title
    doc.addImage(logo, "PNG", 15, 30, 50, 20);
    doc.setFontSize(12);
    doc.text("Glazia Windoors Pvt Ltd.", 70, 30);
    doc.text("Shop in H. No. 275 G/F, Near Talab, Ghitorni, M G Road,", 70, 35);
    doc.text("New Delhi - 110030 (India)", 70, 40);
    doc.text("Phone: 6388406765, 9958053708", 70, 45);
    doc.text("Email: sales@glazia.com", 70, 50);

    // Invoice details
    doc.text("Order No: 001", 15, 60);
    doc.text("Dated: 07-01-2025", 50, 60);
    doc.text("Supplier's Ref: N.A", 15, 70);
    doc.text("Despatch Through: 10-jan-2025", 15, 80);
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
      body: selectedProducts?.map((product, index) => [
        index + 1,
        product.description,
        product.sapCode,
        product.quantity,
        product.rate,
        product.per,
        (product.quantity * profileOptions[product.profile].rate[product.option])?.toFixed(2),
      ]),
    });

    // Totals calculation
    const subtotal = selectedProducts?.reduce(
      (total, product) => total + product.quantity * profileOptions[product.profile].rate[product.option],
      0
    );
    const gst = subtotal * 0.18; // 18% GST
    const netAmount = subtotal + gst;

    // Add totals and footer details
    doc.text(`Subtotal: ₹${subtotal?.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 10);
    doc.text(`GST @ 18%: ₹${gst?.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 20);
    doc.text(`Net Amount: ₹${netAmount?.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 30);

    doc.text("OUR BANK DETAILS:", 15, doc.lastAutoTable.finalY + 50);
    doc.text(
      "Glazia Windoors Pvt Ltd, Axis Bank, IFSC: 00202030GJSS, AC No: 82837539293740",
      15,
      doc.lastAutoTable.finalY + 60
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
      <MDBCol style={{ flex: "1 1 auto", margin: "5%" }}>
      <MDBRow className="d-flex justify-content-between align-items-center">
        <h4 style={{width: 'max-content'}}>Please select the categories</h4>
        <div style={{width: 'max-content'}}>
        <MDBBtn onClick={generatePDF} >
          <MDBIcon fas icon="cloud-download-alt" />&nbsp;
            Download pdf
        </MDBBtn>
        <MDBBtn style={{width: 'max-content', marginLeft: '10px'}} onClick={setSlider}
        >
          <MDBIcon fas icon="expand" />&nbsp;
          Expand PDF
        </MDBBtn>
        </div>
      </MDBRow>

        <MDBRow className="d-flex" style={{ marginTop: "20px" }}>
          <MDBCol md="auto" className="mb-3" style={{flex: '1 1 auto'}}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "profile" ? "primary" : "light"}
              onClick={() => dispatch({ type: "selection/setSelectedOption", payload: "profile" })}
            >
              Profile
            </MDBBtn>
          </MDBCol>
          <MDBCol md="auto" className="mb-3" style={{flex: '1 1 auto'}}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "hardware" ? "primary" : "light"}
              onClick={() => dispatch({ type: "selection/setSelectedOption", payload: "hardware" })}
            >
              Hardware
            </MDBBtn>
          </MDBCol>
          <MDBCol md="auto" className="mb-3" style={{flex: '1 1 auto'}}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "accessories" ? "primary" : "light"}
              onClick={() => dispatch({ type: "selection/setSelectedOption", payload: "accessories" })}
            >
              Accessories
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol md="12" className="mt-4">
            <div>{renderSelectedComponent()}</div>
          </MDBCol>
        </MDBRow>
      </MDBCol>

      {selectedProducts.length > 0 && (
        <MDBCol className="mt-3" style={{ flex: "1 1 auto", maxWidth: "50%" }}>
          <div
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              height: "100%",
            }}
          >
            <canvas key={selectedProducts.length} ref={canvasRef} style={{ background: "#fff", marginTop: '10%' }} />
          </div>
        </MDBCol>
      )}
      {isSliderOpen && <div className="overlay" onClick={() => clearCurrentPdfView()}></div>}
      {/* Slider component */}
      {isSliderOpen && (
        <div className="slider" style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '40%',
          backgroundColor: 'white',
          boxShadow: '-2px 0px 5px rgba(0,0,0,0.5)',
          transition: 'transform 0.3s ease-in-out',
          transform: isSliderOpen ? 'translateX(0)' : 'translateX(100%)',
          zIndex: 2,
          transition: 'width 0.5s ease'
        }}>
          <button onClick={() => setIsSliderOpen(false)} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '20px',
          }}>×</button>
          <div style={{ padding: '20px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', backgroundColor: 'white' }} />
          </div>
        </div>
      )}
    </MDBRow>
  );
};

export default SelectionContainer;
