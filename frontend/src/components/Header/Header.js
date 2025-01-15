import React, { useEffect, useState } from 'react';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBCollapse,
} from 'mdb-react-ui-kit';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../glazia_logo.png';

const Header = ({ isLoggedIn, onLogout }) => {
  const [openBasic, setOpenBasic] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  return (
    <MDBNavbar fixed='top' expand='lg' light bgColor='light'>
      <MDBContainer fluid>
        <MDBNavbarBrand><img className='logo' src={logo}/></MDBNavbarBrand>

        <MDBNavbarToggler
          aria-controls='navbarSupportedContent'
          aria-expanded='false'
          aria-label='Toggle navigation'
          onClick={() => setOpenBasic(!openBasic)}
        >
          <MDBIcon icon='bars' fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar open={openBasic}>
          <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
            {isLoggedIn && (
              <>
                <MDBNavbarItem>
                  <MDBNavbarLink active aria-current='page' href='#'>
                    Home
                  </MDBNavbarLink>
                </MDBNavbarItem>

                <MDBNavbarItem>
                  {userRole === 'admin' ? (
                    <MDBNavbarLink onClick={() => navigate('/admin/dashboard')}>Admin Dashboard</MDBNavbarLink>
                  ) : userRole === 'user' ? (
                    <MDBNavbarLink onClick={() => navigate('/user/orders')}>Products</MDBNavbarLink>
                  ) : null}                
                </MDBNavbarItem>

                <MDBNavbarItem>
                  {userRole === 'admin' && <MDBNavbarLink onClick={() => navigate('/admin/dashboard/add-product')}>Add products</MDBNavbarLink>}
                </MDBNavbarItem>
              </>
            )}
          </MDBNavbarNav>

          {isLoggedIn && (
            <div className="d-flex align-items-center">
              {/* Connect with Us Dropdown */}
              {userRole !== 'admin' && <MDBDropdown className="me-3">
                <MDBDropdownToggle tag='a' className='nav-link' style={{ cursor: 'pointer' }}>
                  <MDBIcon fas icon="headphones-alt" style={{color: '#386bc0', fontWeight: 'bold'}}/> Connect with Us
                </MDBDropdownToggle>
                <MDBDropdownMenu className='dropdown-menu-end'>
                  <MDBDropdownItem link href="tel:+1234567890">
                    <div className='d-flex align-items-center fs-6'>
                      {/* <MDBIcon fas icon="phone" />  */}
                      <img src='/Assets/Icons/contact.png'/>
                      <div className='d-flex flex-column call' style={{marginLeft: '10px'}}>
                        <span style={{fontWeight: 'bold'}}>Call Us</span>
                        <span className='company-number'>+91 9958053708</span>
                      </div>
                    </div>
                  </MDBDropdownItem>
                  <MDBDropdownItem link href="mailto:support@example.com">
                    <div className='d-flex align-items-center fs-6'>
                        {/* <MDBIcon fas icon="phone" />  */}
                        <img src='/Assets/Icons/mail.png'/>
                        <div className='d-flex flex-column call' style={{marginLeft: '10px'}}>
                          <span style={{fontWeight: 'bold'}}>Email Us</span>
                          <span className='company-email'>contact@glazia.com</span>
                        </div>
                    </div>
                  </MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>}

              {/* User Profile Dropdown */}
              <MDBDropdown>
                <MDBDropdownToggle tag='a' className='nav-link d-flex align-items-center' style={{ cursor: 'pointer' }}>
                  <img
                    src='../../../Assets/Icons/user.png'
                    className='rounded-circle'
                    height='40'
                    alt='User Avatar'
                    loading='lazy'
                  />
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  <MDBDropdownItem link onClick={() => navigate('/profile')}>
                    <MDBIcon fas icon="user-alt" />&nbsp;
                    My Profile
                  </MDBDropdownItem>
                  <MDBDropdownItem link onClick={onLogout}>
                    <MDBIcon fas icon="sign-out-alt" />&nbsp;
                    Logout
                  </MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>
            </div>
          )}
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default Header;
