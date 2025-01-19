import React, { useState } from "react";
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody } from "mdb-react-ui-kit";
import api from "../../../utils/api";

const TechnicalSheetForm = ({ category ,subCategory }) => {
  const [formData, setFormData] = useState({
    shutterHeight: null,
    shutterWidth: null,
    lockingMechanism: null,
    glassSize: null,
    alloy: null,
    interlock: null,
  });

  const fetchTechSheet = async () => {
    try {
      const response = await api.get(`http://localhost:5000/api/admin/get-tech-sheet?main=profile&category=${category}&subCategory=${subCategory}`);
      console.log(response)
      setFormData({
        shutterHeight: response.data.shutterHeight || null,
        shutterWidth: response.data.shutterWidth || null,
        lockingMechanism: response.data.lockingMechanism || '',
        glassSize: response.data.glassSize || '',
        alloy: response.data.alloy || '',
        interlock: response.data.interlock || null,
      });
    } catch (err) {
      console.error("Error fetching products", err);
    }
  }

  useState(() => {
    fetchTechSheet();
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const techData = {
      ...formData,
      category,
      subCategory,
      main: 'profile'
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.post(
        "http://localhost:5000/api/admin/update-tech-sheet",
        techData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <MDBCard className="mb-6">
        <MDBCardBody>
        <p className="h4 text-center mb-4">Technical Sheet</p>
        <MDBRow>
            {/* Left Column */}
            <MDBCol md="6">
            <MDBInput
                label="Max Shutter Height (mm)"
                type="number"
                name="shutterHeight"
                value={formData.shutterHeight}
                onChange={handleChange}
                className="mb-4"
            />
            <MDBInput
                label="Max Shutter Width (mm)"
                type="number"
                name="shutterWidth"
                value={formData.shutterWidth}
                onChange={handleChange}
                className="mb-4"
            />
            <MDBInput
                label="Locking Mechanism"
                type="text"
                name="lockingMechanism"
                value={formData.lockingMechanism}
                onChange={handleChange}
                className="mb-4"
            />
            </MDBCol>

            {/* Right Column */}
            <MDBCol md="6">
            <MDBInput
                label="Glass Size (mm)"
                type="text"
                name="glassSize"
                value={formData.glassSize}
                onChange={handleChange}
                className="mb-4"
            />
            <MDBInput
                label="Alloy"
                type="text"
                name="alloy"
                value={formData.alloy}
                onChange={handleChange}
                className="mb-4"
            />
            <MDBInput
                label="Interlock (mm)"
                type="number"
                name="interlock"
                value={formData.interlock}
                onChange={handleChange}
                className="mb-4"
            />
            </MDBCol>
        </MDBRow>
        <div className="text-center">
            <MDBBtn color="primary" onClick={handleSubmit}>
              Update Sheet
            </MDBBtn>
        </div>
        </MDBCardBody>
    </MDBCard>
  );
};

export default TechnicalSheetForm;
