import React, { useState } from 'react';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBBtn,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBCollapse,
} from 'mdb-react-ui-kit';
import './Header.css';
import { Navigate, useNavigate } from 'react-router-dom';
import logo from '../../glazia_logo.png';

const Header = ({ userRole, isLoggedIn, onLogout }) => {
  const [openBasic, setOpenBasic] = useState(false);
  const navigate = useNavigate(); 

  return (
    <MDBNavbar fixed='top' expand='lg' light bgColor='light'>
      <MDBContainer fluid>
        <MDBNavbarBrand href='/'><img className='logo' src={logo}/></MDBNavbarBrand>

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
                    <MDBNavbarLink href='/admin/dashboard'>Admin Dashboard</MDBNavbarLink>
                  ) : userRole === 'user' ? (
                    <MDBNavbarLink onClick={() => navigate('/user/orders')}>Products</MDBNavbarLink>
                  ) : null}
                </MDBNavbarItem>
              </>
            )}
          </MDBNavbarNav>

          {isLoggedIn && (
            <div className="d-flex align-items-center">
              {/* <form className='d-flex input-group w-auto me-3'>
                <input
                  type='search'
                  className='form-control'
                  placeholder='Type query'
                  aria-label='Search'
                />
                <MDBBtn color='primary'>Search</MDBBtn>
              </form> */}

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
                    My Profile
                  </MDBDropdownItem>
                  <MDBDropdownItem link onClick={onLogout}>
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
