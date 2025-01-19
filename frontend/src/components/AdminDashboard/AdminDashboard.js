import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { MDBRow, MDBCol, MDBBtn, MDBIcon, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBModalTitle, MDBCardSubTitle } from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import ProfileOptions from "./ProfileTable/ProfileTable";
import HardwareOptions from "./HardwareTable/HardwareTable";
import AccessoriesOptions from "../UserDashboard/AcessoriesOptions";
import { setActiveOption, setActiveProfile } from "../../redux/selectionSlice";
import api from '../../utils/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { selectedOption } = useSelector((state) => state.selection);

  const [nalcoPrice, setNalcoPrice] = useState("");
  const [basicModal, setBasicModal] = useState(false);
  const [ nalco, setNalco ] = useState(0);
  const [ nalcoDate, setNalcoDate ] = useState(0);

  const toggleOpen = () => setBasicModal(!basicModal);

  const renderSelectedComponent = () => {
    switch (selectedOption) {
      case "profile":
        return <ProfileOptions selectedOption={selectedOption} />;
      case "hardware":
        return <HardwareOptions selectedOption={selectedOption} />;
      case "accessories":
        return <AccessoriesOptions selectedOption={selectedOption} />;
      default:
        return <p>Please select an option.</p>;
    }
  };

  const changeCategory = (type, payload) => {
    dispatch(setActiveProfile(null));
    dispatch(setActiveOption(null));
    dispatch({ type, payload });
  };

  const updateNalco = async () => {
    const token = localStorage.getItem('authToken'); 
    try {
        const response = await api.post('http://localhost:5000/api/admin/update-nalco', {nalcoPrice}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setNalcoPrice("");
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date());
  };

  const fetchNalcoPrice = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get('http://localhost:5000/api/admin/get-nalco', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNalco(response.data[0]);
      setNalcoDate(formatDate(response.data[0].date));
    }catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchNalcoPrice();
  }, []);

  return (
    <MDBRow className="pdf-row-wrapper">
      <MDBCol className="admin-dashboard" style={{ flex: "1 1 auto" }}>
        <MDBRow className="d-flex justify-content-between align-items-center">
          <h4 style={{ width: "max-content" }}>
            Admin Panel <MDBIcon fas icon="tools" />
          </h4>
          <div className="d-flex align-items-center" style={{width: 'max-content'}}>
            <MDBBtn style={{width: 'max-content'}}
              color="success"
              onClick={() => setBasicModal(true)}
            >
              Update Nalco Price
            </MDBBtn>
            <span className="m-2 text-muted small">
              last updated - {nalcoDate}
            </span>
          </div>
        </MDBRow>
        <MDBRow className="d-flex" style={{ marginTop: "20px" }}>
          <MDBCol md="auto" className="mb-3" style={{ flex: "1 1 auto" }}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "profile" ? "primary" : "light"}
              onClick={() => changeCategory("selection/setSelectedOption", "profile")}
            >
              Profile
            </MDBBtn>
          </MDBCol>
          <MDBCol md="auto" className="mb-3" style={{ flex: "1 1 auto" }}>
            <MDBBtn
              style={{ width: "100%" }}
              size="lg"
              color={selectedOption === "hardware" ? "primary" : "light"}
              onClick={() => changeCategory("selection/setSelectedOption", "hardware")}
            >
              Hardware
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol md="12" className="mt-4">
            <div>{renderSelectedComponent()}</div>
          </MDBCol>
        </MDBRow>

        <MDBModal open={basicModal} onClose={() => setBasicModal(false)} tabIndex="-1">
          <MDBModalDialog>
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle>Update Nalco Price <MDBIcon fas icon="dollar-sign" /></MDBModalTitle>
                <MDBBtn className="btn-close" color="none" onClick={toggleOpen}></MDBBtn>
              </MDBModalHeader>
              <MDBModalBody>
                <div className="mb-3">
                  <label htmlFor="nalcoPriceInput" className="form-label">
                    Enter Nalco Price  (per Ton):
                  </label>
                  <input
                    type="number"
                    id="nalcoPriceInput"
                    className="form-control"
                    placeholder="Enter price"
                    value={nalcoPrice}
                    onChange={(e) => setNalcoPrice(e.target.value)}
                  />
                </div>
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color="secondary" onClick={() => setBasicModal(false)}>
                  Close
                </MDBBtn>
                <MDBBtn color="primary" onClick={updateNalco}>
                  Update Price
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </MDBCol>
    </MDBRow>
  );
};

export default AdminDashboard;
