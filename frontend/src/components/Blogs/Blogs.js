import React, { useEffect } from 'react';
import { MDBInput, MDBCollapse } from 'mdb-react-ui-kit'; // Importing MDBInput for form
import LoginModal from '../UserLoginForm/LoginModal';
import def from 'ajv/dist/vocabularies/discriminator';

const BlogPage = ({setUserRole}) => {
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
            {/* Custom styles for BlogPage specific elements if any */}
            <style>
                {`
                .blog-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .blog-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
                }
                .blog-card img {
                    height: 14rem;
                    object-fit: cover;
                }
                `}
            </style>

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
                {/* Blog Hero Section */}
                <section className="hero-section py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h1 className="display-4 fw-bolder text-dark mb-3">
                            Glazia Blog | <span className="text-primary">Insights & News</span>
                        </h1>
                        <p className="lead text-muted mb-5">
                            Stay updated with the latest trends, expert advice, and innovations in façade and fenestration.
                        </p>
                        {/* Blog Search Bar Placeholder */}
                        {/* <div className="row justify-content-center">
                            <div className="col-md-8 col-lg-6">
                                <div className="input-group mb-3 rounded-pill shadow-sm overflow-hidden">
                                    <input type="text" className="form-control border-0 py-3 ps-4" placeholder="Search blog posts..." aria-label="Search blog posts" />
                                    <button className="btn btn-primary-glazia px-4" type="button" id="button-addon2">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </section>

                {/* Latest Blog Posts Section */}
                <section className="section-bg-light py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h2 className="h2 fw-bold text-center text-dark mb-5">Latest Articles</h2>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {/* Blog Post 1 */}
                            <div className="col">
                                <div className="card blog-card h-100 rounded-4 shadow-1">
                                    <img src="/Assets/landing/2.jpg" className="card-img-top rounded-top-4" alt="Sustainable Design" />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Embracing Sustainable Façade Design for a Greener Future</h5>
                                        <p className="card-text text-muted small">Learn about the latest innovations in eco-friendly materials and design principles that are shaping modern architecture.</p>
                                        <a href="/blogs/post1" className="text-primary text-decoration-none fw-medium">Read More <i className="fas fa-arrow-right ms-1"></i></a>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0 pt-0 px-4 pb-3 text-muted small">
                                        <i className="far fa-calendar-alt me-1"></i> June 20, 2024
                                    </div>
                                </div>
                            </div>
                            {/* Blog Post 2 */}
                            <div className="col">
                                <div className="card blog-card h-100 rounded-4 shadow-1">
                                    <img src="/Assets/landing/4.jpg" className="card-img-top rounded-top-4" alt="Material Quality" />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">The Importance of Quality Control in Fenestration Materials</h5>
                                        <p className="card-text text-muted small">Discover why rigorous quality checks are paramount for durability, performance, and long-term cost savings in your projects.</p>
                                        <a href="/blogs/post2" className="text-primary text-decoration-none fw-medium">Read More <i className="fas fa-arrow-right ms-1"></i></a>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0 pt-0 px-4 pb-3 text-muted small">
                                        <i className="far fa-calendar-alt me-1"></i> June 15, 2024
                                    </div>
                                </div>
                            </div>
                            {/* Blog Post 3 */}
                            <div className="col">
                                <div className="card blog-card h-100 rounded-4 shadow-1">
                                    <img src="/Assets/landing/1.webp" className="card-img-top rounded-top-4" alt="Smart Procurement" />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">How Digital Platforms are Revolutionizing Material Procurement</h5>
                                        <p className="card-text text-muted small">Explore the benefits of using online aggregators like Glazia to streamline your supply chain and reduce procurement hassles.</p>
                                        <a href="/blogs/post3" className="text-primary text-decoration-none fw-medium">Read More <i className="fas fa-arrow-right ms-1"></i></a>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0 pt-0 px-4 pb-3 text-muted small">
                                        <i className="far fa-calendar-alt me-1"></i> June 10, 2024
                                    </div>
                                </div>
                            </div>
                            {/* Blog Post 4 */}
                            {/* <div className="col">
                                <div className="card blog-card h-100 rounded-4 shadow-1">
                                    <img src="https://placehold.co/600x400/e0f2fe/007bff?text=Aluminium+Profiles" className="card-img-top rounded-top-4" alt="Aluminium Profiles" />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Choosing the Right Aluminium Profiles for Your Architectural Project</h5>
                                        <p className="card-text text-muted small">A comprehensive guide to selecting the optimal aluminium profiles based on application, strength, and aesthetic requirements.</p>
                                        <a href="#" className="text-primary text-decoration-none fw-medium">Read More <i className="fas fa-arrow-right ms-1"></i></a>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0 pt-0 px-4 pb-3 text-muted small">
                                        <i className="far fa-calendar-alt me-1"></i> June 05, 2024
                                    </div>
                                </div>
                            </div> */}
                            {/* Blog Post 5 */}
                            {/* <div className="col">
                                <div className="card blog-card h-100 rounded-4 shadow-1">
                                    <img src="https://placehold.co/600x400/e0f2fe/007bff?text=Energy+Efficiency" className="card-img-top rounded-top-4" alt="Energy Efficiency" />
                                    <div className="card-body p-4">
                                        <h5 className="card-title fw-semibold text-dark mb-2">Boosting Building Energy Efficiency with Advanced Fenestration</h5>
                                        <p className="card-text text-muted small">Explore how innovative window and door systems contribute significantly to reducing energy consumption and operational costs.</p>
                                        <a href="#" className="text-primary text-decoration-none fw-medium">Read More <i className="fas fa-arrow-right ms-1"></i></a>
                                    </div>
                                    <div className="card-footer bg-transparent border-top-0 pt-0 px-4 pb-3 text-muted small">
                                        <i className="far fa-calendar-alt me-1"></i> May 28, 2024
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        {/* <div className="text-center mt-5">
                            <button className="btn btn-secondary-glazia px-5 py-3 rounded-3 fs-5 fw-semibold">
                                Load More Articles
                            </button>
                        </div> */}
                    </div>
                </section>
            </main>
            <LoginModal showModal={showModal} setShowModal={setShowModal} setUserRole={setUserRole} />
        </div>
    );
};

export default BlogPage;
