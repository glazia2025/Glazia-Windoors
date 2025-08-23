import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../redux/userSlice';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBInput,
  MDBIcon,
} from 'mdb-react-ui-kit';
import api from '../../utils/api';

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editableUser, setEditableUser] = useState(user);

  useEffect(() => {
      if (window.gtag) {
        window.gtag("event", "user_profile", {
          page_path: window.location.pathname,
        });
      }
    }, [window]);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/admin/login'); // Redirect to login if not authenticated
        return;
      }

      const fetchAndStoreUser = async () => {
        try {
          const response = await api.get('/admin/getUser', {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch(setUser(response.data.user));
        } catch (err) {
          console.error('Error fetching user:', err);
          navigate('/admin/login');
        }
      };

      fetchAndStoreUser();
    }
  }, [dispatch, navigate, user]);

  useEffect(() => {
    setEditableUser(user);
  }, [user]);

  const handleInputChange = (field, value) => {
    setEditableUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await api.put(
        '/user/updateUser',
        { ...editableUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setUser(editableUser));
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'failed') {
    return <p>Error: {error}</p>;
  }

  return user ? (
    <section
      style={{
        backgroundColor: '#eee',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '5%'
      }}
    >
      <MDBContainer className="py-5">
        <MDBRow className='mt-10'>
          <MDBCol lg="4">
            <MDBCard className="mb-4" style={{ height: '100%' }}>
              <MDBCardBody className="text-center">
                <h4 className="mb-4">My Profile</h4> {/* Added heading */}
                <MDBCardImage
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                  alt="avatar"
                  className="rounded-circle mb-4"
                  style={{ width: '150px' }}
                  fluid
                />
                <p className="text-muted mb-1">{editableUser?.name}</p>
                <p className="text-muted mb-4">
                  {editableUser?.city}, {editableUser?.state}
                </p>
                <MDBBtn onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}>
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol lg="8">
            <MDBCard className="mb-4" style={{ height: '100%' }}>
              <MDBCardBody>
                {[
                  { label: 'Full Name', field: 'name', icon: 'user' },
                  { label: 'Email', field: 'email', icon: 'envelope' },
                  { label: 'Phone', field: 'phoneNumber', icon: 'phone' },
                  { label: 'GST No.', field: 'gstNumber', icon: 'file-invoice' },
                  { label: 'PinCode', field: 'pincode', icon: 'map-pin' },
                  { label: 'City', field: 'city', icon: 'city' },
                  { label: 'State', field: 'state', icon: 'map' },
                  { label: 'Address', field: 'address', icon: 'home' },
                ].map(({ label, field, icon }) => (
                  <React.Fragment key={field}>
                    <MDBRow>
                      <MDBCol sm="3" className="d-flex align-items-center">
                        <MDBIcon fas icon={icon} className="me-2" />
                        <MDBCardText>{label}</MDBCardText>
                      </MDBCol>
                      <MDBCol sm="9">
                        {isEditing ? (
                          <MDBInput
                            value={editableUser?.[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            disabled={field === 'phoneNumber' || field === 'gstNumber'} 
                          />
                        ) : (
                          <MDBCardText className="text-muted">{editableUser?.[field]}</MDBCardText>
                        )}
                      </MDBCol>
                    </MDBRow>
                    <hr />
                  </React.Fragment>
                ))}
                <iframe src={user.paUrl} width="100%" height="450px" />
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  ) : null;
};

export default UserProfile;
