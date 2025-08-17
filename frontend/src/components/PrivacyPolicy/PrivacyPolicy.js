import React from "react";
import { MDBCollapse } from "mdb-react-ui-kit";
import LoginModal from "../UserLoginForm/LoginModal";

export default function PrivacyPolicyPage({setUserRole}) {
    
const [showNavCollapse, setShowNavCollapse] = React.useState(false);
 const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
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
      {/* Hero banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-slate-200" />
          <div className="absolute -bottom-32 -left-16 h-[28rem] w-[28rem] rounded-full bg-slate-100" />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="mt-3 text-slate-600">Effective date: <time dateTime="2025-08-17">August 17, 2025</time> • Last updated: August 17, 2025</p>
          <p className="mt-6 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto">
            This Privacy Policy explains how <strong>Glazia Windoors Private Limited</strong> ("we", "us", "our") collects, uses, discloses, and safeguards
            personal data when you use <span className="font-medium">https://www.glazia.in</span> and our services. It aligns with India’s <span className="font-medium">Digital Personal Data Protection Act, 2023 (DPDP Act)</span>.
          </p>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Content */}
          <article className="lg:col-span-8 xl:col-span-9 space-y-12">

            <Section id="who-we-are" title="1. Who we are">
              <p>
                <span className="font-semibold">Controller / Data Fiduciary:</span> Glazia Windoors Private Limited
                <br />[office address] (e.g., Near Kherki Daula Toll Plaza, Sector 84, Gurugram, Haryana 122004)
                <br />Email: <strong>[sales@glazia.in]</strong>
                <br />Phone: <strong>[+91-8595464852]</strong>
              </p>
              <p className="mt-4">Website: https://www.glazia.in</p>
              <p className="mt-4">If you have questions about this Policy or how we handle your data, contact us at <strong>[privacy@glazia.in]</strong>.</p>
            </Section>

            <Section id="scope" title="2. Scope">
              <ul className="list-disc pl-6 space-y-2">
                <li>Visit or interact with the Site (including via cookies/analytics);</li>
                <li>Submit enquiry/quote/contact forms, call us, email us, or chat with us (e.g., via WhatsApp);</li>
                <li>Engage us for consultations, site visits, design, supply, installation, after‑sales service, or warranty support related to aluminium windows, doors, façades, glazing, and associated hardware.</li>
              </ul>
              <p className="mt-4">This Policy does <strong>not</strong> apply to third‑party websites, apps, plug‑ins, or services linked from our Site (e.g., WhatsApp, Google, payment gateways). Review their privacy policies separately.</p>
            </Section>

            <Section id="data-we-collect" title="3. Personal data we collect">
              <h4 className="font-semibold mt-2">3.1 Data you provide directly</h4>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Contact details:</strong> name, email address, phone number.</li>
                <li><strong>Business details</strong> (if applicable): company name, role, project location, GSTIN.</li>
                <li><strong>Project information:</strong> property type, measurements/specifications, preferences, budgets, files/photos you upload.</li>
                <li><strong>Communications:</strong> messages you send via forms, email, phone, WhatsApp, or other channels; call recordings where permitted and notified.</li>
                <li><strong>Support & warranty:</strong> purchase details, service requests, and related correspondence.</li>
              </ul>
              <h4 className="font-semibold mt-6">3.2 Data we collect automatically</h4>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Usage & device data:</strong> IP address, device identifiers, browser type, operating system, referring URLs, pages viewed, timestamps, and similar data.</li>
                <li><strong>Cookies & similar technologies:</strong> functional, preference, and analytics cookies (see Section 8).</li>
              </ul>
              <h4 className="font-semibold mt-6">3.3 Data from third parties</h4>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Lead partners & platforms:</strong> where you consented to share your details (e.g., marketplace listings, directories).</li>
                <li><strong>Analytics & advertising partners:</strong> aggregated/segmented insights (no direct identifiers from us to partners unless stated and consented).</li>
              </ul>
              <p className="mt-4">We do not intentionally collect data about minors under 18 for marketing or profiling. If you believe a minor has provided personal data, contact us to request deletion.</p>
            </Section>

            <Section id="purposes" title="4. How we use personal data (Purposes)">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Responding to enquiries & providing quotes</strong> for products and services.</li>
                <li><strong>Scheduling site visits</strong>, design consultations, measurements, fabrication, delivery, installation, and after‑sales.</li>
                <li><strong>Customer support, warranty & repairs.</strong></li>
                <li><strong>Improving our Site and services</strong>, including troubleshooting, analytics, and user experience.</li>
                <li><strong>Communications & alerts</strong>: order/service updates, appointment confirmations, policy changes.</li>
                <li><strong>Marketing (with consent)</strong>: newsletters, promotions, product updates; you may opt out anytime.</li>
                <li><strong>Security & fraud prevention.</strong></li>
                <li><strong>Compliance</strong> with laws, tax/regulatory obligations, and to protect our legal rights.</li>
              </ul>
            </Section>

            <Section id="lawful-basis" title="5. Lawful basis under the DPDP Act">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent</strong>: obtained via forms, checkboxes, or clear affirmative actions.</li>
                <li><strong>Legitimate uses permitted by law</strong>: to perform a contract you request; for employment; to comply with legal obligations; for emergencies/safety; or to enforce legal rights/claims.</li>
              </ul>
              <p className="mt-4">Where required, we provide a notice describing the personal data processed, purposes, how to withdraw consent, data sharing, and your rights.</p>
            </Section>

            <Section id="sharing" title="6. Data sharing & recipients">
              <p>We may share personal data with:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Service providers / processors</strong>: hosting, cloud infrastructure, analytics, communications, payment, logistics, installation partners, and customer support vendors (bound by confidentiality and data protection obligations).</li>
                <li><strong>Professional advisers</strong>: auditors, accountants, legal counsel.</li>
                <li><strong>Authorities</strong>: where required by law, regulation, or judicial process.</li>
                <li><strong>Business transfers</strong>: in connection with mergers, acquisitions, financing, or sale of assets, subject to this Policy.</li>
              </ul>
              <p className="mt-4">We do not sell personal data.</p>
            </Section>

            <Section id="transfers" title="7. International transfers">
              <p>Our servers or vendors may be located outside India. Where applicable, we implement appropriate safeguards and transfer data only to jurisdictions not restricted by the Government of India. By interacting with our Site or services, you understand that your data may be processed in such locations.</p>
            </Section>

            <Section id="cookies" title="8. Cookies, analytics & tracking">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>keep the Site secure and functional;</li>
                <li>remember your preferences (e.g., location, form inputs);</li>
                <li>analyze traffic and improve performance.</li>
              </ul>
              <p className="mt-4"><strong>Analytics:</strong> We may use tools like Google Analytics or similar solutions to understand Site usage. These providers set their own cookies. You can manage cookies via your browser settings and, where offered, our cookie banner/preferences center.</p>
              <p className="mt-2"><strong>Do Not Track:</strong> Your browser may send a “Do Not Track” signal. Our Site currently does not respond to DNT signals. You can limit tracking via browser tools and cookie settings.</p>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="py-2 pr-6 font-semibold">Cookie</th>
                      <th className="py-2 pr-6 font-semibold">Purpose</th>
                      <th className="py-2 pr-6 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 pr-6 font-medium">__ga / __gid</td>
                      <td className="py-2 pr-6">Analytics (page views, sessions)</td>
                      <td className="py-2 pr-6">1 day to 2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-6 font-medium">csrftoken</td>
                      <td className="py-2 pr-6">Form security/anti-CSRF</td>
                      <td className="py-2 pr-6">session/1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-6 font-medium">site_pref</td>
                      <td className="py-2 pr-6">Remember preferences</td>
                      <td className="py-2 pr-6">6-12 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="whatsapp" title="9. WhatsApp, calls & messaging">
              <p>If you click a WhatsApp button/link on our Site or message us on WhatsApp, your use is governed by WhatsApp’s Privacy Policy and WhatsApp Business terms in addition to this Policy. We receive the content of your messages and your contact details as part of the conversation. Call logs and recordings (where permitted) are retained for support, quality, and legal purposes.</p>
            </Section>

            <Section id="retention" title="10. Data retention">
              <p>We retain personal data only for as long as necessary to fulfill the purposes described in this Policy, including to meet legal, accounting, or reporting requirements, and to establish or defend legal claims. When no longer needed, we delete or irreversibly anonymize the data.</p>
            </Section>

            <Section id="rights" title="11. Your rights (Data Principal rights)">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access</strong> your personal data processed by us;</li>
                <li><strong>Request correction</strong> of inaccurate or incomplete data;</li>
                <li><strong>Request erasure</strong> of personal data that is no longer necessary (unless we must retain it by law);</li>
                <li><strong>Withdraw consent</strong> at any time for processing based on consent;</li>
                <li><strong>Grievance redressal</strong> via our Grievance Officer (see Section 13);</li>
                <li><strong>Nominate</strong> another person to exercise rights on your behalf in case of death or incapacity.</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact us at <strong>[privacy@glazia.in]</strong>. We may verify your identity before acting on your request.</p>
            </Section>

            <Section id="security" title="12. Security">
              <p>We implement technical and organizational measures appropriate to the risk, including access controls, encryption in transit, network firewalls, and regular monitoring. However, no system is 100% secure. If you suspect a security issue, please contact us immediately at <strong>[security@glazia.in]</strong>.</p>
            </Section>


            <Section id="children" title="14. Children’s data">
              <p>Our Site and services are intended for use by adults. We do not knowingly solicit or process personal data of children under 18 for tracking or targeted advertising. If you believe we have collected such data, contact us to request deletion.</p>
            </Section>

            <Section id="changes" title="15. Changes to this Policy">
              <p>We may update this Policy periodically. The updated version will be indicated by an updated “Last updated” date and will be effective when posted on the Site. Material changes may be notified by email or prominent notice on the Site.</p>
            </Section>

            <Section id="contact" title="16. Contact us">
              <address className="not-italic">
                <div className="font-semibold">Glazia Windoors Private Limited</div>
                <div>Email: <strong>[sales@glazia.in]</strong></div>
                <div>Phone: <strong>[+91-8595464852]</strong></div>
                <div>Postal: <strong>[Tehsil Manesar, Vill, near Kherki Daula Toll Plaza, behind Ajay Hotel, Kherki Daula, Sector 84, Gurugram, Haryana 122012]</strong></div>
              </address>
            </Section>


            <Section id="publishing" title="18. Publishing details">
              <ul className="list-disc pl-6 space-y-2">
                <li>Recommended URL: <code>https://www.glazia.in/privacy-policy</code></li>
                <li>Recommended navigation: Footer → “Privacy Policy”</li>
                <li>Recommended contact alias: <code>sales@glazia.in</code></li>
                <li>Recommended metadata: <code>title: "Privacy Policy | Glazia Windoors"</code>, <code>noindex: false</code></li>
              </ul>
            </Section>
          </article>
        </div>
      </main>
      <LoginModal showModal={showModal} setShowModal={setShowModal} setUserRole={setUserRole} />
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 prose prose-slate max-w-none">
        {children}
      </div>
    </section>
  );
}
