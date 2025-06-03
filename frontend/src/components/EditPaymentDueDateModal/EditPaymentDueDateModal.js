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

const EditPaymentDueDateModal = (props) => {
  const { isOpen, title, message, payment, onConfirm, onClose } = props;

  const [userRole, setUserRole] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  useEffect(() => {
    if (payment && payment.dueDate && !dueDate) setDueDate(payment.dueDate);
  }, [payment]);

  const doOnClose = () => {
    clearModal();
    onClose();
  };

  const clearModal = () => {
    setIsConfirmed(false);
    setDueDate(null);
    setErrors({});
  };

  const doOnConfirm = async () => {
    if (payment.isApproved) {
      toast.error("Payment already approved");
      return;
    }

    if (payment.cycle !== 2) {
      toast.error("Only final payment's due date can be changed");
      return;
    }

    if (!dueDate) {
      handleErrors("dueDate", "Please select the final payment's due date");
      return;
    }

    if (isConfirmed) {
      onConfirm(
        {
          payment,
          dueDate,
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
    if (!proof || !proof.length) return <></>;

    if (proof.startsWith("data:image")) {
      return (
        <img className="w-100 rounded-5" src={proof} alt="Payment Proof" />
      );
    } else if (proof.startsWith("data:application/pdf")) {
      return <PDFViewer base64Pdf={proof} />;
    }
    return <></>;
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

  if (!userRole || !payment || !payment.dueDate) return <></>;

  return (
    <MDBModal open={isOpen} onClose={doOnClose} tabIndex="-1">
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle className="fw-bold">
              Edit Payment Due Date
            </MDBModalTitle>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={doOnClose}
            ></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <div className="mb-3">
              {userRole === "admin" && payment.cycle === 2 && (
                <>
                  <p className="mb-3 text-muted fs-6 fst-italic">{message}</p>

                  {userRole === "admin" &&
                    !payment.isApproved &&
                    payment.dueDate && (
                      <div className="mb-3">
                        <div className="mb-5">
                          <label
                            htmlFor="confirmCheckbox"
                            className="form-label text-dark fw-bold fs-6"
                          >
                            Edit the final payment's due date
                          </label>
                          <MDBInput
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                          />

                          {errors.dueDate && (
                            <p className="text-danger small fst-italic mt-2">
                              {errors.dueDate}
                            </p>
                          )}
                        </div>

                        <label className="form-label text-dark fw-bold fs-6">
                          Check the box below to confirm you're sure that you
                          want to update this payment due date.
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
                  Update Payment
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

export default EditPaymentDueDateModal;
