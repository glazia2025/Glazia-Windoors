import React, { useState, useEffect, useRef } from "react";

import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBDropdownLink,
  MDBCollapse,
  MDBRipple,
  MDBBadge,
  MDBInput,
  MDBListGroup,
  MDBListGroupItem
} from 'mdb-react-ui-kit';
import { MDBRow, MDBCol, MDBBtn } from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ProfileTable from "../ProfileTable/ProfileTable";
import HardwareOptions from "../../UserDashboard/HardwareOptions";
import AccessoriesOptions from "../../UserDashboard/AcessoriesOptions";
import { addSelectedProducts } from "../../../redux/selectionSlice";


const Sidenav = () => {
  const [showShow, setShowShow] = useState(false);
  const dispatch = useDispatch();
  const { selectedOption, productsByOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});

  // Aggregate products from all options
  const selectedProducts = Object.values(productsByOption).flat();
  const prevSelectedProducts = useRef([]);

  useEffect(() => {
    prevSelectedProducts.current = selectedProducts;
   }, [selectedProducts]);

   useEffect(() => {
    console.log("call")
    const fetchProducts = async () => {
        const token = localStorage.getItem('authToken'); 
        try {
            const response = await api.get('https://api.glazia.in/api/admin/getProducts', {
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
    fetchProducts();
  }, []);

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileTable onProductSelect={onProductSelect} profileData={profileOptions} selectedProfiles={productsByOption.profile}/>;
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

  const toggleShow = () => setShowShow(!showShow);

  return (
    <>
      <MDBCollapse show={showShow} tag="nav" className="d-lg-block bg-white sidebar">
        <div className="position-sticky">
          <MDBListGroup flush className="mx-3 mt-4">
            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded rounded'>
                <MDBIcon fas icon="tachometer-alt me-3" />
                Main Dashboard
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded' active aria-current='true'>
                <MDBIcon fas icon="chart-area me-3" />
                Website traffic
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="lock me-3" />
                Password
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="chart-line me-3" />
                Analitics
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="chart-pie me-3" />
                SEO
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon far icon="chart-bar me-3" />
                Orders
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="globe me-3" />
                International
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="building me-3" />
                Partners
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="calendar me-3" />
                Calendar
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 border-bottom rounded'>
                <MDBIcon fas icon="users me-3" />
                User
              </MDBListGroupItem>
            </MDBRipple>

            <MDBRipple rippleTag='span'>
              <MDBListGroupItem tag='a' href='#' action className='border-0 rounded'>
                <MDBIcon fas icon="money-bill me-3" />
                Sales
              </MDBListGroupItem>
            </MDBRipple>
          </MDBListGroup>
        </div>
      </MDBCollapse>

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
    </>
  );
}

export default Sidenav;