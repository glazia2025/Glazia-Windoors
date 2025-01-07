import React, { useState, useEffect, useRef } from "react";
import './SelectionContainer.css';
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdb-react-ui-kit";
import ProfileOptions from "./ProfileOptions"; // Adjust import path if needed
import HardwareOptions from "./HardwareOptions"; // Adjust import path if needed
import AcessoriesOptions from "./AcessoriesOptions"; // Adjust import path if needed
import jsPDF from "jspdf";
import logo from "./glazia_logo.png";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SelectionContainer = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pdfPreview, setPdfPreview] = useState(null); // State to hold the PDF preview
  const canvasRef = useRef(null); // Create a reference for the canvas

  // Initialize the default PDF preview when the component mounts
  useEffect(() => {
    if (!selectedProducts.length) {
      generatePDFPreview();
    }
  }, []);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      generatePDFPreview();
    }
  }, [selectedProducts]);

  // Function to render the selected component based on the user's choice
  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileOptions onProductSelect={onProductSelect} />;
      case "hardware":
        return <HardwareOptions onProductSelect={onProductSelect} />;
      case "accessories":
        return <AcessoriesOptions onProductSelect={onProductSelect} />;
      default:
        return <p>Please select an option.</p>;
    }
  };

  // Function for handling product selection/deselection
  const onProductSelect = (product) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id) // Unselect
        : [...prev, product] // Select
    );
  };

  // Generate and display the PDF preview
  const generatePDFPreview = () => {
    const doc = createProformaInvoice();
    const pdfOutput = doc.output("datauristring"); // Get PDF as data URI
    renderPDF(pdfOutput); // Render the PDF preview
  };

  // Function to render PDF into a canvas
  const renderPDF = (pdfData) => {
    const loadingTask = pdfjs.getDocument(pdfData);
    loadingTask.promise
      .then((pdf) => {
        pdf.getPage(1).then((page) => {
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");

          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          page.render({
            canvasContext: context,
            viewport: viewport,
          });

          setPdfPreview(canvas); // Set the canvas as the PDF preview
        });
      })
      .catch((error) => {
        console.error("Error rendering PDF", error);
      });
  };

  // Generate PDF for download
  const generatePDF = () => {
    const doc = createProformaInvoice();
    doc.save("proforma_invoice.pdf"); // Download the PDF
  };

  // Function to create the proforma invoice
  const createProformaInvoice = () => {
    const doc = new jsPDF();

    // Add logo and company details
    doc.addImage(logo, "PNG", 15, 20, 50, 20);
    doc.setFontSize(12);
    doc.text("Glazia Windoors Pvt Ltd.", 70, 20);
    doc.text("Shop in H. No. 275 G/F, Near Talab, Ghitorni, M G Road,", 70, 25);
    doc.text("New Delhi - 110030 (India)", 70, 30);
    doc.text("Phone: 6388406765, 9958053708", 70, 35);
    doc.text("Email: sales@glazia.com", 70, 40);

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
      body: selectedProducts.map((product, index) => [
        index + 1,
        product.name,
        "PHXXX", // Replace with actual SAP Code
        product.quantity,
        product.price.toFixed(2),
        "Each",
        (product.quantity * product.price).toFixed(2),
      ]),
    });

    // Totals calculation
    const subtotal = selectedProducts.reduce(
      (total, product) => {
        console.log(total, product.quantity, product.price)
        return Number(total) + Number(product.quantity) * Number(product.price);
      },
      0
    );
    console.log("subtotal", subtotal)
    const gst = subtotal * 0.18; // 18% GST
    const netAmount = subtotal + gst;

    // Add totals and footer details
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 10);
    doc.text(`GST @ 18%: ₹${gst.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 20);
    doc.text(`Net Amount: ₹${netAmount.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 30);
    doc.text("OUR BANK DETAILS:", 15, doc.lastAutoTable.finalY + 50);
    doc.text(
      "Glazia Windoors Pvt Ltd, Axis Bank, IFSC: 00202030GJSS, AC No: 82837539293740",
      15,
      doc.lastAutoTable.finalY + 60
    );

    return doc;
  };

  return (
    <MDBRow className="pdf-row-wrapper">
      <MDBCol style={{ flex: "1 1 auto", marginTop: '40px', marginLeft: '40px', overflow: 'scroll', maxHeight: '100vh' }}>
        <MDBRow className="d-flex" style={{ marginTop: "10%" }}>
          {/* Option Buttons */}
          <MDBCol md="auto" className="mb-3">
            <MDBBtn
              color={selectedOption === "profile" ? "primary" : "light"}
              onClick={() => setSelectedOption("profile")}
            >
              Profile
            </MDBBtn>
          </MDBCol>
          <MDBCol md="auto" className="mb-3">
            <MDBBtn
              color={selectedOption === "hardware" ? "primary" : "light"}
              onClick={() => setSelectedOption("hardware")}
            >
              Hardware
            </MDBBtn>
          </MDBCol>
          <MDBCol md="auto" className="mb-3">
            <MDBBtn
              color={selectedOption === "accessories" ? "primary" : "light"}
              onClick={() => setSelectedOption("accessories")}
            >
              Accessories
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        {/* Selected Component */}
        <MDBRow>
          <MDBCol md="12" className="mt-4">
            <div>{renderSelectedComponent()}</div>
          </MDBCol>
        </MDBRow>

        {/* Selected Products and Preview */}
        <MDBRow className="d-flex justify-content-between">
          <MDBCol md="12" style={{ padding: "20px", border: "1px solid #ddd" }}>
            <h5>Selected Products</h5>
            {selectedProducts.length > 0 ? (
              selectedProducts.map((product) => (
                <div key={product.id}>{product.name}</div>
              ))
            ) : (
              <p>No products selected.</p>
            )}
            {selectedProducts.length > 0 && (
              <>
                <MDBBtn onClick={generatePDFPreview}>Preview PDF</MDBBtn>
                <MDBBtn onClick={generatePDF} className="mt-2">
                  Download Proforma Invoice
                </MDBBtn>
              </>
            )}
          </MDBCol>
        </MDBRow>
      </MDBCol>

      <MDBCol className="mt-3" style={{ flex: "1 1 auto", maxHeight: '100vh' }}>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            height: "100%",
            overflowY: "scroll",
          }}
        >
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <canvas ref={canvasRef} style={{ background: "#fff" }} width="100%" height="100%" />
          </div>
        </div>
      </MDBCol>
    </MDBRow>
  );
};

export default SelectionContainer;
