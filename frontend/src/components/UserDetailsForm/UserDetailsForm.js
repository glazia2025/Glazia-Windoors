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
  const [step, setStep] = useState(0);

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

  const gstStateCodes = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "97": "Other Territory"
};

function getStateFromGST(gstin) {
  if (!gstin || gstin.length !== 15) {
    throw new Error("Invalid GSTIN");
  }
  const stateCode = gstin.substring(0, 2);
  return gstStateCodes[stateCode] || "";
}
  
  useEffect(() => {
    if (receivedPhoneNumber) {
      setPhoneNumber(receivedPhoneNumber); // Use the receivedPhoneNumber prop
    }
  }, [receivedPhoneNumber]); // Correct dependency

  const checkGstin = async (e) => {
    if (!gstNumber) {
      setErrorMessage('GSTIN number is required');
      return;
    }

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://razorpay.com/api/gstin/${gstNumber}`,
      headers: { 
        'accept': 'application/json, text/plain, */*'
      }
    };

    axios.request(config).then(res => {
      const details = res.data.enrichment_details.online_provider.details;
      setUserName(details.legal_name.value);
      setState(getStateFromGST(gstNumber));
      setStep(1);
    }).catch(err => {
      setErrorMessage(err.toString());
    })


  }


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
<>
            {step === 0 &&<MDBCardBody>
              <h2 className="mb-4">Please fill out the details</h2>
              <MDBInput
                size="lg"
                wrapperClass="mb-4"
                label="GST Number (Further Non-Editable)"
                id="gstNumberInput"
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
              <MDBBtn className="w-100" size="lg" type="button" onClick={() => checkGstin()}>
                Check GSTIN
              </MDBBtn>
              
            </MDBCardBody>}
            {step === 1 && <MDBCardBody>
              <div className='user-detail-wrapper'>
                <div>
                <h2 className="mb-4">Please fill out the details</h2>
                <form onSubmit={handleSubmit}>
                  <MDBInput
                    size="lg"
                    wrapperClass="mb-4"
                    label="User Name"
                    id="userNameInput"
                    type="text"
                    disabled
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
                    disabled
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                  <MDBInput
                        size="lg"
                        wrapperClass="mb-4"
                        label="Pincode"
                        id="pincodeInput"
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />

                      <MDBInput
                        size="lg"
                        wrapperClass="mb-4"
                        label="City"
                        id="cityInput"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />

                      <MDBInput
                        size="lg"
                        wrapperClass="mb-4"
                        label="State"
                        id="stateInput"
                        type="text"
                        value={state}
                        disabled
                        onChange={(e) => setState(e.target.value)}
                      />

        

                  <MDBTextArea className="mb-4" id='textAreaExample' label='Complete Address' rows={3} onChange={(e) => setCompleteAddress(e.target.value)}></MDBTextArea>

                    <MDBCheckbox
                      size="lg"
                      wrapperClass="mb-4"
                      label="Do you agree to the partner's agreement"
                      id="partnerAgreement"
                      defaultChecked={isAgreed}
                      onChange={() => setIsAgreed(!isAgreed)}
                    />

                    {inv && <ParterAgreement userName={userName} completeAddress={completeAddress} gstNumber={gstNumber} pincode={pincode} city={city} state={state} phoneNumber={phoneNumber} email={email} setBlob={setBlob} />}

                  <MDBBtn className="w-100" size="lg" type="submit">
                    {inv ? 'Save Details' : 'Create Partner Agreement'}
                  </MDBBtn>
                </form>
              </div>
              

              </div>
              {errorMessage && <p className="text-danger">{errorMessage}</p>}
              {message && <p className="text-success">{message}</p>}
            </MDBCardBody>}
        </>
  );
};

export default UserDetailsForm;
