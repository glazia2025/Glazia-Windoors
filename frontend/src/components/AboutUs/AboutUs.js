import React, { useEffect } from 'react';
import { MDBCollapse } from 'mdb-react-ui-kit';
import LoginModal from '../UserLoginForm/LoginModal';


const AboutUsPage = ({setUserRole}) => {
    const [showNavCollapse, setShowNavCollapse] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    useEffect(() => {
        if (window.mdb && window.mdb.Input) {
            document.querySelectorAll('.form-outline').forEach((formOutline) => {
                new window.mdb.Input(formOutline).init();
            });
        }
    }, []);

    return (
        <div className="antialiased">
            <header className="header-bg py-1 sticky-top z-3">
                            <nav className="navbar navbar-expand-md navbar-light p-0">
                                <div className="container-fluid mx-auto px-4 d-flex justify-content-between align-items-center" style={{ maxWidth: '1300px' }}>
                                    {/* Logo */}
                                    <a className="navbar-brand d-flex align-items-center" href="#">
                                        <img src="/Assets/logo/logo-final.png" alt="Glazia Logo" className="logo" />
                                        <span className="fs-4 fw-bold text-dark">Glazia</span>
                                    </a>
            
                                    {/* Toggler/collapsibe Button for mobile */}
                                    <button className="navbar-toggler" type="button" data-mdb-toggle="collapse" data-mdb-target="#navbarNav" aria-controls="navbarNav" aria-expanded={showNavCollapse} aria-label="Toggle navigation" onClick={() => setShowNavCollapse(!showNavCollapse)}>
                                        <i className="fas fa-bars"></i>
                                    </button>
            
                                    <div className="desktop-navbar">
                                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" aria-current="page" href="/">Home</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/about">About Us</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/products_and_services">Products & Services</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/blogs">Blog</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/contact">Contact Us</a>
                                            </li>
                                        </ul>
                                        {/* Login/Sign Up Button */}
                                        <button onClick={() => setShowModal(true)} className="btn btn-primary-glazia text-white px-4 py-2 rounded-3 fw-semibold">
                                            Login / Sign Up
                                        </button>
                                    </div>
            
                                    {/* Navbar links */}
                                    <MDBCollapse open={showNavCollapse} style={{marginBottom: '12px'}}>
                                        <div id="navbarNav">
                                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" aria-current="page" href="/">Home</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/about">About Us</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/products_and_services">Products & Services</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/blogs">Blog</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link text-muted hover-link text-primary-hover fw-medium" href="/contact">Contact Us</a>
                                            </li>
                                        </ul>
                                        {/* Login/Sign Up Button */}
                                        <button onClick={() => setShowModal(true)} className="btn btn-primary-glazia text-white px-4 py-2 rounded-3 fw-semibold">
                                            Login / Sign Up
                                        </button>
                                    </div>
                                    </MDBCollapse>
                                    
                                </div>
                            </nav>
                        </header>
            <main>
                {/* About Us Hero Section */}
                <section className="hero-section py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h1 className="display-4 fw-bolder text-dark mb-3">
                            About Glazia | <span className="text-primary">Our Story & Mission</span>
                        </h1>
                        <p className="lead text-muted mb-5">
                            Empowering fabricators and businesses through innovation and quality in façade and fenestration procurement.
                        </p>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="section-bg-light py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1100px' }}>
                        <div className="row g-5 align-items-center">
                            <div className="col-md-6 order-md-2 text-center text-md-start">
                                <h2 className="h2 fw-bold text-dark mb-4">Who We Are: Simplifying Procurement</h2>
                                <p className="text-muted mb-4">
                                    Glazia was founded with a clear vision: to revolutionize the traditional, often fragmented,
                                    procurement process for façade and fenestration materials. We saw the challenges fabricators
                                    and businesses faced in sourcing high-quality aluminium profiles, hardware, and accessories,
                                    and we decided to build a tech-enabled solution.
                                </p>
                                <p className="text-muted">
                                    Our platform acts as a smart aggregator, connecting you directly with top-tier manufacturers
                                    and streamlining the entire supply chain. This means better prices, faster deliveries, and
                                    uncompromising quality, all at your fingertips.
                                </p>
                            </div>
                            <div className="col-md-6 order-md-1">
                                <img src="/Assets/landing/aboutus.jpeg" alt="Our Story at Glazia" className="img-fluid rounded-4 shadow-3" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission, Vision, Values Section */}
                <section className="section-bg-dark py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h2 className="h2 fw-bold text-center text-dark mb-5">Our Core Principles</h2>
                        <div className="row row-cols-1 row-cols-md-3 g-4">
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column align-items-center text-center">
                                    <i className="fas fa-bullseye fa-3x text-primary mb-3"></i>
                                    <h3 className="h5 fw-semibold text-dark mb-3">Mission</h3>
                                    <p className="text-muted">To empower the construction and fabrication industry with seamless, efficient, and reliable procurement of high-quality façade and fenestration materials.</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column align-items-center text-center">
                                    <i className="fas fa-lightbulb fa-3x text-primary mb-3"></i>
                                    <h3 className="h5 fw-semibold text-dark mb-3">Vision</h3>
                                    <p className="text-muted">To be the leading digital platform for building material aggregation, recognized for innovation, customer satisfaction, and sustainable practices.</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column align-items-center text-center">
                                    <i className="fas fa-hand-holding-heart fa-3x text-primary mb-3"></i>
                                    <h3 className="h5 fw-semibold text-dark mb-3">Values</h3>
                                    <ul className="list-unstyled text-muted text-start w-100 px-3">
                                        <li><i className="fas fa-check-circle text-primary me-2"></i> Quality First</li>
                                        <li><i className="fas fa-check-circle text-primary me-2"></i> Customer Centricity</li>
                                        <li><i className="fas fa-check-circle text-primary me-2"></i> Innovation</li>
                                        <li><i className="fas fa-check-circle text-primary me-2"></i> Transparency</li>
                                        <li><i className="fas fa-check-circle text-primary me-2"></i> Sustainability</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section Placeholder */}
                <section className="section-bg-light py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1100px' }}>
                        <h2 className="h2 fw-bold text-dark mb-5">Meet Our Leadership</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
                            <div className="col">
                                <div className="bg-white p-4 rounded-4 shadow-1 h-100">
                                    <img src="/Assets/Images/navdeep.png" alt="CEO" className="rounded-circle mb-3 img-fluid" />
                                    <h3 className="h5 fw-semibold text-dark mb-1">Navdeep Kamboj</h3>
                                    <p className="text-primary small mb-3">Founder, CEO</p>
                                    <p className="text-muted small">IIM Calcutta alumnus with 10+ years of experience across media, IT and manufacturing industry. Founder of Glazia Windoors and a three-time entrepreneur</p>
                                </div>
                            </div>
                            <div className="col">
                                <div className="bg-white p-4 rounded-4 shadow-1 h-100">
                                    <img src="/Assets/Images/jaswant.jpg" alt="COO" className="rounded-circle mb-3 img-fluid" />
                                    <h3 className="h5 fw-semibold text-dark mb-1">Jane Smith</h3>
                                    <p className="text-primary small mb-3">Co-Founder, COO</p>
                                    <p className="text-muted small">IIFT Delhi alumnus with 20+ years of experience; 14+ years in building materials. Worked with ALCOA, AIS Glass, Reyners, and Huawei leading supply chain and logistics</p>
                                </div>
                            </div>
                             <div className="col">
                                <div className="bg-white p-4 rounded-4 shadow-1 h-100">
                                    <img src="/Assets/Images/KK.jpg" alt="CTO" className="rounded-circle mb-3 img-fluid" />
                                    <h3 className="h5 fw-semibold text-dark mb-1">KK Kaushik</h3>
                                    <p className="text-primary small mb-3">Advisor</p>
                                    <p className="text-muted small">Serial Entrepreneur; Founder of Vitalize Solutions and CNS Comnet; strategic growth advisor and mentor to Glazia Windoors, with deep expertise in scaling businesses sustainably and building resilient organizations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <LoginModal showModal={showModal} setShowModal={setShowModal} setUserRole={setUserRole} />
        </div>
    );
};

export default AboutUsPage;