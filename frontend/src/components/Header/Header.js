import React, { useEffect, useState } from "react";
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
} from "mdb-react-ui-kit";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import logo from "../../Glazia.png";
import { useDispatch, useSelector } from "react-redux";
import api, { BASE_API_URL } from "../../utils/api";
import {
  setHardwareHeirarchy,
  setProfileHeirarchy,
} from "../../redux/heirarchySlice";
import {
  setActiveOption,
  setActiveProfile,
  setSelectedOption,
} from "../../redux/selectionSlice";

const Header = ({ isLoggedIn, onLogout }) => {
  const { user } = useSelector((state) => state.user);
  const [openBasic, setOpenBasic] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { hardwareHeirarchy } = useSelector((state) => state.heirarchy);
  const { profileHeirarchy } = useSelector((state) => state.heirarchy);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchProfileAndHardwareData = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const [profileResponse, hardwareResponse] = await Promise.all([
        api.get(`${BASE_API_URL}/user/get-profile-heirarchy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        api.get(`${BASE_API_URL}/user/get-hardware-heirarchy`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      dispatch(setProfileHeirarchy(profileResponse.data.products));
      dispatch(setHardwareHeirarchy(hardwareResponse.data.products));
    } catch (err) {
      console.log(err);
    }
  };

  const setActiveState = (mainOption, option, profile) => {
    dispatch(setActiveProfile(profile));
    dispatch(setActiveOption(option));
    dispatch(setSelectedOption(mainOption));
    userRole === "admin"
      ? navigate("/admin/dashboard")
      : navigate("/user/home");
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    if (isLoggedIn) {
      fetchProfileAndHardwareData();
    }
  }, []);

  const goToOrderPage = (status) => {
    if (userRole === "admin") {
      navigate(`/admin/dashboard/orders?status=${status}`);
    } else {
      navigate(`/user/orders?status=${status}`);
    }
  };

  return (
    <MDBNavbar fixed="top" expand="lg" light bgColor="white">
      <MDBContainer>
        <MDBNavbarBrand
          className="cursor-pointer"
          onClick={() =>
            userRole === "admin"
              ? navigate("/admin/dashboard")
              : navigate("/user/home")
          }
        >
          <img className="logo" src={logo} />
        </MDBNavbarBrand>
        <div className="mobile-connect-wrapper d-flex">
          {userRole !== "admin" && (
            <MDBDropdown className="me-3 mobile-connector">
              <MDBDropdownToggle
                tag="a"
                className="nav-link"
                style={{ cursor: "pointer" }}
              >
                <MDBIcon
                  fas
                  icon="headphones-alt"
                  style={{ color: "#386bc0", fontWeight: "bold" }}
                />{" "}
                Connect with Us
              </MDBDropdownToggle>
              <MDBDropdownMenu className="dropdown-menu-end">
                <MDBDropdownItem link href="tel:+1234567890">
                  <div className="d-flex align-items-center fs-6">
                    {/* <MDBIcon fas icon="phone" />  */}
                    <img src="/Assets/Icons/contact.png" />
                    <div
                      className="d-flex flex-column call"
                      style={{ marginLeft: "10px" }}
                    >
                      <span style={{ fontWeight: "bold" }}>Call Us</span>
                      <span className="company-number">+91 9958053708</span>
                    </div>
                  </div>
                </MDBDropdownItem>
                <MDBDropdownItem link href="mailto:support@example.com">
                  <div className="d-flex align-items-center fs-6">
                    {/* <MDBIcon fas icon="phone" />  */}
                    <img src="/Assets/Icons/mail.png" />
                    <div
                      className="d-flex flex-column call"
                      style={{ marginLeft: "10px" }}
                    >
                      <span style={{ fontWeight: "bold" }}>Email Us</span>
                      <span className="company-email">glazia.in@gmail.com</span>
                    </div>
                  </div>
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          )}
          <MDBNavbarToggler
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => setOpenBasic(!openBasic)}
          >
            <MDBIcon icon="bars" fas />
          </MDBNavbarToggler>
        </div>

        <MDBCollapse navbar open={openBasic}>
          <MDBNavbarNav className="mr-auto mb-2 mb-lg-0 gap-3">
            {isLoggedIn && (
              <>
                <MDBNavbarItem>
                  {userRole === "admin" ? (
                    <MDBNavbarLink
                      className="fw-semibold text-dark"
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      Dashboard
                    </MDBNavbarLink>
                  ) : userRole === "user" ? (
                    <MDBNavbarLink
                      className="fw-semibold text-dark"
                      onClick={() => navigate("/user/home")}
                    >
                      Home
                    </MDBNavbarLink>
                  ) : null}
                </MDBNavbarItem>
                <MDBNavbarItem>
                  <MDBDropdown>
                    <MDBDropdownToggle
                      tag="a"
                      className="nav-link cursor-pointer fw-semibold text-dark"
                    >
                      Profile
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      {profileHeirarchy?.map((item) => (
                        <MDBDropdownItem key={item.profile}>
                          <a
                            href="#"
                            className="dropdown-item d-flex justify-content-between align-items-center"
                          >
                            {item.profile}
                            <MDBIcon fas icon="angle-right" />
                          </a>
                          <ul className="dropdown-menu dropdown-submenu">
                            {item.options.map((subCategory) => (
                              <MDBDropdownItem key={subCategory}>
                                <a
                                  className="dropdown-item cursor-pointer"
                                  onClick={() =>
                                    setActiveState(
                                      "profile",
                                      subCategory,
                                      item.profile
                                    )
                                  }
                                >
                                  {subCategory}
                                </a>
                              </MDBDropdownItem>
                            ))}
                          </ul>
                        </MDBDropdownItem>
                      ))}
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBNavbarItem>
                <MDBNavbarItem>
                  <MDBDropdown>
                    <MDBDropdownToggle
                      tag="a"
                      className="nav-link cursor-pointer fw-semibold text-dark"
                    >
                      Hardware
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      {hardwareHeirarchy?.map((hardware) => (
                        <MDBDropdownItem key={hardware}>
                          <a
                            href="#"
                            className="dropdown-item"
                            onClick={() =>
                              setActiveState("hardware", hardware, undefined)
                            }
                          >
                            {hardware}
                          </a>
                        </MDBDropdownItem>
                      ))}
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBNavbarItem>

                <MDBNavbarItem>
                  <MDBDropdown>
                    <MDBDropdownToggle
                      tag="a"
                      className="nav-link cursor-pointer fw-semibold text-dark"
                    >
                      Orders
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                      <MDBDropdownItem>
                        <MDBNavbarLink
                          className="dropdown-item"
                          onClick={() => goToOrderPage("ongoing")}
                        >
                          Ongoing Orders
                        </MDBNavbarLink>
                      </MDBDropdownItem>

                      <MDBDropdownItem>
                        <MDBNavbarLink
                          className="dropdown-item"
                          onClick={() => goToOrderPage("completed")}
                        >
                          Completed Orders
                        </MDBNavbarLink>
                      </MDBDropdownItem>
                    </MDBDropdownMenu>
                  </MDBDropdown>
                </MDBNavbarItem>

                <MDBNavbarItem>
                  {userRole === "admin" && (
                    <MDBNavbarLink
                      onClick={() => navigate("/admin/dashboard/add-product")}
                      className="fw-semibold text-dark"
                    >
                      Add products
                    </MDBNavbarLink>
                  )}
                </MDBNavbarItem>
              </>
            )}
          </MDBNavbarNav>

          {isLoggedIn && (
            <div className="d-flex align-items-center">
              {/* Connect with Us Dropdown */}
              {userRole !== "admin" && (
                <MDBDropdown className="me-3 web-connector">
                  <MDBDropdownToggle
                    tag="a"
                    className="nav-link"
                    style={{ cursor: "pointer" }}
                  >
                    <MDBIcon
                      fas
                      icon="headphones-alt"
                      style={{ color: "#386bc0", fontWeight: "bold" }}
                    />{" "}
                    Connect with Us
                  </MDBDropdownToggle>
                  <MDBDropdownMenu className="dropdown-menu-end">
                    <MDBDropdownItem link href="tel:+1234567890">
                      <div className="d-flex align-items-center fs-6">
                        {/* <MDBIcon fas icon="phone" />  */}
                        <img src="/Assets/Icons/contact.png" />
                        <div
                          className="d-flex flex-column call"
                          style={{ marginLeft: "10px" }}
                        >
                          <span style={{ fontWeight: "bold" }}>Call Us</span>
                          <span className="company-number">+91 9958053708</span>
                        </div>
                      </div>
                    </MDBDropdownItem>
                    <MDBDropdownItem link href="mailto:support@example.com">
                      <div className="d-flex align-items-center fs-6">
                        {/* <MDBIcon fas icon="phone" />  */}
                        <img src="/Assets/Icons/mail.png" />
                        <div
                          className="d-flex flex-column call"
                          style={{ marginLeft: "10px" }}
                        >
                          <span style={{ fontWeight: "bold" }}>Email Us</span>
                          <span className="company-email">
                            glazia.in@gmail.com
                          </span>
                        </div>
                      </div>
                    </MDBDropdownItem>
                  </MDBDropdownMenu>
                </MDBDropdown>
              )}

              {/* User Profile Dropdown */}
              {isLoggedIn && (
                <div className="d-flex align-items-center">
                  <MDBDropdown>
                    <MDBDropdownToggle
                      tag="a"
                      className="nav-link d-flex align-items-center"
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src="../../../Assets/Icons/user.png"
                        className="rounded-circle"
                        height="40"
                        alt="User Avatar"
                        loading="lazy"
                      />
                    </MDBDropdownToggle>
                    {userRole && userRole !== "admin" && (
                      <MDBDropdownMenu className="p-0">
                        <MDBDropdownItem
                          link
                          onClick={() => navigate("/profile")}
                        >
                          <span>
                            <MDBIcon fas icon="user-alt" /> &nbsp; My Profile
                          </span>
                        </MDBDropdownItem>

                        <MDBDropdownItem link onClick={onLogout}>
                          <MDBIcon fas icon="sign-out-alt" /> &nbsp; Logout
                        </MDBDropdownItem>
                      </MDBDropdownMenu>
                    )}
                    {userRole && userRole === "admin" && (
                      <MDBDropdownMenu className="fs-6">
                        <MDBDropdownItem link onClick={onLogout}>
                          <MDBIcon fas icon="sign-out-alt" /> &nbsp; Logout
                        </MDBDropdownItem>
                      </MDBDropdownMenu>
                    )}
                  </MDBDropdown>
                </div>
              )}
            </div>
          )}
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default Header;

// mongodb+srv://glaziain:Glazia@123@glazia.elx92.mongodb.net/?retryWrites=true&w=majority&appName=glazia
