import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { MDBBtn, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBTextArea, MDBCheckbox } from 'mdb-react-ui-kit';
import './UserDetailsForm.css';
import api from '../../utils/api';
import ParterAgreement from './PartnerAgreement/PartnerAgreement';
import { supabase } from '../../utils/supabase';

const UserDetailsForm = ({ receivedPhoneNumber }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [inv, setInv] = useState(false);
  const [blob, setBlob] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (receivedPhoneNumber) {
      setPhoneNumber(receivedPhoneNumber); // Use the receivedPhoneNumber prop
    }
  
    // Reset all form fields to initial values when the component is reinitialized or `receivedPhoneNumber` changes
    setUserName('');
    setEmail('');
    setGstNumber('');
    setPincode('');
    setCity('');
    setState('');
    setCompleteAddress('');
    setErrorMessage('');
    setMessage('');
  }, [receivedPhoneNumber]);
  
  useEffect(() => {
    if (receivedPhoneNumber) {
      setPhoneNumber(receivedPhoneNumber); // Use the receivedPhoneNumber prop
    }
  }, [receivedPhoneNumber]); // Correct dependency


  const handleSubmit = async (e) => {
    typeof e?.preventDefault === "function" && e?.preventDefault();

    // Simple validation
    if (!userName || !email || !gstNumber || !pincode || !city || !state || !completeAddress) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (!inv) {
      setInv(true)
    } else {
        if (!isAgreed) {
          setErrorMessage('Please mark the Partner Agreement as agreed to conitnue');
          return;
        }

         const { data, error } = await supabase
          .storage
          .from('pa')
          .upload(userName, blob, {
            cacheControl: '3600',
            upsert: false
          })
          console.log(data, error, 'supabase logs');
          if (data) {
            const paUrl = `https://kttdnoylgmnftrulhieg.supabase.co/storage/v1/object/public/pa/${encodeURIComponent(data.path)}`;
             try {
              // Make API call to save user details
              const body = {
                name: userName,
                email,
                gstNumber,
                city,
                state,
                address: completeAddress,
                phoneNumber: phoneNumber || '',
                pincode,
                paUrl
              }
              
              const response = await api.post('/user/register', body);
              localStorage.setItem('authToken', response.data.token);
              setMessage('User details saved successfully!');
              console.log("from form");
              navigate('/user/home');  // Redirect to the user's orders page or another page
            } catch (error) {
              setMessage('');
              setErrorMessage('Failed to save details. Please try again.');
            }
          }
    }
  };

  return (
<MDBCol>
          <MDBCard className="my-5">
            <MDBCardBody>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: '20px'}}>
                <div>
                <h2 className="mb-4">Please fill out the details</h2>
                <form onSubmit={handleSubmit}>
                  <MDBInput
                    size="lg"
                    wrapperClass="mb-4"
                    label="User Name"
                    id="userNameInput"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />

                  <MDBInput
                    disabled
                    size="lg"
                    wrapperClass="mb-4"
                    label="Phone Number (Non-Editable)"
                    id="phoneNumberInput"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <MDBInput
                    size="lg"
                    wrapperClass="mb-4"
                    label="Email"
                    id="emailInput"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <MDBInput
                    size="lg"
                    wrapperClass="mb-4"
                    label="GST Number (Further Non-Editable)"
                    id="gstNumberInput"
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />

                  {/* Pincode, City, and State in the same row */}
                  <MDBRow className="mb-4">
                    <MDBCol md="4">
                      <MDBInput
                        size="lg"
                        label="Pincode"
                        id="pincodeInput"
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </MDBCol>
                    <MDBCol md="4">
                      <MDBInput
                        size="lg"
                        label="City"
                        id="cityInput"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </MDBCol>
                    <MDBCol md="4">
                      <MDBInput
                        size="lg"
                        label="State"
                        id="stateInput"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </MDBCol>
                  </MDBRow>

                  <MDBTextArea className="mb-4" id='textAreaExample' label='Complete Address' rows={3} onChange={(e) => setCompleteAddress(e.target.value)}></MDBTextArea>

                    <MDBCheckbox
                      size="lg"
                      wrapperClass="mb-4"
                      label="Do you agree to the partner's agreement"
                      id="partnerAgreement"
                      defaultChecked={isAgreed}
                      onChange={() => setIsAgreed(!isAgreed)}
                    />

                  <MDBBtn className="w-100" size="lg" type="submit">
                    {inv ? 'Save Details' : 'Create Partner Agreement'}
                  </MDBBtn>
                </form>
              </div>
              {inv && <ParterAgreement userName={userName} completeAddress={completeAddress} gstNumber={gstNumber} pincode={pincode} city={city} state={state} phoneNumber={phoneNumber} email={email} setBlob={setBlob} />}

              </div>
              {errorMessage && <p className="text-danger">{errorMessage}</p>}
              {message && <p className="text-success">{message}</p>}
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
  );
};

export default UserDetailsForm;
