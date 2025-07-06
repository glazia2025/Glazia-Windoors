import React from 'react';

const Footer = () => {
  return (
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
  );
}

export default Footer;