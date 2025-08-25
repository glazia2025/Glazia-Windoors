import React, { useEffect, useState } from 'react';
import {
  MDBCard,
  MDBCardTitle,
  MDBCardBody,
  MDBCardHeader,
  MDBIcon
} from 'mdb-react-ui-kit';
import api, { BASE_API_URL } from '../../../utils/api';

const Nalco = ({isLogin = false}) => {
  const [ nalco, setNalco ] = useState(0);
  
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const fetchNalcoPrice = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.get(`${BASE_API_URL}/admin/get-nalco`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNalco(response.data);
    }catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchNalcoPrice();
  }, []);

  return (
    <div>
      <MDBCard background='primary' style={{marginTop: isLogin ? '0rem' :'4rem'}} className='text-white mb-3 w-100'>
        <MDBCardHeader style={{textAlign: 'center'}}>{formattedDate} : Today's Nalco Price  ₹{nalco.nalcoPrice/1000} / Kg</MDBCardHeader>
        
      </MDBCard>
    </div>
  );
}

export default Nalco;