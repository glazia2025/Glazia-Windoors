import React, { useEffect } from 'react';
import { MDBCollapse } from 'mdb-react-ui-kit';
import LoginModal from '../UserLoginForm/LoginModal';

const ProductsServicesPage = ({setUserRole}) => {
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
                                        <img src="/Assets/logo/logo-sm.png" alt="Glazia Logo" className="logo" />
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
                {/* Products & Services Hero Section */}
                <section className="hero-section py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h1 className="display-4 fw-bolder text-dark mb-3">
                            Explore Glazia's <span className="text-primary">Products & Services</span>
                        </h1>
                        <p className="lead text-muted mb-5">
                            Your comprehensive source for high-quality façade and fenestration materials, supported by seamless procurement solutions.
                        </p>
                    </div>
                </section>

                {/* Product Categories Section */}
                <section className="section-bg-light py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h2 className="h2 fw-bold text-center text-dark mb-5">Our Product Categories</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {/* Product Category 1: Aluminium Profiles */}
                            <div className="col">
                                <div className="card h-100 rounded-4 shadow-2 overflow-hidden">
                                    <img src="/Assets/landing/4.jpg" className="card-img-top" alt="Aluminium Profiles" style={{height: '15rem', objectFit: 'cover'}} />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Aluminium Profiles</h5>
                                        <p className="card-text text-muted small">
                                            A wide range of high-grade aluminium profiles, available in various alloys, shapes,
                                            and finishes including Powder Coating, Anodizing, and PVDF Coating. Ideal for windows,
                                            doors, curtain walls, and custom fabrication.
                                        </p>
                                        <ul className="list-unstyled text-muted small mt-3">
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Architectural Profiles</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Structural Profiles</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Custom Extrusions</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* Product Category 2: Hardware */}
                            <div className="col">
                                <div className="card h-100 rounded-4 shadow-2 overflow-hidden">
                                    <img src="/Assets/landing/5.avif" className="card-img-top" alt="Hardware Solutions" style={{height: '15rem', objectFit: 'cover'}} />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Architectural Hardware</h5>
                                        <p className="card-text text-muted small">
                                            Comprehensive selection of high-performance hardware for all fenestration needs,
                                            ensuring smooth operation, security, and durability. Includes hinges, locks, handles,
                                            and more from leading brands.
                                        </p>
                                        <ul className="list-unstyled text-muted small mt-3">
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Window & Door Fittings</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Security Systems</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Automation Components</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* Product Category 3: Accessories */}
                            <div className="col">
                                <div className="card h-100 rounded-4 shadow-2 overflow-hidden">
                                    <img src="/Assets/landing/6.avif" className="card-img-top" alt="Accessories" style={{height: '15rem', objectFit: 'cover'}} />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Essential Accessories</h5>
                                        <p className="card-text text-muted small">
                                            All the necessary accessories to complement your profiles and hardware,
                                            ensuring a complete and professional installation. This includes sealants, gaskets,
                                            fasteners, and specialized tools.
                                        </p>
                                        <ul className="list-unstyled text-muted small mt-3">
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Sealants & Adhesives</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Gaskets & Weather Strips</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Fixing Elements</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* Product Category 4: Glass (If applicable) */}
                             {/* <div className="col">
                                <div className="card h-100 rounded-4 shadow-2 overflow-hidden">
                                    <img src="https://placehold.co/600x400/f0f8ff/007bff?text=Glass+Solutions" className="card-img-top" alt="Glass Solutions" style={{height: '15rem', objectFit: 'cover'}} />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Glass & Glazing Solutions</h5>
                                        <p className="card-text text-muted small">
                                            High-quality glass and glazing options, including insulated, tempered,
                                            laminated, and specialized performance glass for various architectural requirements.
                                        </p>
                                        <ul className="list-unstyled text-muted small mt-3">
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Insulated Glass Units (IGU)</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Safety Glass</li>
                                            <li><i className="fas fa-check-circle text-primary me-2"></i> Performance Glass</li>
                                        </ul>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </section>

                {/* Our Services Section */}
                <section className="section-bg-dark py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1100px' }}>
                        <h2 className="h2 fw-bold text-center text-dark mb-5">Our Value-Added Services</h2>
                        <div className="row row-cols-1 row-cols-md-2 g-4">
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex align-items-start">
                                    <i className="fas fa-cogs fa-2x text-primary me-4"></i>
                                    <div>
                                        <h3 className="h5 fw-semibold text-dark mb-2">Streamlined Procurement Process</h3>
                                        <p className="text-muted small">Our digital platform simplifies the entire ordering, tracking, and delivery process, saving you time and reducing administrative overhead.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex align-items-start">
                                    <i className="fas fa-award fa-2x text-primary me-4"></i>
                                    <div>
                                        <h3 className="h5 fw-semibold text-dark mb-2">Quality Assurance & Standardization</h3>
                                        <p className="text-muted small">We partner only with verified manufacturers to ensure all materials meet international quality standards and specifications.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex align-items-start">
                                    <i className="fas fa-headset fa-2x text-primary me-4"></i>
                                    <div>
                                        <h3 className="h5 fw-semibold text-dark mb-2">Dedicated Customer Support</h3>
                                        <p className="text-muted small">Our team provides expert guidance and support, from product selection to post-delivery assistance, ensuring a smooth experience.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex align-items-start">
                                    <i className="fas fa-truck-fast fa-2x text-primary me-4"></i>
                                    <div>
                                        <h3 className="h5 fw-semibold text-dark mb-2">Efficient Logistics & Delivery</h3>
                                        <p className="text-muted small">Leverage our optimized logistics network for timely and reliable delivery of your materials directly to your project site.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="section-bg-light py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '900px' }}>
                        <h2 className="h2 fw-bold text-dark mb-4">Ready to Get Started with Glazia?</h2>
                        <p className="fs-5 text-muted mb-5">
                            Experience the future of façade and fenestration material procurement.
                            Contact us today for a personalized quote or to learn more about our offerings.
                        </p>
                        <button className="btn btn-primary-glazia text-white px-5 py-3 rounded-3 fs-5 fw-semibold">
                            Get a Quote Now
                        </button>
                    </div>
                </section>
            </main>
            <LoginModal showModal={showModal} setShowModal={setShowModal} setUserRole={setUserRole} />
        </div>
    );
};

export default ProductsServicesPage;