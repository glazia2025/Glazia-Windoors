import React, { useState, useEffect, useRef } from "react";
import {
  MDBRow,
  MDBCol,
  MDBBtn,
  MDBIcon,
  MDBTooltip,
  MDBModal,
  MDBContainer,
  MDBModalDialog,
  MDBModalContent,
  MDBTypography,
  MDBFile,
  MDBRadio
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { pdfjs } from "react-pdf";

import ProfileOptions from "./ProfileOptions";
import HardwareOptions from "./HardwareOptions";
import AccessoriesOptions from "./AcessoriesOptions";
import logo from "./glazia_logo.png";
import {
  addSelectedProducts,
  clearProduct,
  clearSelectedProducts,
} from "../../redux/selectionSlice";
import { setUser } from "../../redux/userSlice";
import api, { BASE_API_URL } from "../../utils/api";

import "./SelectionContainer.css";
import Nalco from "./Nalco/Nalco";
import axios from "axios";
import { convertFileToBase64 } from "../../utils/common";
import ImageZoom from "./ImageZoom";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SelectionContainer = ({isSliderOpen, setIsSliderOpen}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profileOptionsRef = useRef();
  const hardwareOptionsRef = useRef();

  const { user } = useSelector((state) => state.user);
  const { selectedOption, productsByOption } = useSelector(
    (state) => state.selection
  );
  const [isMakingPayment, setIsMakingPayment] = useState(false);
  const [wrapperHeight, setWrapperHeight] = useState("calc(100vh -80px)");
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [deliveryType, setDeliveryType] = useState('');
  const [paymentSlider, setPaymentSlider] = useState(false);

  // Aggregate products from all options
  const selectedProducts = Object.values(productsByOption).flat();

  const canvasRef = useRef(null);
  const prevSelectedProducts = useRef([]);

  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "home_view", {
        page_path: window.location.pathname,
      });
    }
  }, [window]);


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

  const subTotalHandle = () => {
    let temp = 0;
    selectedProducts.forEach((p) => {
      console.log(parseInt(p.amount, 10), p.amount)
      temp += parseInt(p.amount, 10);
    })
    return temp;
  }

  const gstHandle = () => {
    let temp = subTotalHandle();
    return temp * 0.18;
  }

  const totalHandle = () => {
    let temp = subTotalHandle();
    return temp + (temp * 0.18);
  }
  

 

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
    setIsSliderOpen(false);
    setPaymentSlider(true);
  };

  const generatePDFPreview = async () => {
    const doc = createProformaInvoice();
    const pdfOutput = await doc?.output("datauristring");
    renderPDF(pdfOutput);
  };

  const currentRenderTask = useRef(null);

  const renderPDF = async (pdfData) => {
  try {
    // Fetch the PDF data if it's a URL or Uint8Array
    let pdfBlob;

    if (typeof pdfData === "string") {
      // Assuming it's a URL
      const response = await fetch(pdfData);
      const arrayBuffer = await response.arrayBuffer();
      pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
    } else if (pdfData instanceof Uint8Array || pdfData instanceof ArrayBuffer) {
      pdfBlob = new Blob([pdfData], { type: "application/pdf" });
    } else {
      console.error("Unsupported pdfData type");
      return;
    }

    // Create a blob URL and open it in a new tab
    const pdfURL = URL.createObjectURL(pdfBlob);
    window.open(pdfURL, "_blank");
  } catch (error) {
    console.error("Error opening PDF in new tab:", error);
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
          deliveryType: "SELF"
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
        clearCart();

        navigate(`/user/orders/${data.order._id}`);
      } catch (error) {
        console.error(
          "Error creating order:",
          error.response?.data?.message || error.message
        );
      }
    }
  };

  const createProformaInvoice = () => {
    const container = document.createElement("div");
    container.innerHTML = generateHTML();

    html2pdf()
      .set({
        margin: 0,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .outputPdf("blob")
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        window.open(url); // Open preview

        const filename = `Glazia_${user.name}_${new Date().toLocaleDateString()}`
        const safeFilename = filename.replace(/[\s/]/g, "_") + ".pdf";


        // Optional: Also allow download
        const a = document.createElement("a");
        a.href = url;
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  };



  function numberToWordsIndian(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy',
    'Eighty', 'Ninety'
  ];

  const units = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero Rupees Only';

  function getWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + getWords(n % 100) : '');
    return '';
  }

  let str = '';
  let i = 0;

  const parts = [];
  parts.push(num % 1000); // hundreds
  num = Math.floor(num / 1000);

  while (num > 0) {
    parts.push(num % 100);
    num = Math.floor(num / 100);
  }

  for (let j = parts.length - 1; j >= 0; j--) {
    if (parts[j]) {
      str += getWords(parts[j]) + (units[j] ? ' ' + units[j] + ' ' : ' ');
    }
  }

  return str.trim() + ' Rupees Only';
}




  const generateHTML = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const gst = subtotal * 0.18;
    const net = subtotal + gst;
    const today = new Date().toLocaleDateString("en-GB");

    let total = 0;

     selectedProducts.forEach((p) => {
      console.log(parseInt(p.quantity, 10), p.quantity)
      total += parseInt(p.quantity, 10);
    })

    const rows = selectedProducts.map((p, i) => `
    <tr>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">${i + 1}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; overflow: hidden; white-space: nowrap;">
        ${p.description}
      </td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">
        ${p.option ? ` (${p.option})` : ""}
        ${p.powderCoating && Object.keys(p.powderCoating).length ? ` - ${JSON.stringify(p.powderCoating)}` : ""}
      </td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">${p.sapCode}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">${p.quantity}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">${Number(p.rate).toFixed(2)}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">${p.per || "Piece"}</td>
      <td style="border-bottom: 1px solid #000; padding:6px;">${Number(p.amount).toFixed(2)}</td>
    </tr>
  `).join("");

    return `
      <div style="margin: 40px; font-family:Arial, sans-serif;  border:1px solid #000;">
        <div style="text-align: center; border-bottom: 1px solid #000; font-size:16px; padding: 4px;">
          <strong>Glazia Windoors Pvt Ltd.</strong>
        </div>

        <div style="display: flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #000; font-size: 11px; padding: 2px;">
          <div>Khevat/ Khata No. 361, Rect. No. 21 4/70-18 Kherki Dhaula Village Road, Gurgaon, Harana, 122001</div>
          <div>Phone: 9958053708        Email: sales@glazia.com</div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; font-size: 11px; table-layout: fixed;">
          <div style="border-right: 1px solid #000; font-weight: bold; padding: 2px; border-bottom: 1px solid #000;">Consignee (Ship To)</div>
          <div style="border-right: 1px solid #000; font-weight: bold; padding: 2px; border-bottom: 1px solid #000;">Invoice No.</div>
          <div style=" padding: 2px; border-bottom: 1px solid #000;">Date</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">${user.name}</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">GW/25/26/PI/0023</div>
          <div style=" padding: 2px; border-bottom: 1px solid #000;">${new Date().toLocaleDateString()}</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">${user.address}</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">Delivery Note No.</div>
          <div style=" padding: 2px; border-bottom: 1px solid #000;">Delivery Note Date</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">${user.city}, ${user.state}-${user.pincode}</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">...........................................</div>
          <div style=" padding: 2px;  border-bottom: 1px solid #000;">...........................................</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">${user.gstNumber}</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">Reference No. : 0023</div>
          <div style=" padding: 2px;  border-bottom: 1px solid #000;">Mode of Payment</div>
          <div style="border-right: 1px solid #000; font-weight: bold; padding: 2px; border-bottom: 1px solid #000;">Buyer (Bill To)</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">...........................................</div>
          <div style=" padding: 2px;  border-bottom: 1px solid #000;">...........................................</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">${user.name}</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">Dispatch Mode</div>
          <div style=" padding: 2px; border-bottom: 1px solid #000;">Destination</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">${user.address}</div>
          <div style="border-right: 1px solid #000; padding: 2px; border-bottom: 1px solid #000;">By Road</div>
          <div style=" padding: 2px; border-bottom: 1px solid #000;">${user.city}, ${user.state}</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">${user.city}, ${user.state}-${user.pincode}</div>
          <div style="border-right: 1px solid #000; padding: 2px;  border-bottom: 1px solid #000;">...........................................</div>
          <div style=" padding: 2px;  border-bottom: 1px solid #000;">...........................................</div>
        </div>
        <div style="width: 100%; height: 15px; border-bottom: 1px solid #000;"></div>
        <table style="width:100%; border-collapse:collapse; font-size: 11px;">
          <colgroup>
            <col style="width:12.5%;">
            <col style="width:12.5%;">
            <col style="width:12.5%;">
            <col style="width:12.5%;">
            <col style="width:12.5%;">
            <col style="width:12.5%;">
            <col style="width:12.5%;">
            <col style="width:12.5%;">
          </colgroup>
          <thead>
            <tr>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">S.No</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">Description</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">Series</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">SAP Code</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">Qty</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">Rate</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px;">Per</th>
              <th style="border-bottom: 1px solid #000; padding:6px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-bottom: 1px solid #000; padding:6px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;">Total</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;">${total}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding:6px; height: 25px;"> </td>
              <td style="border-bottom: 1px solid #000; padding:6px;">${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <table style="width:100%; border-collapse:collapse; font-size:11px; table-layout:fixed;">
          <tr>
            <td colspan="7" style="width:87.5%; border-right:1px solid #000; border-bottom:1px solid #000; padding:6px; text-align: center;">
              SGST@9%
            </td>
            <td style="width:12.5%; border-bottom:1px solid #000; padding:6px;">
              ${(gst / 2).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="7" style="width:87.5%; border-right:1px solid #000; border-bottom:1px solid #000; padding:6px; text-align: center;">
              CGST@9%
            </td>
            <td style="width:12.5%; border-bottom:1px solid #000; padding:6px;">
              ${(gst / 2).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="7" style="width:87.5%; border-right:1px solid #000; border-bottom:1px solid #000; padding:6px; text-align: center;">
              Total
            </td>
            <td style="width:12.5%; border-bottom:1px solid #000; padding:6px;">
              ${net.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="7" style="width:87.5%; border-right:1px solid #000; border-bottom:1px solid #000; padding:6px; text-align: center;">
              Rounded Off
            </td>
            <td style="width:12.5%; border-bottom:1px solid #000; padding:6px;">
              ${Math.round(net)}
            </td>
          </tr>
        </table>
        <table style="width:100%; border-collapse:collapse; font-size:11px; table-layout:fixed;">
          <tr>
            <td style=" border-right:1px solid #000; border-bottom:1px solid #000; padding:6px; text-align: center;">
              Amount Chargable in Words
            </td>
            <td style=" border-bottom:1px solid #000; padding:6px;">
              ${numberToWordsIndian(Math.round(net))}
            </td>
          </tr>
          <tr>
            <td style=" border-right:1px solid #000; border-bottom:1px solid #000; padding:6px;">
              Bank Detail:
            </td>
            <td style=" border-bottom:1px solid #000; padding:6px;">
              Company Detail:
            </td>
          </tr>
          <tr>
            <td style=" border-right:1px solid #000; border-bottom:1px solid #000; padding:6px;">
              Bank Name: HDFC Bank
            </td>
            <td style=" border-bottom:1px solid #000; padding:6px;">
              Glazia Windoors Pvt. Ltd.
            </td>
          </tr>
          <tr>
            <td style=" border-right:1px solid #000; border-bottom:1px solid #000; padding:6px;">
              A/c No: 50200084871361
            </td>
            <td style=" border-bottom:1px solid #000; padding:6px;">
              Kherki Dhaula Village Road, Gurgaon, Harana, 122001
            </td>
          </tr>
          <tr>
            <td style=" border-right:1px solid #000; border-bottom:1px solid #000; padding:6px;">
              RTGS/NEFT/IFSC Code: HDFC0004809
            </td>
            <td style=" border-bottom:1px solid #000; padding:6px;">
             06AAKCG7530J1ZE
            </td>
          </tr>
        </table>
        <div style="text-align: center; border-bottom: 1px solid #000; font-size:16px; padding: 4px;">
          Terms & Condition
        </div>
        <div style=" border-bottom: 1px solid #000; font-size:11px; padding: 4px;">
          <div>1. PI Validity Period</div>
          <div style="margin-left: 15px;">
            <div>a. 15 days from date of issuane irrespective of selling price</div>
            <div>b. PI shall be treated as null & void in all respect in absence of adnave payment as per PI terms</div>
          </div>
        </div>
        <div style=" border-bottom: 1px solid #000; font-size:11px; padding: 4px;">
          2. Selling Price: Selling Price is governed by NALCO Billet price on the date of material dispatch.
        </div>
        <div style=" border-bottom: 1px solid #000; font-size:11px; padding: 4px;">
          3. Supply Schedule: Supply schedule will be discussed & finalized after advance payment.
        </div>
        <div style=" border-bottom: 1px solid #000; font-size:11px; padding: 4px;">
          <div>4. Advance Payment: Advance payment will be governed as per below schedule</div>
          <div style="margin-left: 15px;">
            <div>a. 100% advance for PI having value   Rs. >0 ~ => 2,00,000</div>
            <div>b. 50% advance for PI having value   Rs. >0 ~ =< 2,00,000</div>
          </div>
        </div>
        <div style=" border-bottom: 1px solid #000; font-size:11px; padding: 4px;">
          5. Transportation: In customer scope, No claim or responsibility in any form related to transportation will be levied.
        </div>
      </div>
    `;
  };


  const setSlider = () => {
    setIsSliderOpen(true);
  };

  const clearCurrentPdfView = () => {
    if (currentRenderTask.current) {
      currentRenderTask.current.cancel();
    }
    setPaymentSlider(false);
    setIsMakingPayment(false);
  };

  const clearCart = () => {
    dispatch(clearSelectedProducts({ option: selectedOption }));

    setSubTotal(0);
    setTotal(0);
    setPaymentProofFile(null);

    clearCurrentPdfView();
  };

  const handlePaymentProofChange = (e) => {
    setPaymentProofFile(e.target.files[0]);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("navdeepkamboj08-3@okhdfcbank");
    toast.success("UPI ID copied to clipboard");
  };

  return (
    <>
    {(selectedProducts.length > 0 && !paymentSlider) && <div className="cart-float-cta" onClick={() => {
      setIsSliderOpen(true);
    }}>
      {selectedProducts.length > 0 && <div className="cart-items-clip">{selectedProducts.length}</div>}
      <MDBIcon fas icon="shopping-cart" size="2x" />
    </div>}
                    
    <MDBRow className="pdf-row-wrapper bg-white">
      <MDBCol className="main-selectors" style={{ minWidth: "65%" }}>
        <MDBRow className="d-flex justify-content-between align-items-end">
          <MDBCol className="btns-container w-100 justify-content-between">
            <MDBCol md="auto" className="nalco-rate">
            <Nalco />
          </MDBCol>
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
        </MDBRow>

        <MDBRow>
          <MDBCol md="12" className="mt-4">
            <div>{renderSelectedComponent()}</div>
          </MDBCol>
        </MDBRow>
      </MDBCol>

      {isSliderOpen && (
  <>
    {/* Overlay */}
    <div className="overlay" onClick={() => setIsSliderOpen(false)} />

    <MDBCol className="mt-0 slider-cart">
      <div className="canva-scroll-set">
        <div
          className="pdf-wrapper"
          style={{
            height: "100%",
            maxHeight: "100vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            width: "100%",
            background: "#fff",
            padding: "1rem",
          }}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-center mb-3">
            <h5 className="fw-bold text-center">Selected Products</h5>
            <div
              style={{ cursor: "pointer", marginLeft: "auto" }}
              onClick={() => setIsSliderOpen(false)}
            >
              <MDBIcon fas icon="times" />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="d-none d-md-block">
            <table
              className="table table-striped table-bordered"
              style={{ width: "100%", tableLayout: "auto" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rate</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.description}</td>
                    <td>₹ {product.rate}</td>
                    <td>{product.quantity}</td>
                    <td>₹ {product.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="d-block d-md-none">
            {selectedProducts.map((product, index) => (
              <div
                key={index}
                className="card mb-2 shadow-sm p-2"
                style={{ borderRadius: "8px" }}
              >
                <div className="d-flex justify-content-between">
                  <strong>{product.description}</strong>
                  <span>₹ {product.amount}</span>
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <small>Rate: ₹{product.rate}</small>
                  <small>Qty: {product.quantity}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Clear Cart */}
          <MDBBtn
            className="mt-3"
            disabled={selectedProducts.length === 0}
            color="secondary"
            onClick={clearCart}
            size="lg"
          >
            Clear Cart
          </MDBBtn>

          {/* Pricing Section (Fixed at Bottom) */}
          <div
            className="total-pricing rounded-2"
            style={{
              position: "sticky",
              bottom: "0",
              left: "0",
              background: "#fff",
              padding: "1rem",
              borderTop: "1px solid #ddd",
              marginTop: "1rem",
            }}
          >
            <div className="price-control d-flex justify-content-between">
              <div className="heading sub-price">Sub Total</div>
              <div className="price sub-price">₹ {subTotalHandle().toFixed(2)}</div>
            </div>
            <div className="price-control d-flex justify-content-between">
              <div className="heading sub-price">GST @ 18%</div>
              <div className="price sub-price">
                ₹ {(subTotalHandle() * 0.18).toFixed(2)}
              </div>
            </div>
            <div className="price-control d-flex justify-content-between fw-bold">
              <div className="heading main-price">Total</div>
              <div className="price main-price">₹ { totalHandle().toFixed(2)}</div>
            </div>

            {/* Action Buttons */}
            <MDBBtn
              className="mt-3 w-100"
              disabled={selectedProducts.length === 0}
              color="secondary"
              onClick={generatePDFPreview}
              size="lg"
            >
              <MDBIcon fas icon="receipt" /> &nbsp; View Performa Invoice
            </MDBBtn>

            <MDBBtn
              className="mt-3 w-100"
              disabled={selectedProducts.length === 0}
              color="secondary"
              onClick={goToPayment}
              size="lg"
            >
              <MDBIcon fas icon="shopping-cart" /> &nbsp; Make Payment
            </MDBBtn>
          </div>
        </div>
      </div>
    </MDBCol>
  </>
)}




      {(paymentSlider) && (
        <div className="overlay-wrapper">
          {/* <MDBBtn
            className="download-pdf overlay-download"
            disabled={selectedProducts.length === 0}
            onClick={generatePDF}
          >
            <MDBIcon fas icon="cloud-download-alt" />
            &nbsp; Download pdf
          </MDBBtn> */}

          <div
            // className="bg-secondary"
            style={{
              position: "fixed",
              left: 0,
              background: "#fff",
              width: "100vw",
              height: "100vh",
              zIndex: "999",
              borderRight: "1px solid #ddd",
              paddingLeft: "5%",
              paddingRight: "5%",
              paddingTop: "100px",
              paddingBottom: "50px",
              overflowY: "auto",
            }}
          >
            <h3 className="fw-bold">
              Almost there! Let's confirm your order..
            </h3>

            <MDBRow className="gap-2">
              <MDBCol className="p-0 mt-5">
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
                <MDBCol className="stretch-height">
                  <MDBTypography className="mt-4 mb-0 fw-medium text-muted">
                    Steps
                  </MDBTypography>
                  <MDBTypography
                    tag="h6"
                    className="mt-0 mb-2 fw-normal bg-white p-3 rounded-5"
                  >
                    Make a payment of <strong>₹{(totalHandle() / 2).toFixed(2)}</strong>{" "}
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

                  <hr className="mt-4" />
                    <div>
                      <MDBTypography tag="h3" className="mt-3 mb-4 fw-semibold">
                        Upload Payment Proof
                      </MDBTypography>

                      <MDBTypography tag="h6" className="mb-3">
                        Accepts PDFs or images (max 10MB)
                      </MDBTypography>
                      {paymentProofFile && (
                        <MDBTypography small className="text-muted">
                          {paymentProofFile.name} (
                          {(paymentProofFile.size / 1024).toFixed(2)} KB)
                        </MDBTypography>
                      )}
                      <MDBFile
                        id="paymentProofUpload"
                        onChange={handlePaymentProofChange}
                        className="mb-2" // Added margin bottom
                        style={{ maxWidth: "400px" }}
                      />

                      {/* <hr className="mt-4" />

                      <div>
                          <MDBTypography tag="h6" className="mb-2">Select Delivery Type</MDBTypography>
                          <MDBRadio name='deliveryType' id='flexRadioDefault1' label='Self Pickup' value="SELF" onChange={e => setDeliveryType(e.target.value)} />
                          <MDBRadio name='deliveryType' id='flexRadioDefault2' label='Full Truck' value="FULL" onChange={e => setDeliveryType(e.target.value)} />
                          <MDBRadio name='deliveryType' id='flexRadioDefault3' label='Part Truck' value="PART" onChange={e => setDeliveryType(e.target.value)} />
                        </div> */}

                      
                    </div>

                  <div className="d-flex flex-row justify-content-between align-items-center">
                    <MDBBtn
                        onClick={confirmOrder}
                        className="mt-4"
                        color="primary"
                        size="lg"
                        disabled={!paymentProofFile || deliveryType === ""}
                      > 
                        <MDBIcon fas icon="check" />
                        &nbsp; Confirm Order
                    </MDBBtn>
                  <MDBBtn
                    onClick={() => clearCurrentPdfView()}
                    className="mt-4"
                    color="primary"
                    size="lg"
                  >
                    <MDBIcon fas icon="arrow-left" style={{marginRight: '10px'}} />
                    Go Back
                  </MDBBtn>
                  </div>
                </MDBCol>
              </MDBCol>

              <MDBCol className="p-0 mt-5">
                <div className="rounded-5 shadow-3-strong bg-white min-h-100">
                  <MDBTypography
                    tag="h5"
                    className="px-3 py-3 bg-primary text-white mb-0 text-left fw-medium"
                    style={{
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                    }}
                  >
                    UPI Details
                  </MDBTypography>
                  <div className="px-3 py-3 d-flex flex-column gap-2">
                    <MDBTypography tag="p" className="text-dark mb-0">
                      <strong className="me-1">UPI ID</strong>
                    </MDBTypography>

                    <MDBBtn
                      outline
                      color="primary"
                      onClick={copyUpiId}
                      className="flex flex-row w-100 align-items-center justify-content-between mb-2 lowercase"
                      style={{ textTransform: "lowercase" }}
                    >
                      <span>navdeepkamboj08-3@okhdfcbank</span>{" "}
                      <MDBIcon fas icon="copy" />
                    </MDBBtn>
                    <div className="d-flex justify-content-center align-items-center">
                      <img
                        src={"/Assets/Images/upi.jpeg"}
                        alt="UPI"
                        style={{ width: "50%" }}
                      />
                    </div>

                    
                  </div>
                </div>
              </MDBCol>
            </MDBRow>
          </div>
        </div>
      )}

      
    </MDBRow>
    </>
  );
};

export default SelectionContainer;
