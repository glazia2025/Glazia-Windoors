import React, { useState } from 'react';
import { MDBCollapse } from 'mdb-react-ui-kit';
import LoginModal from '../UserLoginForm/LoginModal';
import { useParams, useNavigate } from 'react-router-dom';

const BlogDetailPage = ({ setUserRole }) => {

    const { id } = useParams();
    const navigate = useNavigate();
    const onBackToBlog = () => {
        navigate('/blogs');
    };
    // State to manage the visibility of the navbar collapse and modal

    const [showNavCollapse, setShowNavCollapse] = React.useState(false);
            const [showModal, setShowModal] = React.useState(false);
    const blogPostsData = {
        'post1': {
            title: 'Embracing Sustainable Façade Design for a Greener Future',
            date: 'June 20, 2024',
            image: 'https://placehold.co/800x450/e0f2fe/007bff?text=Sustainable+Design+Detail',
            content: `
                <p>In an era where environmental consciousness is paramount, sustainable façade design has emerged as a cornerstone of modern architecture. This approach goes beyond mere aesthetics, focusing on optimizing building performance to reduce energy consumption, minimize environmental impact, and enhance occupant well-being.</p>
                <p>Key elements of sustainable façade design include the selection of eco-friendly materials, integration of passive heating and cooling strategies, and utilization of renewable energy sources. Advanced materials like recycled aluminum, low-emissivity glass, and smart shading systems play a crucial role in achieving these goals. These materials contribute to improved insulation, reduced heat gain, and increased natural light penetration, all of which significantly lower the building's operational energy demands.</p>
                <p>Furthermore, innovative design techniques, such as double-skin façades and green walls, are being increasingly adopted. Double-skin façades create a buffer zone that helps regulate indoor temperatures and allows for natural ventilation, while green walls improve air quality, reduce the urban heat island effect, and add a touch of biophilic design to the urban landscape.</p>
                <p>Ultimately, investing in sustainable façade design is not just an environmental imperative but also a smart economic decision. Buildings designed with sustainability in mind often have lower utility bills, higher property values, and a reduced carbon footprint, contributing to a healthier planet and more resilient urban environments.</p>
            `
        },
        'post2': {
            title: 'The Importance of Quality Control in Fenestration Materials',
            date: 'June 15, 2024',
            image: 'https://placehold.co/800x450/e0f2fe/007bff?text=Quality+Control+Detail',
            content: `
                <p>Quality control in fenestration materials is not merely a regulatory requirement; it's a critical factor determining the longevity, performance, and safety of a building's envelope. From the strength of aluminum profiles to the precision of hardware components, every element plays a vital role in the overall integrity of windows and doors.</p>
                <p>Rigorous quality control processes ensure that materials meet specific industry standards and client expectations. This includes testing for durability against weather elements, structural integrity under various loads, thermal performance for energy efficiency, and operational smoothness of moving parts. Without these checks, even minor defects can lead to significant issues like air and water leakage, increased energy costs, security vulnerabilities, and premature material degradation.</p>
                <p>For suppliers and fabricators, robust quality control translates to enhanced reputation, reduced warranty claims, and increased customer satisfaction. For end-users, it means peace of mind, knowing that their building is equipped with reliable, high-performance fenestration that will stand the test of time and provide a comfortable, secure living or working environment.</p>
                <p>At Glazia, we emphasize stringent quality checks for all our materials, partnering only with manufacturers who adhere to the highest international benchmarks. This commitment ensures that every product procured through our platform delivers superior performance and value.</p>
            `
        },
        'post3': {
            title: 'How Digital Platforms are Revolutionizing Material Procurement',
            date: 'June 10, 2024',
            image: 'https://placehold.co/800x450/e0f2fe/007bff?text=Digital+Procurement+Detail',
            content: `
                <p>The traditional procurement landscape for construction materials has long been characterized by fragmentation, inefficiency, and a lack of transparency. However, the advent of digital platforms is rapidly transforming this scenario, bringing unprecedented efficiency and connectivity to the supply chain.</p>
                <p>Platforms like Glazia act as tech-enabled aggregators, providing a centralized marketplace where fabricators and businesses can easily browse, compare, and procure a vast array of materials, from aluminum profiles to hardware and accessories. This digital shift eliminates the need for multiple vendors, reduces negotiation complexities, and offers real-time pricing, leading to significant cost savings.</p>
                <p>Beyond simple purchasing, these platforms offer advanced features like digital order tracking, inventory management tools, and analytics, providing invaluable insights into procurement patterns and operational efficiency. The ability to monitor orders from placement to delivery in real-time enhances transparency and accountability across the supply chain.</p>
                <p>Ultimately, digital procurement platforms are not just simplifying the buying process; they are empowering businesses with data-driven decision-making capabilities, fostering stronger relationships between suppliers and buyers, and driving the construction industry towards a more agile, efficient, and sustainable future.</p>
            `
        }
    };

    const currentPost = blogPostsData[id] || {
        title: 'Blog Post Not Found',
        date: '',
        image: 'https://placehold.co/800x450/cccccc/333333?text=Content+Missing',
        content: '<p>The requested blog post could not be found. Please return to the main blog page.</p>'
    };

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
                <section className="hero-section py-5 py-md-5 text-center">
                    <div className="container mx-auto px-4" style={{ maxWidth: '1300px' }}>
                        <h1 className="display-4 fw-bolder text-dark mb-3">
                            {currentPost.title}
                        </h1>
                        <p className="lead text-muted mb-4">
                            <i className="far fa-calendar-alt me-2"></i> {currentPost.date}
                        </p>
                        <button onClick={onBackToBlog} className="btn btn-primary-glazia text-white px-4 py-2 rounded-3 fw-semibold">
                            <i className="fas fa-arrow-left me-2"></i> Back to Blog
                        </button>
                    </div>
                </section>

                <section className="section-bg-light py-5 py-md-5">
                    <div className="container mx-auto px-4" style={{ maxWidth: '900px' }}>
                        <img src={currentPost.image} alt={currentPost.title} className="img-fluid rounded-4 shadow-3 mb-5" />
                        <div className="text-dark fs-5 lh-lg" dangerouslySetInnerHTML={{ __html: currentPost.content }} />
                    </div>
                </section>
            </main>
            <LoginModal setUserRole={setUserRole} showModal={showModal} setShowModal={setShowModal} />
        </div>
    );
};

export default BlogDetailPage;