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
  MDBFile,
} from "mdb-react-ui-kit";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { convertFileToBase64 } from "../../utils/common";

const UploadPaymentProofModal = (props) => {
  const { isOpen, title, message, payment, onConfirm, onClose } = props;

  const [userRole, setUserRole] = useState(null);
  const [proof, setProof] = useState(null);
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
    setIsConfirmed(false);
    setProof(null);
    setErrors({});
  };

  const doOnConfirm = async () => {
    if (payment.isApproved) {
      toast.error("Payment already approved");
      return;
    }

    if (!proof) {
      handleErrors("proof", "Please upload the payment proof");
      return;
    }

    if (isConfirmed) {
      try {
        const base64Proof = await convertFileToBase64(proof);
        onConfirm({ payment, proof: base64Proof }, () => {
          clearModal();
        });
      } catch (error) {
        console.error(error);
        toast.error("Error uploading payment proof");
      }
    } else {
      handleErrors("confirm_action", "Check this box to proceed");
    }
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

  // if (!userRole || !payment) return <></>;

  return (
    <MDBModal open={isOpen} onClose={doOnClose} tabIndex="-1">
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle className="fw-bold">{title}</MDBModalTitle>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={doOnClose}
            ></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <div className="mb-3">
              <p className="mb-3 text-muted fs-6 fst-italic">{message}</p>

              <div className="mb-3">
                <div className="mb-5">
                  <label
                    htmlFor="confirmCheckbox"
                    className="form-label text-dark fw-bold fs-6"
                  >
                    Upload the payment proof
                  </label>

                  <MDBTypography tag="h6" className="mb-3">
                    Accepts PDFs or images (max 10MB)
                  </MDBTypography>
                  <MDBFile
                    id="proof"
                    onChange={(e) => {
                      setProof(e.target.files[0]);
                      handleErrors("proof", null);
                    }}
                  />

                  {proof && (
                    <MDBTypography small className="text-muted mt-2">
                      {proof.name} ({(proof.size / 1024).toFixed(2)} KB)
                    </MDBTypography>
                  )}

                  {errors.proof && (
                    <p className="text-danger small fst-italic mt-2">
                      {errors.proof}
                    </p>
                  )}

                  {proof && (
                    <img
                      className="w-100 rounded-5"
                      src={URL.createObjectURL(proof)}
                      alt="Payment Proof"
                    />
                  )}
                </div>

                <label className="form-label text-dark fw-bold fs-6">
                  Check the box below to confirm you're sure that you want to
                  upload this payment proof.
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
            <MDBBtn
              color="primary"
              onClick={doOnConfirm}
              className="fw-bold"
              size="lg"
              disabled={!proof}
            >
              Upload Proof
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default UploadPaymentProofModal;
