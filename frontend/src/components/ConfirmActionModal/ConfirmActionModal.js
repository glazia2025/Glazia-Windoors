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
} from "mdb-react-ui-kit";
import api from "../../utils/api";

const ConfirmActionModal = (props) => {
  const { isOpen, title, message, onConfirm, onClose } = props;
  const { user, status, error } = useSelector((state) => state.user);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  const doOnClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  const doOnConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    } else {
      handleErrors("confirm_action", "Please confirm you're sure.");
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

  if (!user) return <></>;

  return (
    <MDBModal open={isOpen} onClose={doOnClose} tabIndex="-1">
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>{title}</MDBModalTitle>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={doOnClose}
            ></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <div className="mb-3">
              <p className="mb-3 text-muted fs-6 fst-italic">{message}</p>
              <label htmlFor="nalcoPriceInput" className="form-label">
                Confirm that you're sure you know what you're doing..
              </label>
              <MDBCheckbox
                id="confirmCheckbox"
                label="Confirm"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />

              {errors.confirm_action && (
                <p className="text-danger fs-6 fst-italic mt-2">
                  {errors.confirm_action}
                </p>
              )}
            </div>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color="secondary" onClick={doOnClose}>
              Close
            </MDBBtn>
            <MDBBtn color="primary" onClick={doOnConfirm}>
              Confirm
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default ConfirmActionModal;
