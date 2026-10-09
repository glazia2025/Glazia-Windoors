import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from 'mdb-react-ui-kit';
import './AdminForm.css';
import ProfileForm from './ProfileForm';
import HardwareForm from './HardwareForm';

const AdminForm = () => {

  const [mainOption, setMainOption] = useState("profile");

  const handleMainOptionChange = (option) => {
    setMainOption(option);
  };


  return (
    <MDBContainer>
      <MDBRow className='justify-content-center'>
        <MDBCol md="8">
          <h2 className="text-center my-4">Product Management Form</h2>

          {/* Main Options (Profile, Hardware, Accessories) */}
          <div className="d-flex justify-content-center mb-4">
            {['profile', 'hardware'].map(option => (
              <MDBBtn
                key={option}
                color={mainOption === option ? 'primary' : 'outline-primary'}
                onClick={() => handleMainOptionChange(option)}
                className="mx-2"
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MDBBtn>
            ))}
          </div>
          {mainOption && (
            <>
              {mainOption === 'profile' && <ProfileForm/>}
              {mainOption === 'hardware' && <HardwareForm/>}
            </>
          )}
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default AdminForm;
