import React, { useState, useEffect, useRef } from "react";
import {
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBIcon,
  MDBTooltip,
  MDBContainer,
  MDBTypography,
  MDBFile,
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";

import ProfileOptions from "./ProfileOptions";
import HardwareOptions from "./HardwareOptions";
import AccessoriesOptions from "./AcessoriesOptions";
import logo from "./glazia_logo.png";
import { addSelectedProducts, clearProduct } from "../../redux/selectionSlice";
import { setUser } from "../../redux/userSlice";
import api, { BASE_API_URL } from "../../utils/api";

import "./SelectionContainer.css";
import Nalco from "./Nalco/Nalco";
import axios from "axios";
import { convertFileToBase64 } from "../../utils/common";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SelectionContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profileOptionsRef = useRef();
  const hardwareOptionsRef = useRef();

  const { user } = useSelector((state) => state.user);
  const { selectedOption, productsByOption } = useSelector(
    (state) => state.selection
  );
  const [isSliderOpen, setIsSliderOpen] = useState(false); // State for slider visibility
  const [isMakingPayment, setIsMakingPayment] = useState(false);
  const [wrapperHeight, setWrapperHeight] = useState("calc(100vh -80px)");
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  // Aggregate products from all options
  const selectedProducts = Object.values(productsByOption).flat();

  const canvasRef = useRef(null);
  const prevSelectedProducts = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const distanceToBottom = documentHeight - (scrollTop + windowHeight);

      // When user is within 200px from the bottom, reduce height
      if (distanceToBottom < 200) {
        setWrapperHeight("50vh"); // Shrinks the height
      } else {
        setWrapperHeight("calc(100vh - 80px)"); // Restores original height
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSliderOpen) {
      document.body.style.overflow = "hidden"; // Disable scroll
    } else {
      document.body.style.overflow = ""; // Restore scroll
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup on unmount
    };
  }, [isSliderOpen]);

  useEffect(() => {
    if (!selectedProducts?.length) {
      generatePDFPreview();
    }
  }, [selectedProducts]);

  useEffect(() => {
    if (
      selectedProducts.length > 0 &&
      selectedProducts.length !== prevSelectedProducts.current.length
    ) {
      generatePDFPreview();
    }
    prevSelectedProducts.current = selectedProducts;
  }, [selectedProducts]);

  useEffect(() => {
    if (!user) authenticateUser();
  }, []);

  const authenticateUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return navigate("/admin/login");
    try {
      const { data } = await api.get("/user/getUser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setUser(data.user));
    } catch {
      navigate("/admin/login");
    }
  };

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return (
          <ProfileOptions
            ref={profileOptionsRef}
            onProductSelect={onProductSelect}
            onRemoveProduct={onRemoveProduct}
            selectedProfiles={productsByOption.profile}
          />
        );
      case "hardware":
        return (
          <HardwareOptions
            ref={hardwareOptionsRef}
            onProductSelect={onProductSelect}
            onRemoveProduct={onRemoveProduct}
            selectedHardwares={productsByOption.hardware}
          />
        );
      case "accessories":
        return (
          <AccessoriesOptions
            onProductSelect={onProductSelect}
            selectedAccessories={productsByOption.accessories}
          />
        );
      default:
        return <p>Please select an option.</p>;
    }
  };

  const onProductSelect = (product) => {
    dispatch(
      addSelectedProducts({
        option: selectedOption,
        product,
      })
    );
  };

  const onRemoveProduct = (product) => {
    dispatch(
      clearProduct({
        option: selectedOption,
        sapCode: product,
      })
    );
  };

  const goToPayment = () => {
    if (isMakingPayment) return;

    setIsMakingPayment(true);
    setSlider();
  };

  const generatePDFPreview = (isExpand) => {
    const doc = createProformaInvoice();
    const pdfOutput = doc.output("datauristring");
    renderPDF(pdfOutput, isExpand);
  };

  const currentRenderTask = useRef(null);

  const renderPDF = async (pdfData, isExpand) => {
    const loadingTask = pdfjs.getDocument(pdfData);
    try {
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let container = "";
      if (!isExpand) {
        container = document.querySelector(".canva-container");
      } else {
        container = document.querySelector(".canva2-container");
      }

      if (!container) return;
      container.innerHTML = "";

      const renderTasks = new Map();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const canvas = document.createElement("canvas");
        container.appendChild(canvas);

        const context = canvas.getContext("2d");
        const containerWidth = container.clientWidth;
        const viewport = page.getViewport({
          scale: containerWidth / page.getViewport({ scale: 1 }).width,
        });

        // Set full width for the canvas
        canvas.style.width = "100%";
        canvas.style.height = "auto"; // Maintain aspect ratio

        // Ensure proper rendering size
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Cancel previous render task for this specific page
        if (renderTasks.has(pageNum)) {
          renderTasks.get(pageNum).cancel();
        }

        const renderTask = page.render({ canvasContext: context, viewport });
        renderTasks.set(pageNum, renderTask);

        await renderTask.promise;
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  };

  const confirmOrder = async () => {
    let paymentProofBase64 = null;
    if (paymentProofFile) {
      try {
        paymentProofBase64 = await convertFileToBase64(paymentProofFile);

        const orderPayload = {
          user: {
            userId: user._id || user.userId,
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
          payment: {
            amount: Number((total / 2).toFixed(2)),
            proof: paymentProofBase64,
          },
          totalAmount: Number(total.toFixed(2)),
        };

        const token = localStorage.getItem("authToken");

        const { data } = await api.post(
          `${BASE_API_URL}/user/pi-generate`,
          {
            ...orderPayload,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Order created successfully.");

        navigate(`/user/orders/${data.order._id}`);
        clearCurrentPdfView();
      } catch (error) {
        console.error(
          "Error creating order:",
          error.response?.data?.message || error.message
        );
      }
    }
  };

  const sendMailInvoice = async (pdfData) => {
    const emailData = {
      to: user.email,
      subject: "Glazia Windoors Performa Invoice",
      text: `
Dear ${user.name},
Thank you for choosing Glazia Windoors – your one-stop solution for all your aluminum needs!
    
We are pleased to inform you that your perfora invoice is ready. Please find the attached PDF document for your reference. It contains the details of your order and other related information.
    
If you have any questions or need further assistance, feel free to reach out to us. Our team is here to provide you with the best service for all your aluminum requirements.
    
Thank you once again for choosing us. We look forward to serving you.
    
Best regards,  
Glazia Windoors Pvt Ltd.   
[www.glazia.in]  
[+91 9958053708]
      `,
      pdf: pdfData,
    };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${BASE_API_URL}/user/send-email`,
        emailData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      // alert('Error sending email');
    }
  };

  const generatePDF = () => {
    const doc = createProformaInvoice();
    // registerUserProducts(user, selectedProducts);

    doc.save("Glazia Performa Invoice.pdf");
    // sendMailInvoice(doc.output("datauristring").split(",")[1]);
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
    const dateString = today.toLocaleDateString("en-GB"); // Formats date as dd-mm-yyyy

    doc.text(`Dated: ${dateString}`, 50, 60);
    doc.text("Supplier's Ref: N.A", 15, 70);
    doc.text("Destination: Gurgaon", 15, 90);
    doc.text("Terms of Delivery: N.A", 15, 100);
    console.log("selectedProducts", selectedProducts);
    // Add table with selected products
    doc.autoTable({
      startY: 110,
      pageBreak: "auto", // Ensures page breaks automatically
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
        product.description +
          " " +
          `${product.powderCoating ? "(" + product.powderCoating + ")" : ""}` ||
          product.perticular,
        product.sapCode,
        product.quantity,
        product.rate,
        product.per || "Piece",
        (product.quantity * product.rate).toFixed(2),
      ]),
    });

    // Get the last position of the table
    let currentY = doc.autoTable.previous.finalY + 10;

    // Add totals
    const subtotal = selectedProducts.reduce(
      (total, product) => total + product.quantity * product.rate,
      0
    );
    setSubTotal(subtotal);
    const gst = subtotal * 0.18; // 18% GST
    const netAmount = subtotal + gst;
    setTotal(netAmount);

    // Ensure enough space for totals; else, add a new page
    if (currentY + 30 > doc.internal.pageSize.height - 10) {
      doc.addPage();
      currentY = 10;
    }

    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 15, currentY);
    doc.text(`GST @ 18%: ₹${gst.toFixed(2)}`, 15, currentY + 10);
    doc.text(`Net Amount: ₹${netAmount.toFixed(2)}`, 15, currentY + 20);

    // Add bank details
    currentY += 50;
    if (currentY + 20 > doc.internal.pageSize.height - 10) {
      doc.addPage();
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
    setIsSliderOpen(true);

    if (selectedProducts.length > 0) {
      // currentRenderTask.current.cancel();
      generatePDFPreview(true);
    }
  };

  const clearCurrentPdfView = () => {
    if (currentRenderTask.current) {
      currentRenderTask.current.cancel();
    }
    setIsSliderOpen(false);
    setIsMakingPayment(false);
  };

  const handlePaymentProofChange = (e) => {
    setPaymentProofFile(e.target.files[0]);
  };

  return (
    <MDBRow className="pdf-row-wrapper">
      <MDBCol className="main-selectors" style={{ minWidth: "70%" }}>
        <MDBRow className="d-flex justify-content-between align-items-end">
          <MDBCol className="btns-container w-100 justify-content-between">
            <MDBRow>
              <h1 style={{ width: "max-content" }}>
                Welcome to Glazia Windoors
              </h1>
            </MDBRow>
            <MDBRow className="d-flex justify-content-between align-items-center">
              <h4 style={{ width: "max-content" }}>
                Lets build your order together!{" "}
                <MDBIcon fas icon="check-circle" />
              </h4>
              <div
                className="d-flex flex-wrap"
                style={{ width: "max-content", gap: "10px" }}
              >
                <MDBTooltip
                  tag="span"
                  wrapperClass="d-inline-block"
                  title="Please add products"
                >
                  <MDBBtn
                    className="download-pdf"
                    disabled={selectedProducts.length === 0}
                    onClick={generatePDF}
                  >
                    <MDBIcon fas icon="cloud-download-alt" />
                    &nbsp; Download pdf
                  </MDBBtn>
                </MDBTooltip>
                <MDBTooltip
                  tag="span"
                  wrapperClass="d-inline-block"
                  title="Please add products"
                >
                  <MDBBtn
                    disabled={selectedProducts.length === 0}
                    style={{ width: "max-content" }}
                    onClick={setSlider}
                  >
                    <MDBIcon fas icon="expand" />
                    &nbsp; Expand PI
                  </MDBBtn>
                </MDBTooltip>
              </div>
            </MDBRow>

            <MDBRow className="d-flex" style={{ marginTop: "20px" }}>
              <MDBCol md="auto" className="mb-3" style={{ flex: "1 1 auto" }}>
                <MDBBtn
                  style={{ width: "100%" }}
                  size="lg"
                  color={selectedOption === "profile" ? "primary" : "light"}
                  onClick={() =>
                    dispatch({
                      type: "selection/setSelectedOption",
                      payload: "profile",
                    })
                  }
                >
                  Aluminium Profile
                </MDBBtn>
              </MDBCol>
              <MDBCol md="auto" className="mb-3" style={{ flex: "1 1 auto" }}>
                <MDBBtn
                  style={{ width: "100%" }}
                  size="lg"
                  color={selectedOption === "hardware" ? "primary" : "light"}
                  onClick={() =>
                    dispatch({
                      type: "selection/setSelectedOption",
                      payload: "hardware",
                    })
                  }
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
          className="mt-0"
          style={{
            flex: "1 1 auto",
            width: "100%", // Ensure the column spans the full width
            maxWidth: "100%", // Avoid limiting the maximum width
            borderLeft: "1px solid #ddd",
            paddingLeft: "0px",
          }}
        >
          <div className="canva-scroll-set">
            <div
              className="pdf-wrapper"
              style={{
                height: "100%",
                position: "fixed", // Fixed positioning might need adjustments
                top: "80px",
                maxHeight: wrapperHeight,
                overflow: "scroll",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "-webkit-fill-available",
                background: "#fff",
                borderBottom: "2px solid #32a",
              }}
            >
              <MDBBtn className="expand-btn" onClick={setSlider}>
                <MDBIcon fas icon="angle-up" />
              </MDBBtn>

              {/* <canvas
              key={selectedProducts.length}
              ref={canvasRef}
              style={{
                width: "100%", // Full width within its container
                height: "auto", // Maintain aspect ratio
                background: "#fff",
                display: "block", // Prevent extra margin from inline elements
              }}
            /> */}
              <div
                className="canva-container"
                style={{
                  width: "100%", // Full width within its container
                  height: "auto", // Maintain aspect ratio
                  background: "#fff",
                  display: "block", // Prevent extra margin from inline elements
                }}
              ></div>
              <div className="total-pricing m-2 rounded-2">
                <div className="price-control">
                  <div className="heading sub-price">Sub Total</div>
                  <div className="price sub-price">₹ {subTotal.toFixed(2)}</div>
                </div>
                <div className="price-control">
                  <div className="heading sub-price">GST @ 18%</div>
                  <div className="price sub-price">
                    ₹ {(subTotal * 0.18).toFixed(2)}
                  </div>
                </div>
                <div className="price-control">
                  <div className="heading main-price">Total</div>
                  <div className="price main-price">₹ {total.toFixed(2)}</div>
                </div>

                <MDBBtn
                  className="mt-3"
                  disabled={selectedProducts.length === 0}
                  color={"secondary"}
                  onClick={goToPayment}
                  size={"lg"}
                >
                  <MDBIcon fas icon="shopping-cart" />
                  &nbsp; Make Payment
                </MDBBtn>
              </div>
            </div>
          </div>
        </MDBCol>
      )}

      {isSliderOpen && (
        <div className="overlay-wrapper">
          {/* <MDBBtn
            className="download-pdf overlay-download"
            disabled={selectedProducts.length === 0}
            onClick={generatePDF}
          >
            <MDBIcon fas icon="cloud-download-alt" />
            &nbsp; Download pdf
          </MDBBtn> */}

          <div className="overlay" onClick={() => clearCurrentPdfView()}></div>

          <MDBContainer
            // className="bg-secondary"
            style={{
              position: "fixed",
              left: 0,
              background: "#efefef",
              width: "60%",
              height: "calc(100vh - 80px)",
              zIndex: "999",
              marginTop: "-1px",
              borderRight: "1px solid #ddd",
              paddingLeft: "5%",
              paddingRight: "5%",
              paddingTop: "50px",
              paddingBottom: "50px",
              overflowY: "auto",
            }}
          >
            <h3 className="fw-bold">
              Almost there! Let's confirm your order..
            </h3>

            <MDBRow className="" center middle>
              <MDBCol className="stretch-height">
                <MDBTypography className="mt-4 mb-0 fw-medium text-muted">
                  Steps
                </MDBTypography>
                <MDBTypography
                  tag="h6"
                  className="mt-0 mb-2 fw-normal bg-white p-3 rounded-5"
                >
                  Make a payment of <strong>₹{(total / 2).toFixed(2)}</strong>{" "}
                  (50% of the total amount) to the account details or UPI ID.
                </MDBTypography>

                <MDBTypography
                  tag="h6"
                  className="mt-2 mb-2 fw-normal bg-white p-3 rounded-5"
                >
                  After making the payment, please upload the proof of payment.
                </MDBTypography>

                <MDBTypography
                  tag="h6"
                  className="mt-2 mb-4 fw-normal bg-white p-3 rounded-5"
                >
                  Upon approval, we will proceed with the order.
                </MDBTypography>
              </MDBCol>

              <MDBCol className="p-0" center>
                <div className="rounded-5 shadow-3-strong bg-white min-h-100 ">
                  {" "}
                  {/* Increased py, added shadow */}
                  <MDBTypography
                    tag="h5"
                    className="px-3 py-3 bg-primary text-white mb-0 text-left fw-medium"
                    style={{
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                    }}
                  >
                    {" "}
                    {/* Centered title, increased bottom margin */}
                    Account Info
                  </MDBTypography>
                  <div className="px-3 py-3">
                    <MDBRow className="mb-2 align-items-center pt-0 mt-0">
                      <MDBCol size="auto" className="pe-0 pt-0">
                        <MDBIcon
                          fas
                          icon="building"
                          className="text-muted me-2"
                          size="lg"
                        />
                      </MDBCol>
                      <MDBCol>
                        <MDBTypography
                          tag="p"
                          className="text-dark mb-0"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <strong className="me-1">Entity:</strong> Glazia
                          Windoors Pvt Ltd
                        </MDBTypography>
                      </MDBCol>
                    </MDBRow>
                    <MDBRow className="mb-2 align-items-center">
                      <MDBCol size="auto" className="pe-0">
                        <MDBIcon
                          fas
                          icon="landmark"
                          className="text-muted me-2"
                          size="lg"
                        />
                      </MDBCol>
                      <MDBCol>
                        <MDBTypography
                          tag="p"
                          className="text-dark mb-0"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <strong className="me-1">Bank:</strong> Axis Bank
                        </MDBTypography>
                      </MDBCol>
                    </MDBRow>
                    <MDBRow className="mb-2 align-items-center">
                      <MDBCol size="auto" className="pe-0">
                        <MDBIcon
                          fas
                          icon="credit-card"
                          className="text-muted me-2"
                          size="lg"
                        />
                      </MDBCol>
                      <MDBCol>
                        <MDBTypography
                          tag="p"
                          className="text-dark mb-0"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <strong className="me-1">A/C No:</strong>{" "}
                          82837539293740
                        </MDBTypography>
                      </MDBCol>
                    </MDBRow>
                    <MDBRow className="align-items-center">
                      <MDBCol size="auto" className="pe-0">
                        <MDBIcon
                          fas
                          icon="hashtag"
                          className="text-muted me-2"
                          size="lg"
                        />
                      </MDBCol>
                      <MDBCol>
                        <MDBTypography
                          tag="p"
                          className="text-dark mb-0"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <strong className="me-1">IFSC:</strong> 00202030GJSS
                        </MDBTypography>
                      </MDBCol>
                    </MDBRow>
                  </div>
                </div>
              </MDBCol>
            </MDBRow>

            <hr className="mt-4" />

            <MDBTypography tag="h5" className="mt-4 mb-1 fw-semibold">
              Upload Payment Proof
            </MDBTypography>

            <MDBTypography tag="h6" className="mb-3">
              Accepts PDFs or images (max 10MB)
            </MDBTypography>
            <MDBFile
              id="paymentProofUpload"
              onChange={handlePaymentProofChange}
              className="mb-2" // Added margin bottom
              style={{ maxWidth: "400px" }}
            />
            {paymentProofFile && (
              <MDBTypography small className="text-muted">
                {paymentProofFile.name} (
                {(paymentProofFile.size / 1024).toFixed(2)} KB)
              </MDBTypography>
            )}

            <p></p>

            <MDBBtn
              onClick={confirmOrder}
              className="mt-4"
              color="primary"
              size="lg"
            >
              <MDBIcon fas icon="check" />
              &nbsp; Confirm Order
            </MDBBtn>
          </MDBContainer>
          {/* {isMakingPayment ? (
          ) : (
            <></>
          )} */}
        </div>
      )}

      {/* Slider component */}
      {isSliderOpen && (
        <div
          className="slider"
          style={{
            transform: isSliderOpen ? "translateX(0)" : "translateX(100%)",
            padding: "0",
          }}
        >
          <button
            onClick={() => clearCurrentPdfView()}
            style={{
              position: "absolute",
              top: "12%",
              right: "10px",
              background: "transparent",
              border: "none",
              fontSize: "30px",
            }}
          >
            ×
          </button>
          <div
            className="canva2-container"
            style={{
              maxHeight: "100vh",
              width: "100%", // Full width within its container
              height: "auto", // Maintain aspect ratio
              background: "#fff",
              display: "block",
              overflowY: "scroll",
            }}
          >
            {/* <div>
              <canvas ref={canvasRef} style={{ width: '100%', backgroundColor: 'white', marginTop: '100px' }} />
            </div> */}
          </div>
          <div
            className="total-pricing-slider w-100"
            style={{ position: "fixed", bottom: "0" }}
          >
            <div className="price-control">
              <div className="heading sub-price slider-price">Sub Total</div>
              <div className="price sub-price slider-price">
                ₹ {subTotal.toFixed(2)}
              </div>
            </div>
            <div className="price-control">
              <div className="heading sub-price slider-price">GST @ 18%</div>
              <div className="price sub-price slider-price">
                ₹ {(subTotal * 0.18).toFixed(2)}
              </div>
            </div>
            <div className="price-control">
              <div className="heading main-price slider-main-price">Total</div>
              <div className="price main-price slider-main-price">
                ₹ {total.toFixed(2)}
              </div>
            </div>
            <div
              className="d-flex justify-content-between align-items-center mt-2 pt-2"
              style={{
                borderTop: "1px solid #32a4",
              }}
            >
              <MDBBtn
                // className="download-pdf mobile-download"
                onClick={() => clearCurrentPdfView()}
                color={"primary"}
              >
                <span className="fs-6">×</span> Close
              </MDBBtn>
              <MDBBtn
                // className="download-pdf mobile-download"
                onClick={generatePDF}
                color={"secondary"}
              >
                <MDBIcon fas icon="cloud-download-alt" />
                &nbsp; Download pdf
              </MDBBtn>
              {/* <MDBBtn
                className="download-pdf"
                disabled={selectedProducts.length === 0}
                onClick={goToPayment}
                color={"secondary"}
                size={"lg"}
              >
                <MDBIcon fas icon="shopping-cart" />
                &nbsp; Make Payment
              </MDBBtn> */}
            </div>
          </div>
        </div>
      )}
    </MDBRow>
  );
};

export default SelectionContainer;
