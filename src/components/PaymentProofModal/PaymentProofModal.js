import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/userSlice";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBInput,
  MDBIcon,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBCheckbox,
  MDBTypography,
  MDBTextArea,
  MDBFile,
} from "mdb-react-ui-kit";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { convertFileToBase64 } from "../../utils/common";
import PDFViewer from "../PDFViewer/PDFViewer";

const PaymentProofModal = (props) => {
  const { isOpen, title, message, payment, onConfirm, onClose } = props;

  const [userRole, setUserRole] = useState(null);
  const [finalPaymentDueDate, setFinalPaymentDueDate] = useState(null);
  const [paymentVal, setPaymentVal] = useState(0);
  const [depositedAmount, setDepositedAmount] = useState("");
  const [onCompletionStep, setOnCompletionStep] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    name: "",
    phone: "",
    description: "",
  });
  const [eWayBill, setEWayBill] = useState(null);
  const [taxInvoice, setTaxInvoice] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const doOnClose = () => {
    clearModal();
    onClose();
  };

  const clearModal = () => {
    setOnCompletionStep(false);
    setDriverInfo({
      name: "",
      phone: "",
      description: "",
    });
    setEWayBill(null);
    setTaxInvoice(null);
    setIsConfirmed(false);
    setFinalPaymentDueDate(null);
    setDepositedAmount("");
    setErrors({});
  };

  const doOnConfirm = async () => {
    if (payment.isApproved) {
      toast.error("Payment already approved");
      return;
    }

    if (payment.cycle === 1 && !finalPaymentDueDate) {
      handleErrors(
        "finalPaymentDueDate",
        "Please select the final payment's due date"
      );
      return;
    }

    if (!depositedAmount || depositedAmount <= 0) {
      handleErrors(
        "depositedAmount",
        "Please enter the deposited amount"
      );
      return;
    }

    if (payment.cycle === 2 && payment.isApproved && !onCompletionStep) {
      setOnCompletionStep(true);
      return;
    }

    if (payment.cycle === 2 && payment.isApproved && onCompletionStep) {
      let hasErrors = false;
      if (!driverInfo) {
        handleErrors(
          "driver_info",
          "Driver info is required to complete the order"
        );
        hasErrors = true;
      }
      if (!driverInfo.name) {
        handleErrors(
          "driver_info.name",
          "Driver name is required to complete the order"
        );
        hasErrors = true;
      }

      if (!driverInfo.phone) {
        handleErrors(
          "driver_info.phone",
          "Driver phone is required to complete the order"
        );
        hasErrors = true;
      }

      if (driverInfo.description && driverInfo.description.length > 512) {
        handleErrors(
          "driver_info.description",
          "Driver description can not be more than 512 letters"
        );
        hasErrors = true;
      }

      if (!eWayBill) {
        handleErrors(
          "e_way_bill",
          "EWay Bill is required to complete the order"
        );
        hasErrors = true;
      }

      if (!taxInvoice) {
        handleErrors(
          "tax_invoice",
          "Tax Invoice is required to complete the order"
        );
        hasErrors = true;
      }

      if (hasErrors) {
        return;
      }
    }

    if (isConfirmed) {
      let eWayBillBase64 = null;
      let taxInvoiceBase64 = null;

      if (payment.cycle === 2 && payment.isApproved) {
        try {
          if (eWayBill) {
            eWayBillBase64 = await convertFileToBase64(eWayBill);
          }

          if (taxInvoice) {
            taxInvoiceBase64 = await convertFileToBase64(taxInvoice);
          }
        } catch (error) {
          console.error("Error converting files to base64:", error);
          toast.error("Error uploading files");
          return;
        }
      }

      onConfirm(
        {
          payment,
          finalPaymentDueDate,
          depositedAmount: parseFloat(depositedAmount),
          driverInfo,
          eWayBill: eWayBillBase64,
          taxInvoice: taxInvoiceBase64,
        },
        () => {
          clearModal();
        }
      );
    } else {
      handleErrors("confirm_action", "Check this box to proceed");
    }
  };

  const renderPdfOrImage = (proof) => {
    if (!proof || !proof.length)
      return (
        <div
          className="p-3 rounded-5 d-flex align-items-center"
          style={{
            borderLeft: "8px solid #a02040",
            background: "#a0204020",
            color: "#902040",
            fontWeight: "600",
          }}
        >
          Failed to render invalid payment proof
        </div>
      );

    if (proof.startsWith("data:image")) {
      return (
        <img className="w-100 rounded-5" src={proof} alt="Payment Proof" />
      );
    } else if (proof.startsWith("data:application/pdf")) {
      return <PDFViewer base64Pdf={proof} />;
    }
    return (
      <div
        className="p-3 rounded-5 d-flex align-items-center"
        style={{
          borderLeft: "8px solid #a02040",
          background: "#a0204020",
          color: "#902040",
          fontWeight: "600",
        }}
      >
        Failed to render invalid payment proof
      </div>
    );
  };

  const handleErrors = (key, val) => {
    setErrors((prev) => {
      let next = { ...prev, [key]: val };
      if (!val || !val.length) {
        delete next[key];
      }
      return next;
    });
  };

  if (!userRole || !payment || !payment.proofAdded) return <></>;

  return (
    <MDBModal open={isOpen} onClose={doOnClose} tabIndex="-1">
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            {userRole === "admin" &&
              payment.cycle === 2 &&
              onCompletionStep && (
                <MDBBtn
                  color="secondary"
                  className="px-3 me-2"
                  onClick={() => {
                    setOnCompletionStep(false);
                    // setDriverInfo({
                    //   name: "",
                    //   phone: "",
                    //   description: "",
                    // });
                    // setEWayBill(null);
                    // setTaxInvoice(null);
                  }}
                >
                  <MDBIcon fas icon="arrow-left" /> Back
                </MDBBtn>
              )}

            <MDBModalTitle className="fw-bold">
              {userRole === "admin" && payment.cycle === 2 && onCompletionStep
                ? "Order Completion"
                : userRole === "admin"
                ? payment.isApproved
                  ? "Payment Approved"
                  : "Approve Payment"
                : "Payment Proof"}
            </MDBModalTitle>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={doOnClose}
            ></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <div className="mb-3">
              {userRole === "admin" &&
              payment.cycle === 2 &&
              onCompletionStep ? (
                <>
                  <p className="mb-3 text-muted fs-6 fst-italic">
                    Add the following information to complete this order.
                  </p>
                  {/* <MDBTypography className="text-dark fw-bold fs-6">
                    Complete the order
                  </MDBTypography> */}

                  <MDBTypography className="text-dark fw-bold fs-6 mt-4 mb-0">
                    Driver Information
                  </MDBTypography>

                  <MDBTypography className="text-muted fw-normal small">
                    The customer will be able to view this information.
                  </MDBTypography>

                  <MDBInput
                    className="mt-2"
                    type="text"
                    id="driverName"
                    label="Driver Name"
                    value={driverInfo?.name}
                    onChange={(e) => {
                      setDriverInfo({ ...driverInfo, name: e.target.value });
                      handleErrors("driver_info.name", null);
                    }}
                  />

                  {errors["driver_info.name"] && (
                    <p className="text-danger small fst-italic mt-1">
                      {errors["driver_info.name"]}
                    </p>
                  )}

                  <MDBInput
                    className="mt-4"
                    type="text"
                    id="driverPhone"
                    label="Driver Phone"
                    value={driverInfo?.phone}
                    onChange={(e) => {
                      setDriverInfo({ ...driverInfo, phone: e.target.value });
                      handleErrors("driver_info.phone", null);
                    }}
                  />

                  {errors["driver_info.phone"] && (
                    <p className="text-danger small fst-italic mt-1">
                      {errors["driver_info.phone"]}
                    </p>
                  )}

                  <MDBTextArea
                    className="mt-4"
                    id="driverDescription"
                    label="Driver Description"
                    value={driverInfo?.description}
                    onChange={(e) =>
                      setDriverInfo({
                        ...driverInfo,
                        description: e.target.value,
                      })
                    }
                  />

                  {errors["driver_info.description"] && (
                    <p className="text-danger small fst-italic mt-1">
                      {errors["driver_info.description"]}
                    </p>
                  )}

                  <MDBTypography className="text-dark fw-bold fs-6 mt-5 mb-0">
                    EWay Bill
                  </MDBTypography>

                  <MDBTypography className="text-muted fw-normal small">
                    The customer will be able to view this information.
                  </MDBTypography>

                  <MDBFile
                    // className="mt-4"
                    id="eWayBill"
                    // label="EWay Bill"
                    // labelClass="mt-4"
                    // value={eWayBill}
                    onChange={(e) => {
                      setEWayBill(e.target.files[0]);
                      handleErrors("e_way_bill", null);
                    }}
                  />

                  {errors.e_way_bill && (
                    <p className="text-danger small fst-italic mt-1">
                      {errors.e_way_bill}
                    </p>
                  )}

                  <MDBTypography className="text-dark fw-bold fs-6 mt-5 mb-0">
                    Tax Invoice
                  </MDBTypography>

                  <MDBTypography className="text-muted fw-normal small">
                    The customer will be able to view this information.
                  </MDBTypography>

                  <MDBFile
                    // className="mt-4"
                    id="taxInvoice"
                    // label="Tax Invoice"
                    // labelClass="mt-4"
                    // value={taxInvoice}
                    onChange={(e) => {
                      setTaxInvoice(e.target.files[0]);
                      handleErrors("tax_invoice", null);
                    }}
                  />

                  {errors.tax_invoice && (
                    <p className="text-danger small fst-italic mt-1">
                      {errors.tax_invoice}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="mb-3 text-muted fs-6 fst-italic">{message}</p>

                  {userRole === "admin" && !payment.isApproved && (
                    <div className="mb-3">
                      {payment.cycle === 1 ? (
                        <div className="mb-5">
                          <label
                            htmlFor="confirmCheckbox"
                            className="form-label text-dark fw-bold fs-6"
                          >
                            Select the final payment's due date
                          </label>
                          <MDBInput
                            type="date"
                            id="finalPaymentDueDate"
                            value={finalPaymentDueDate}
                            onChange={(e) =>
                              setFinalPaymentDueDate(e.target.value)
                            }
                          />

                          <MDBInput
                            className="mt-2"
                            type="text"
                            id="paymentValue"
                            label="Payment Value"
                            value={paymentVal}
                            onChange={(e) => {
                              setPaymentVal(e.target.value);
                            }}
                          />

                          <MDBInput
                            className="mt-2"
                            type="number"
                            id="depositedAmount"
                            label="Deposited Amount *"
                            value={depositedAmount}
                            onChange={(e) => {
                              setDepositedAmount(e.target.value);
                              handleErrors("depositedAmount", null);
                            }}
                            min="0"
                            step="0.01"
                          />

                          {errors.finalPaymentDueDate && (
                            <p className="text-danger small fst-italic mt-2">
                              {errors.finalPaymentDueDate}
                            </p>
                          )}

                          {errors.depositedAmount && (
                            <p className="text-danger small fst-italic mt-2">
                              {errors.depositedAmount}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mb-5">
                          <MDBInput
                            className="mt-2"
                            type="number"
                            id="depositedAmount"
                            label="Deposited Amount *"
                            value={depositedAmount}
                            onChange={(e) => {
                              setDepositedAmount(e.target.value);
                              handleErrors("depositedAmount", null);
                            }}
                            min="0"
                            step="0.01"
                          />

                          {errors.depositedAmount && (
                            <p className="text-danger small fst-italic mt-2">
                              {errors.depositedAmount}
                            </p>
                          )}
                        </div>
                      )}

                      <label className="form-label text-dark fw-bold fs-6">
                        Check the box below to confirm you're sure that you want
                        to approve this payment.
                      </label>
                      <MDBCheckbox
                        id="confirmCheckbox"
                        label="Confirm"
                        checked={isConfirmed}
                        onChange={(e) => {
                          setIsConfirmed(e.target.checked);
                          handleErrors("confirm_action", null);
                        }}
                      />

                      {errors.confirm_action && (
                        <p className="text-danger small fst-italic mt-2">
                          {errors.confirm_action}
                        </p>
                      )}
                    </div>
                  )}

                  {renderPdfOrImage(payment.proof)}
                </>
              )}
            </div>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn
              color="secondary"
              onClick={doOnClose}
              className="fw-bold"
              size="lg"
            >
              Close
            </MDBBtn>
            {userRole === "admin" ? (
              payment.isApproved ? (
                <></>
              ) : (
                <MDBBtn
                  color="primary"
                  onClick={doOnConfirm}
                  className="fw-bold"
                  size="lg"
                >
                  Approve Payment
                </MDBBtn>
              )
            ) : (
              <></>
            )}
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default PaymentProofModal;
