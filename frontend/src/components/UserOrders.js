import React, { useEffect, useState } from "react";
import OrderList from "./OrderList";
import CompletedOrders from "./CompletedOrders";
import {
  MDBBtn,
  MDBCol,
  MDBRow,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useSearchParams } from "react-router-dom";

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
    const status = searchParams.get("status");
    if (status) {
      setSelectedStatus(status);
    }
  };

  return (
    <div className="bg-white p-3">
      <MDBRow className="pdf-row-wrapper">
        <MDBCol className="" style={{marginTop: "6rem", padding: "2rem"}}>
          {/* Heading + Subheading */}
          <MDBRow className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end">
            <MDBCol className="btns-container w-100">
              <h1 className="fw-bold mb-2 text-center text-md-start" style={{ fontSize: "clamp(1.5rem, 2vw, 2.5rem)" }}>
                Order History
              </h1>
              <h5 className="text-center text-md-start" style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}>
                View, search and filter
                {userRole === "admin" ? "" : " your"} orders!{" "}
                <MDBIcon fas icon="check-circle" />
              </h5>
            </MDBCol>
          </MDBRow>

          {/* Filter Buttons */}
          <MDBRow className="d-flex justify-content-center justify-content-md-start gap-2 mt-4">
            <MDBCol xs="12" sm="4" md="auto">
              <MDBBtn
                className="w-100"
                size="lg"
                color={selectedStatus === "all" ? "primary" : "light"}
                onClick={() => setSearchParams({ status: "all" })}
              >
                All
              </MDBBtn>
            </MDBCol>
            <MDBCol xs="12" sm="4" md="auto">
              <MDBBtn
                className="w-100"
                size="lg"
                color={selectedStatus === "ongoing" ? "primary" : "light"}
                onClick={() => setSearchParams({ status: "ongoing" })}
              >
                Ongoing
              </MDBBtn>
            </MDBCol>
            <MDBCol xs="12" sm="4" md="auto">
              <MDBBtn
                className="w-100"
                size="lg"
                color={selectedStatus === "completed" ? "primary" : "light"}
                onClick={() => setSearchParams({ status: "completed" })}
              >
                Completed
              </MDBBtn>
            </MDBCol>
          </MDBRow>

          {/* Orders List */}
          <MDBRow className="mt-4">
            <MDBCol xs="12">
              <OrderList selectedStatus={selectedStatus} />
            </MDBCol>
          </MDBRow>
        </MDBCol>
      </MDBRow>
    </div>
  );
};

export default UserOrders;
