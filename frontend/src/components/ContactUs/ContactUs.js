import React, { useState, useEffect } from 'react';
import LoginModal from '../UserLoginForm/LoginModal';
import { MDBCollapse } from 'mdb-react-ui-kit';

const ContactUsPage = ({setUserRole}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [formStatus, setFormStatus] = useState(''); // 'success', 'error', ''
     const [showNavCollapse, setShowNavCollapse] = React.useState(false);
            const [showModal, setShowModal] = React.useState(false);

    // Re-initialize MDB form outlines when this component mounts/updates
    useEffect(() => {
        if (window.mdb && window.mdb.Input) {
            document.querySelectorAll('.form-outline').forEach((formOutline) => {
                new window.mdb.Input(formOutline).init();
            });
        }
    }, [name, email, subject, message]); // Re-init if form fields change to ensure labels are correct

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus(''); // Reset status

        // Basic validation
        if (!name || !email || !subject || !message) {
            setFormStatus('error');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFormStatus('error');
            return;
        }

        // Simulate form submission
        console.log({ name, email, subject, message });
        setFormStatus('success');
        // Clear form fields
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');

        // In a real application, you would send this data to a backend API
        // For example:
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, subject, message }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setFormStatus('success');
                setName(''); setEmail(''); setSubject(''); setMessage('');
            } else {
                setFormStatus('error');
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            setFormStatus('error');
        });
        */
    };

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
                {/* Contact Us Hero Section */}
                <section className="hero-section py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h1 className="display-4 fw-bolder text-dark mb-3">
                            Connect with <span className="text-primary">Glazia</span>
                        </h1>
                        <p className="lead text-muted mb-5">
                            We're here to help you with your procurement needs. Reach out to us through any channel below.
                        </p>
                    </div>
                </section>

                {/* Contact Form & Details Section */}
                <section className="section-bg-light py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1100px' }}>
                        <div className="row g-5">
                            {/* Contact Form */}
                            <div className="col-lg-6">
                                <h2 className="h2 fw-bold text-dark mb-4">Send Us a Message</h2>
                                <form onSubmit={handleSubmit} className="p-4 rounded-4 shadow-2 bg-white">
                                    <div className="form-outline mb-4">
                                        <input type="text" id="contactName" className="form-control form-control-lg" value={name} onChange={(e) => setName(e.target.value)} required />
                                        <label className="form-label" htmlFor="contactName">Your Name</label>
                                    </div>
                                    <div className="form-outline mb-4">
                                        <input type="email" id="contactEmail" className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        <label className="form-label" htmlFor="contactEmail">Your Email</label>
                                    </div>
                                    <div className="form-outline mb-4">
                                        <input type="text" id="contactSubject" className="form-control form-control-lg" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                                        <label className="form-label" htmlFor="contactSubject">Subject</label>
                                    </div>
                                    <div className="form-outline mb-4">
                                        <textarea className="form-control" id="contactMessage" rows="5" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
                                        <label className="form-label" htmlFor="contactMessage">Message</label>
                                    </div>

                                    {formStatus === 'success' && (
                                        <div className="alert alert-success fade show text-center rounded-3 mb-4" role="alert">
                                            Your message has been sent successfully!
                                        </div>
                                    )}
                                    {formStatus === 'error' && (
                                        <div className="alert alert-danger fade show text-center rounded-3 mb-4" role="alert">
                                            Please fill in all required fields and ensure the email is valid.
                                        </div>
                                    )}

                                    <button type="submit" className="btn btn-primary-glazia w-100 py-3 rounded-3 fw-semibold">
                                        Send Message
                                    </button>
                                </form>
                            </div>

                            {/* Contact Details */}
                            <div className="col-lg-6">
                                <h2 className="h2 fw-bold text-dark mb-4">Our Contact Details</h2>
                                <div className="p-4 rounded-4 shadow-2 bg-white">
                                    <ul className="list-unstyled mb-0 fs-5">
                                        <li className="d-flex align-items-center mb-4">
                                            <i className="fas fa-phone-alt text-primary fa-lg me-3"></i>
                                            <div>
                                                <strong className="text-dark">Call Us:</strong><br />
                                                <a href="tel:+919958053708" className="text-muted text-decoration-none">+91 9958053708</a>
                                            </div>
                                        </li>
                                        <li className="d-flex align-items-center mb-4">
                                            <i className="fas fa-envelope text-primary fa-lg me-3"></i>
                                            <div>
                                                <strong className="text-dark">Email Us:</strong><br />
                                                <a href="mailto:glazia.in@gmail.com" className="text-muted text-decoration-none">glazia.in@gmail.com</a>
                                            </div>
                                        </li>
                                        <li className="d-flex align-items-start mb-4">
                                            <i className="fas fa-map-marker-alt text-primary fa-lg me-3 mt-1"></i>
                                            <div>
                                                <strong className="text-dark">Our Location:</strong><br />
                                                <address className="text-muted mb-0">
                                                    Manesar, Gurgaon, Haryana, India
                                                </address>
                                            </div>
                                        </li>
                                    </ul>
                                    <hr className="my-4" />
                                    <h4 className="h5 fw-semibold text-dark mb-3">Follow Us:</h4>
                                    <div className="d-flex social-icons">
                                        <a href="#" className="me-3 text-primary hover-link text-dark-hover">
                                            <i className="fab fa-facebook-f fa-2x"></i>
                                        </a>
                                        <a href="#" className="me-3 text-primary hover-link text-dark-hover">
                                            <i className="fab fa-twitter fa-2x"></i>
                                        </a>
                                        <a href="#" className="me-3 text-primary hover-link text-dark-hover">
                                            <i className="fab fa-instagram fa-2x"></i>
                                        </a>
                                        <a href="https://www.linkedin.com/company/glazia-windoors-private-limited/?viewAsMember=true" target='_blank' rel="noopener noreferrer" className="me-3 text-primary hover-link text-dark-hover">
                                            <i className="fab fa-linkedin-in fa-2x"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map Section (Placeholder) */}
                <section className="section-bg-dark py-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h2 className="h2 fw-bold text-center text-dark mb-5">Find Us on the Map</h2>
                        <div className="map-responsive rounded-4 shadow-3 overflow-hidden" style={{ height: '450px' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112399.0494494392!2d76.84074251268677!3d28.32630777595514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d23588df8e6e5%3A0xc0fb106b0520630e!2sManesar%2C%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Glazia Location Map"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>
            <LoginModal showModal={showModal} setShowModal={setShowModal} setUserRole={setUserRole} />
        </div>
    );
};

export default ContactUsPage;