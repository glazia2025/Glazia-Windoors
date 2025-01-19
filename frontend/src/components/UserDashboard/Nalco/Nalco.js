import React, { useEffect, useState } from 'react';
import {
  MDBCard,
  MDBCardTitle,
  MDBCardBody,
  MDBCardHeader,
  MDBIcon
} from 'mdb-react-ui-kit';
import api from '../../../utils/api';

const Nalco = () => {
  const [ nalco, setNalco ] = useState(0);
  
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const fetchNalcoPrice = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get('http://localhost:5000/api/admin/get-nalco', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNalco(response.data[0]);
    }catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchNalcoPrice();
  }, []);

  return (
    <div>
      <MDBCard style={{width: 'max-content'}} background='primary' className='text-white mb-3'>
        <MDBCardHeader>Today &nbsp; <MDBIcon far icon="calendar-check" /> {formattedDate}</MDBCardHeader>
        <MDBCardBody>
          <MDBCardTitle>Nalco Price Aluminium</MDBCardTitle>
          <MDBCardTitle>
            ₹{nalco.nalcoPrice/1000} / Kg
          </MDBCardTitle>
        </MDBCardBody>
      </MDBCard>
    </div>
  );
}

export default Nalco;