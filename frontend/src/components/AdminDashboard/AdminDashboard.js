import React, { useState, useEffect, useRef } from "react";
import "./AdminDashboard.css";
import { MDBRow, MDBCol, MDBBtn, MDBIcon } from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import ProfileOptions from "./ProfileTable/ProfileTable";
import HardwareOptions from "./HardwareTable/HardwareTable";
import AccessoriesOptions from "../UserDashboard/AcessoriesOptions";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";
import { setActiveOption, setActiveProfile } from "../../redux/selectionSlice";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { selectedOption } = useSelector((state) => state.selection);

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileOptions selectedOption={selectedOption}/>;
      case "hardware":
        return <HardwareOptions selectedOption={selectedOption}/>;
      case "accessories":
        return <AccessoriesOptions selectedOption={selectedOption}/>;
      default:
        return <p>Please select an option.</p>;
    }
  };

  const changeCategory = (type, payload) => {
    dispatch(setActiveProfile(null));
    dispatch(setActiveOption(null));
    dispatch({ type, payload })
  }

  return (
    <MDBRow className="pdf-row-wrapper">
      <MDBCol style={{ flex: "1 1 auto", margin: "5%" }}>
        <MDBRow className="d-flex" style={{ marginTop: "20px" }}>
          <MDBCol md="auto" className="mb-3" style={{flex: '1 1 auto'}}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "profile" ? "primary" : "light"}
              onClick={() => changeCategory('selection/setSelectedOption', 'profile')}
            >
              Profile
            </MDBBtn>
          </MDBCol>
          <MDBCol md="auto" className="mb-3" style={{flex: '1 1 auto'}}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "hardware" ? "primary" : "light"}
              onClick={() => changeCategory("selection/setSelectedOption", "hardware")}
            >
              Hardware
            </MDBBtn>
          </MDBCol>
          {/* <MDBCol md="auto" className="mb-3" style={{flex: '1 1 auto'}}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "accessories" ? "primary" : "light"}
              onClick={() => changeCategory("selection/setSelectedOption", "accessories")}
            >
              Accessories
            </MDBBtn>
          </MDBCol> */}
        </MDBRow>

        <MDBRow>
          <MDBCol md="12" className="mt-4">
            <div>{renderSelectedComponent()}</div>
          </MDBCol>
        </MDBRow>
      </MDBCol>
    </MDBRow>
  );
};

export default AdminDashboard;
