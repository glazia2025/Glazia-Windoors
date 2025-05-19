import React, { useEffect, useState } from "react";
import UserProducts from "./UserProducts/UserProducts";
import {
  MDBBtn,
  MDBCol,
  MDBContainer,
  MDBDropdown,
  MDBDropdownItem,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBIcon,
  MDBInput,
  MDBRow,
  MDBTooltip,
  MDBTypography,
} from "mdb-react-ui-kit";
import { useSearchParams } from "react-router-dom";
import OrderList from "./OrderList";
import CompletedOrders from "./CompletedOrders";
import Squares from "./ui/Squares/Squares";

const UserOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [userRole, setUserRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  useEffect(() => {
    handleSearchParamsChange(searchParams);
  }, [searchParams]);

  const handleSearchParamsChange = (searchParams) => {
    console.log(searchParams);
    const status = searchParams.get("status");
    if (status) {
      setSelectedStatus(status);
    }
  };

  const renderSelectedComponent = () => {
    if (selectedStatus === "ongoing") {
      return <OrderList />;
    } else if (selectedStatus === "completed") {
      return <CompletedOrders />;
    } else if (selectedStatus === "all") {
      return <OrderList />;
    }
  };

  return (
    <>
      <div className="bg-transparent">
        <MDBRow className="pdf-row-wrapper">
          <MDBCol className="main-selectors" style={{ minWidth: "70%" }}>
            <MDBRow className="d-flex justify-content-between align-items-end">
              <MDBCol className="btns-container w-100 justify-content-between">
                <MDBRow>
                  <h1 style={{ width: "max-content" }}>Order History</h1>
                </MDBRow>
                <MDBRow className="d-flex justify-content-between align-items-center">
                  <h4 style={{ width: "max-content" }}>
                    View, search and filter
                    {userRole === "admin" ? "" : " your"} orders!{" "}
                    <MDBIcon fas icon="check-circle" />
                  </h4>
                </MDBRow>
              </MDBCol>

              <MDBRow
                className="d-flex gap-3"
                style={{ marginTop: "20px", maxWidth: "400px" }}
              >
                <MDBCol
                  md="auto"
                  className="mb-3 mx-0 px-0"
                  style={{ flex: "1 1 auto" }}
                >
                  <MDBBtn
                    style={{ width: "100%" }}
                    size="lg"
                    color={selectedStatus === "all" ? "primary" : "light"}
                    onClick={() => setSearchParams({ status: "all" })}
                  >
                    All
                  </MDBBtn>
                </MDBCol>
                <MDBCol
                  md="auto"
                  className="mb-3 mx-0 px-0"
                  style={{ flex: "1 1 auto" }}
                >
                  <MDBBtn
                    style={{ width: "100%" }}
                    size="lg"
                    color={selectedStatus === "ongoing" ? "primary" : "light"}
                    onClick={() => setSearchParams({ status: "ongoing" })}
                  >
                    Ongoing
                  </MDBBtn>
                </MDBCol>
                <MDBCol
                  md="auto"
                  className="mb-3 mx-0 px-0"
                  style={{ flex: "1 1 auto" }}
                >
                  <MDBBtn
                    style={{ width: "100%" }}
                    size="lg"
                    color={selectedStatus === "completed" ? "primary" : "light"}
                    onClick={() => setSearchParams({ status: "completed" })}
                  >
                    Completed
                  </MDBBtn>
                </MDBCol>
              </MDBRow>
            </MDBRow>

            <MDBRow>
              <MDBCol md="12" className="mt-4">
                <OrderList selectedStatus={selectedStatus} />
              </MDBCol>
            </MDBRow>
          </MDBCol>
        </MDBRow>
      </div>
    </>
  );
};

export default UserOrders;
