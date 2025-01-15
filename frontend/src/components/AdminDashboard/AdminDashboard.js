import React, { useState, useEffect, useRef } from "react";
import "./AdminDashboard.css";
import { MDBRow, MDBCol, MDBBtn, MDBIcon } from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import ProfileOptions from "./ProfileTable/ProfileTable";
import HardwareOptions from "../UserDashboard/HardwareOptions";
import AccessoriesOptions from "../UserDashboard/AcessoriesOptions";
import "jspdf-autotable";
import * as pdfjs from "pdfjs-dist";
import { addSelectedProducts } from "../../redux/selectionSlice";
import axios from "axios";

// Initialize pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { selectedOption, productsByOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});

  // Aggregate products from all options
  const selectedProducts = Object.values(productsByOption).flat();
  const prevSelectedProducts = useRef([]);

  useEffect(() => {
    prevSelectedProducts.current = selectedProducts;
   }, [selectedProducts]);

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

   useEffect(() => {
    fetchProducts();
  }, []);

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileOptions onProductSelect={onProductSelect} profileData={profileOptions} selectedProfiles={productsByOption.profile} refreshProducts={fetchProducts}/>;
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
  };

  return (
    <MDBRow className="pdf-row-wrapper">
      <MDBCol style={{ flex: "1 1 auto", margin: "5%" }}>
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
    </MDBRow>
  );
};

export default AdminDashboard;
