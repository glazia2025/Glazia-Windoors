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
  const [showModal, setShowModal] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [paymentSlider, setPaymentSlider] = useState(false);

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
          deliveryType
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

  const sendMailOrderProcessing = async (pdfData) => {
    const emailData = {
      to: user.email,
      subject: "Glazia Windoors Order In Process",
      text: `
Dear ${user.name},
Thank you for choosing Glazia Windoors – your one-stop solution for all your aluminum needs!
    
We are pleased to inform you that we are processing your order. Please find the attached PDF document of the Proforma Invoice for your reference. It contains the details of your order and other related information.
    
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

  const sendMailOrderConfirmed = async () => {
    const emailData = {
      to: user.email,
      subject: "Glazia Windoors Order Is Confirmed",
      text: `
Dear ${user.name},
Thank you for choosing Glazia Windoors – your one-stop solution for all your aluminum needs!
    
We are pleased to inform you that your order is confirmed. Please wait for the final payment date.
    
If you have any questions or need further assistance, feel free to reach out to us. Our team is here to provide you with the best service for all your aluminum requirements.
    
Thank you once again for choosing us. We look forward to serving you.
    
Best regards,  
Glazia Windoors Pvt Ltd.   
[www.glazia.in]  
[+91 9958053708]
      `,
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

  const sendMailOrderComplete = async (pdfData) => {
    const emailData = {
      to: user.email,
      subject: "Glazia Windoors Order Is Complete",
      text: `
Dear ${user.name},
Thank you for choosing Glazia Windoors – your one-stop solution for all your aluminum needs!
    
We are pleased to inform you that your order has been completed. Please check out the documents related to your order delivery on the app.
    
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


  const createProformaInvoiceDep = () => {
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // Draw border around content area
    doc.setDrawColor(0); // Black color
    doc.setLineWidth(0.5); // Border thickness
    doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    return doc;
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
    {selectedProducts.length > 0 && <div className="cart-float-cta" onClick={() => {
      setIsSliderOpen(true);
    }}>
      <MDBIcon fas icon="shopping-cart" size="2x" />
    </div>}
                    
    <MDBRow className="pdf-row-wrapper">
      <MDBCol className="main-selectors" style={{ minWidth: "65%" }}>
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

      {isSliderOpen && (
        <>
          <div className="overlay" onClick={() => setIsSliderOpen(false)} />
          <MDBCol
          className="mt-0"
          style={{
            position: "fixed",
            right: "0",
            borderLeft: "1px solid #ddd",
            paddingLeft: "0px",
            bottom: "0",
            height: '100vh',
            backgroundColor: '#FFF',
            zIndex: 10000,
            width: "35vw",
          }}
        >
          <div className="canva-scroll-set">
            <div
              className="pdf-wrapper"
              style={{
                height: "100%",
                maxHeight: wrapperHeight,
                overflow: "scroll",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                width: "-webkit-fill-available",
                background: "#fff",
                gap: "2rem",
                padding: "1rem",
              }}
            >
              <div className="d-flex align-items-center justify-content-center">
                <h5 className="fw-bold text-center">Selected Products</h5>
                <div style={{ cursor: "pointer", marginLeft: "auto" }} onClick={() => setIsSliderOpen(false)}>
                  <MDBIcon fas icon="times" />
                </div>
              </div>
              
                  <table className="table table-striped table-bordered" style={{ width: "100%", marginTop: "1rem", tableLayout: 'auto' }}>
                      <thead>
                        <tr>
                          <td>Name</td>
                          <td>Rate</td>
                          <td>Quantity</td>
                          <td>Amount</td>
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

                    <MDBBtn
                  className="mt-3"
                  disabled={selectedProducts.length === 0}
                  color={"secondary"}
                  onClick={() => clearCart()}
                  size={"lg"}
                >
                  Clear Cart
                </MDBBtn>
              <div className="total-pricing m-2 rounded-2" style={{ position: "absolute", bottom: "0rem", width: "95%", left: "0" }}>
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
                  onClick={() => generatePDFPreview()}
                  size={"lg"}
                >
                  <MDBIcon fas icon="receipt" />
                  &nbsp; View Performa Invoice
                </MDBBtn>

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
        </>
      )}

      {paymentSlider && (
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

                <div className="rounded-5 shadow-3-strong bg-white min-h-100 mt-4">
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

                    <ImageZoom
                      productImage={"/Assets/Images/upi.jpeg"}
                      imageWidth="100%"
                    />
                  </div>
                </div>
              </MDBCol>

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

                <hr className="mt-4" />

                <MDBBtn
                  onClick={() => setShowModal(true)}
                  className="mt-4"
                  color="primary"
                  size="lg"
                >
                  <MDBIcon fas icon="check" />
                  &nbsp; Confirm Order
                </MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBContainer>
          {/* {isMakingPayment ? (
          ) : (
            <></>
          )} */}
        </div>
      )}

      {/* Slider component */}
      {paymentSlider && (
        <div
          className="slider"
          style={{
            transform: paymentSlider ? "translateX(0)" : "translateX(100%)",
            padding: "0",
            zIndex: 10000,
            padding: "1rem",
          }}
        >
          <div className="d-flex align-items-center justify-content-center">
            <h5 className="fw-bold text-center">Selected Products</h5>
            <div style={{ cursor: "pointer", marginLeft: "auto" }} onClick={() => clearCurrentPdfView()}>
              <MDBIcon fas icon="times" />
            </div>
          </div>
          <table className="table table-striped table-bordered" style={{ width: "100%", marginTop: "1rem", tableLayout: 'auto' }}>
            <thead>
              <tr>
                <td>Name</td>
                <td>Rate</td>
                <td>Quantity</td>
                <td>Amount</td>
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
          <div
            className="total-pricing-slider w-100"
            style={{ position: "absolute", bottom: "0", left: "0", width: "95%" }}
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
    <MDBModal className="bottom-sheet-modal" open={showModal} onClose={() => setShowModal(false)}>
        <MDBModalDialog >
          <MDBModalContent>
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

          <hr className="mt-4" />

          <div>
              <MDBTypography tag="h6" className="mb-2">Select Delivery Type</MDBTypography>
              <MDBRadio name='deliveryType' id='flexRadioDefault1' label='Self Pickup' value="SELF" onChange={e => setDeliveryType(e.target.value)} />
              <MDBRadio name='deliveryType' id='flexRadioDefault2' label='Full Truck' value="FULL" onChange={e => setDeliveryType(e.target.value)} />
              <MDBRadio name='deliveryType' id='flexRadioDefault3' label='Part Truck' value="PART" onChange={e => setDeliveryType(e.target.value)} />
            </div>

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
          </MDBModalContent>
        </MDBModalDialog>

      </MDBModal>
    </>
  );
};

export default SelectionContainer;
