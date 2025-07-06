import React, { useState } from "react";
import { MDBCollapse, MDBBtn, MDBModal, MDBModalDialog, MDBInput,MDBModalContent, MDBCarousel, MDBCarouselItem } from 'mdb-react-ui-kit';
import "./UserLoginForm.css";
import LoginModal from "./LoginModal";

const MobileLoginForm = ({ setUserRole }) => {


    const [showModal, setShowModal] = useState(false);
    const [showNavCollapse, setShowNavCollapse] = useState(false);


  return (
    <div className="antialiased">
      <header className="header-bg py-3 sticky-top z-3">
                      <nav className="navbar navbar-expand-md navbar-light p-0">
                          <div className="container-fluid mx-auto px-4 d-flex justify-content-between align-items-center" style={{ maxWidth: '1300px' }}>
                              {/* Logo */}
                              <a className="navbar-brand d-flex align-items-center" href="#">
                                  <img src="/Assets/Images/Glazia.png" alt="Glazia Logo" className="logo" />
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
        {/* Hero Section */}
        <section className="hero-section py-5 py-md-5 text-center">
            <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                <h1 className="display-4 fw-bolder text-dark mb-3 slide-up">
                    Glazia: Revolutionizing <span className="text-primary">Façade & Fenestration</span> Procurement
                </h1>
                <h2 className="fs-4 text-muted mb-4 slide-up" style={{ animationDelay: '0.1s' }}>
                    Your One-Stop Platform for Seamless Raw Material Sourcing.
                </h2>
                <p className="lead text-dark max-width-p mx-auto mb-5 slide-up" style={{ animationDelay: '0.2s' }}>
                    Glazia is a tech-enabled aggregator empowering fabricators and businesses with efficient,
                    cost-effective, and high-quality procurement solutions for aluminium profiles, hardware, and accessories.
                </p>
                <button onClick={() =>  setShowModal(true)} className="btn btn-primary-glazia text-white px-5 py-3 rounded-3 fs-5 fw-semibold slide-up" style={{ animationDelay: '0.3s' }}>
                    Get Started Today
                </button>
                {/* Placeholder Image for Hero */}
                <MDBCarousel showIndicators showControls fade style={{marginTop: '20px'}}>
                  <MDBCarouselItem itemId={1}>
                    <img src="/Assets/carousel/01.webp" className='img-carousel' alt='...' />
                  </MDBCarouselItem>

                  <MDBCarouselItem itemId={2}>
                    <img src="/Assets/carousel/02.webp" className='img-carousel' alt='...' />
                  </MDBCarouselItem>

                  <MDBCarouselItem itemId={3}>
                    <img src="/Assets/carousel/03.webp" className='img-carousel' alt='...' />
                  </MDBCarouselItem>
                </MDBCarousel>
            </div>
        </section>

        {/* Why Glazia? Section */}
        <section className="section-bg-light py-5 py-md-5">
            <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                <h2 className="h2 fw-bold text-center text-dark mb-5">The Glazia Advantage: Why Choose Us?</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {/* Value Proposition 1 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column justify-content-center align-items-center text-center transition-transform hover-scale-105 hover-shadow-3">
                            <i className="fas fa-shopping-cart fa-3x text-primary mb-3"></i>
                            <h3 className="h5 fw-semibold text-dark mb-3">Comprehensive Product Range</h3>
                            <p className="text-muted">Order Aluminium Profiles with preferred finishes, hardware, accessories, and glass—all from one platform.</p>
                        </div>
                    </div>
                    {/* Value Proposition 2 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column justify-content-center align-items-center text-center transition-transform hover-scale-105 hover-shadow-3">
                            <i className="fas fa-hourglass-half fa-3x text-primary mb-3"></i>
                            <h3 className="h5 fw-semibold text-dark mb-3">Reduced Costs & Faster Delivery</h3>
                            <p className="text-muted">Streamlined supply chain eliminates inefficiencies, saving you time and money with quicker turnaround times.</p>
                        </div>
                    </div>
                    {/* Value Proposition 3 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column justify-content-center align-items-center text-center transition-transform hover-scale-105 hover-shadow-3">
                            <i className="fas fa-mobile-alt fa-3x text-primary mb-3"></i>
                            <h3 className="h5 fw-semibold text-dark mb-3">Tech-Driven Convenience</h3>
                            <p className="text-muted">Digital tools for seamless order tracking, transparent pricing, and hassle-free procurement.</p>
                        </div>
                    </div>
                    {/* Value Proposition 4 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column justify-content-center align-items-center text-center transition-transform hover-scale-105 hover-shadow-3">
                            <i className="fas fa-check-circle fa-3x text-primary mb-3"></i>
                            <h3 className="h5 fw-semibold text-dark mb-3">Guaranteed Quality</h3>
                            <p className="text-muted">Partnerships with top manufacturers ensure high-performance materials meeting global benchmarks.</p>
                        </div>
                    </div>
                    {/* Value Proposition 5 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column justify-content-center align-items-center text-center transition-transform hover-scale-105 hover-shadow-3">
                            <i className="fas fa-handshake fa-3x text-primary mb-3"></i>
                            <h3 className="h5 fw-semibold text-dark mb-3">Dedicated Support</h3>
                            <p className="text-muted">Access expert assistance and support throughout your entire procurement journey.</p>
                        </div>
                    </div>
                    {/* Value Proposition 6 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-5 rounded-4 shadow-2 h-100 d-flex flex-column justify-content-center align-items-center text-center transition-transform hover-scale-105 hover-shadow-3">
                            <i className="fas fa-leaf fa-3x text-primary mb-3"></i>
                            <h3 className="h5 fw-semibold text-dark mb-3">Sustainable Solutions</h3>
                            <p className="text-muted">Committed to offering eco-friendly and energy-efficient building material options.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="section-bg-dark py-5 py-md-5">
            <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                <h2 className="h2 fw-bold text-center text-dark mb-5">How Glazia Works: Simple Steps to Smart Procurement</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                    {/* Step 1 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-4 rounded-4 shadow-1 d-flex flex-column align-items-center text-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-2 fw-bold mb-3" style={{ width: '4rem', height: '4rem' }}>1</div>
                            <h3 className="h5 fw-semibold text-dark mb-2">Register & Login</h3>
                            <p className="text-muted">Quickly create an account or log in with your mobile number.</p>
                        </div>
                    </div>
                    {/* Step 2 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-4 rounded-4 shadow-1 d-flex flex-column align-items-center text-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-2 fw-bold mb-3" style={{ width: '4rem', height: '4rem' }}>2</div>
                            <h3 className="h5 fw-semibold text-dark mb-2">Browse & Order</h3>
                            <p className="text-muted">Explore our extensive catalog and place orders effortlessly.</p>
                        </div>
                    </div>
                    {/* Step 3 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-4 rounded-4 shadow-1 d-flex flex-column align-items-center text-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-2 fw-bold mb-3" style={{ width: '4rem', height: '4rem' }}>3</div>
                            <h3 className="h5 fw-semibold text-dark mb-2">Track & Receive</h3>
                            <p className="text-muted">Monitor your orders in real-time until delivery.</p>
                        </div>
                    </div>
                    {/* Step 4 */}
                    <div className="col">
                        <div className="bg-white p-4 p-md-4 rounded-4 shadow-1 d-flex flex-column align-items-center text-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fs-2 fw-bold mb-3" style={{ width: '4rem', height: '4rem' }}>4</div>
                            <h3 className="h5 fw-semibold text-dark mb-2">Grow Your Business</h3>
                            <p className="text-muted">Focus on your projects while we handle the material supply.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-bg-light py-5 py-md-5">
            <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                <h2 className="h2 fw-bold text-center text-dark mb-5">What Our Clients Say</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {/* Testimonial 1 */}
                    <div className="col">
                        <div className="testimonial-card p-4 p-md-5 rounded-4 h-100 d-flex flex-column justify-content-between">
                            <p className="text-muted fst-italic mb-4">"Glazia has transformed our procurement process. The quality of materials is exceptional, and their delivery times are unmatched. Highly recommended!"</p>
                            <div>
                                <p className="fw-semibold text-primary mb-0">- SK Vashisht</p>
                                <p className="text-sm text-muted">Founder of Exwindoors</p>
                            </div>
                        </div>
                    </div>
                    {/* Testimonial 2 */}
                    <div className="col">
                        <div className="testimonial-card p-4 p-md-5 rounded-4 h-100 d-flex flex-column justify-content-between">
                            <p className="text-muted fst-italic mb-4">"The ease of ordering and transparent tracking on Glazia's platform has saved us countless hours. Their tech-driven approach is a game-changer."</p>
                            <div>
                                <p className="fw-semibold text-primary mb-0">- Varinder Sharma</p>
                                <p className="text-sm text-muted">Director  - Shri Sai Projects Pvt. Ltd.</p>
                            </div>
                        </div>
                    </div>
                    {/* Testimonial 3 */}
                    <div className="col">
                        <div className="testimonial-card p-4 p-md-5 rounded-4 h-100 d-flex flex-column justify-content-between">
                            <p className="text-muted fst-italic mb-4">"We've found the best quality aluminium profiles and accessories through Glazia. Their customer support is also very responsive and helpful."</p>
                            <div>
                                <p className="fw-semibold text-primary mb-0">- Puneet Goel</p>
                                <p className="text-sm text-muted">Director - Goel Glass</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="section-bg-dark py-5 py-md-5 text-center">
            <div className="container mx-auto px-4" style={{ maxWidth: '900px' }}>
                <h2 className="h2 fw-bold text-dark mb-4">Ready to Transform Your Procurement?</h2>
                <p className="fs-5 text-muted mb-5">
                    Join the growing network of businesses leveraging Glazia for smarter, faster,
                    and more cost-effective facade and fenestration solutions.
                </p>
                <button onClick={() => setShowModal(true)} className="btn btn-primary-glazia text-white px-5 py-3 rounded-3 fs-5 fw-semibold">
                    Get Started Today
                </button>
            </div>
        </section>
    </main>
    {/* Footer */}
    <footer className="footer-bg text-white py-5">
        <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {/* Glazia Info */}
                <div className="col">
                    <div className="d-flex align-items-center mb-3">
                        <img src="https://placehold.co/40x40/007bff/ffffff?text=G" alt="Glazia Logo" className="rounded-3 me-2" />
                        <span className="fs-4 fw-bold">Glazia</span>
                    </div>
                    <p className="text-muted small">Your Gateway to Faster, Smarter, and Cost-Effective Façade Solutions.</p>
                </div>
                {/* Quick Links */}
                <div className="col">
                    <h5 className="h5 fw-semibold mb-3">Quick Links</h5>
                   <ul className="list-unstyled mb-0">
                        <li><a href="/" className="text-muted text-decoration-none hover-link text-white-hover">Home</a></li>
                        <li><a href="/about" className="text-muted text-decoration-none hover-link text-white-hover">About Us</a></li>
                        <li><a href="/products_and_services" className="text-muted text-decoration-none hover-link text-white-hover">Products & Services</a></li>
                        <li><a href="/contact" className="text-muted text-decoration-none hover-link text-white-hover">Contact Us</a></li>
                        <li><a href="/terms" className="text-muted text-decoration-none hover-link text-white-hover">Terms & Conditions</a></li>
                        <li><a href="/privacy" className="text-muted text-decoration-none hover-link text-white-hover">Privacy Policy</a></li>
                    </ul>
                </div>
                {/* Contact Info */}
                <div className="col">
                    <h5 className="h5 fw-semibold mb-3">Contact Us</h5>
                    <ul className="list-unstyled mb-0 text-muted">
                        <li><i className="fas fa-phone-alt me-2"></i> Call Us: +91 9958053708</li>
                        <li><i className="fas fa-map-marker-alt me-2"></i> Location: Manesar, Gurgaon</li>
                        <li><i className="fas fa-envelope me-2"></i> Email: glazia.in@gmail.com</li>
                    </ul>
                </div>
                {/* Follow Us (Social Media) */}
                <div className="col">
                    <h5 className="h5 fw-semibold mb-3">Follow Us</h5>
                    <div className="d-flex social-icons">
                        <a href="#" className="me-3 text-muted hover-link text-white-hover">
                            <i className="fab fa-facebook-f fa-lg"></i>
                        </a>
                        <a href="#" className="me-3 text-muted hover-link text-white-hover">
                            <i className="fab fa-twitter fa-lg"></i>
                        </a>
                        <a href="#" className="me-3 text-muted hover-link text-white-hover">
                            <i className="fab fa-instagram fa-lg"></i>
                        </a>
                        <a href="#" className="me-3 text-muted hover-link text-white-hover">
                            <i className="fab fa-linkedin-in fa-lg"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div className="border-top border-secondary mt-5 pt-4 text-center small text-muted">
                &copy; 2024 Glazia. All rights reserved.
            </div>
        </div>
    </footer>
    <LoginModal showModal={showModal} setShowModal={setShowModal} setUserRole={setUserRole} />
    </div>
  );
};

export default MobileLoginForm;
