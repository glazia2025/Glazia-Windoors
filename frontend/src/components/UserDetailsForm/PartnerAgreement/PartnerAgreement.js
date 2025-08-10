import React from 'react';
import html2pdf from "html2pdf.js";

const ParterAgreement = ({userName, completeAddress, gstNumber, pincode, city, state, phoneNumber, email, setBlob}) => {

    const [url, setUrl] = React.useState("");

    const generatePA = async () => {
        const day = new Date();
        const date = day.getDate();
        const month = day.getMonth();
        const year = day.getFullYear();
        const htmlStr = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glazia Partner Agreement</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }

        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            margin: 0 auto;
            width: 21cm;
            padding: 2cm;
            box-sizing: border-box;
        }

        h1 {
            text-align: center;
            text-decoration: underline;
            font-size: 16pt;
            margin-bottom: 24pt;
        }

        .section {
            margin-bottom: 14pt;
        }

        .indent {
            margin-left: 2em;
        }

        b {
            font-weight: bold;
        }
    </style>
</head>

<body>

    <h1>AGREEMENT</h1>

    <div class="section">
        This agreement is made at <b>${state}</b> on this <b>${date}</b> day of <b>${month}, ${year}</b> (“Agreement”).
    </div>

    <div class="section">
        <b>BY AND BETWEEN</b><br>
        <div class="indent">
            Glazia Windoors Private Limited is a Firm incorporated under the laws of the Companies Act 2013 and having
            its registered/principal office at Kevat Khata No 361, Rect, No 21, Killa No 4/7 0-18, Kherki Daula Village
            Road, Gurugram, India through Mr. Navdeep Kamboj, (hereinafter referred to as the “Supplier”) of the ONE
            PART;
        </div>
    </div>

    <div class="section">
        <b>AND</b><br>
        <div class="indent">
            ${userName}<br>
            ${email}<br>
            GST No: ${gstNumber}<br>
            ${completeAddress}, ${city} - ${pincode}, ${state}, India<br>
            (hereinafter referred to as the “Fabricator/Dealer”) of the OTHER PART.
        </div>
    </div>

    <div class="section">
        (Supplier and Fabricator/Dealer are collectively referred to as “Parties” and individually as “Party”)
    </div>

    <div class="section">
        <b>WHEREAS:</b>
        <div class="indent">
            <p>
                A. GLAZIA WINDOORS PRIVATE LIMITED is engaged inter alia in the business of architectural Aluminium
                systems products for marketing & supplying extrusions, gaskets, accessories like screws, plastic
                components, etc., and hardware like hinges, handles, tooling, and other high-end luxury products.
            </p>
            <p>
                B. Fabricator/Dealer is engaged inter alia in the business of supplying fabricated Aluminum Façade,
                Doors, Windows & Internal partition Systems.
            </p>
            <p>
                C. GLAZIA WINDOORS PRIVATE LIMITED on the request of the Fabricator/Dealer is agreeable to explore
                business opportunities of mutual benefits initially for the region <b>…region name…</b> with the
                Fabricator/Dealer in relation to supplying Aluminium fabricated Windows, doors, and façade systems of
                Glazia Windoors listed in Annexure I attached, from the Fabricator/Dealer (the “Purpose”) and for the
                Purpose it may be desirable or necessary for GLAZIA WINDOORS PRIVATE LIMITED to disclose to the
                Fabricator/Dealer the Confidential Information (as defined in Article 1.3 hereof) which is either
                non-public, confidential or proprietary in nature and which may be disclosed either in written,
                electronic, oral or any other form/medium of whatsoever nature.
            </p>
            <p>
                D. Fabricator/Dealer is authorized to consult, evaluate, and execute projects & retail site,
                establish/negotiate for development of the business to supply to the developers/builders/showroom under
                the jurisdiction of his region.
            </p>
            <p>
                E. GLAZIA WINDOORS PRIVATE LIMITED being desirous of controlling the dissemination of the Confidential
                Information wishes the Fabricator/Dealer to enter into this Agreement and the Fabricator/Dealer has
                agreed to enter into this Agreement with GLAZIA WINDOORS PRIVATE LIMITED in respect of the Confidential
                Information and agrees and acknowledges that the Confidential Information will be regarded as
                confidential or proprietary in nature and will not be disclosed or used except in accordance with this
                Agreement.
            </p>
        </div>
    </div>

    <div class="section">
        NOW THEREFORE, This Agreement witnessed and in consideration of the mutually promised and covenants contained
        herein and for good and valuable mutual consideration, the receipt and sufficiency of which is hereby
        acknowledged, the Parties hereby agree as follows:
    </div>

    <div class="section">
        <b>1. DEFINITIONS</b>
        <div class="indent">
            <p>Unless the context otherwise requires, when used in this Agreement the following terms have the following
                meanings:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <td style="width: 8%; vertical-align: top;"><b>1.1</b></td>
                    <td style="width: 35%; vertical-align: top;"><b>“Agreement”</b></td>
                    <td style="width: 57%; vertical-align: top;">
                        Shall mean this Agreement and shall include any subsequent written additions, modifications, and
                        amendments thereto.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>1.2</b></td>
                    <td style="vertical-align: top;"><b>“GLAZIA WINDOORS PRIVATE LIMITED”</b></td>
                    <td style="vertical-align: top;">
                        Shall mean GLAZIA WINDOORS PRIVATE LIMITED, Kevat Khata No 361, Rect, No 21, Killa No 4/7 0-18,
                        Kherki Daula Village Road, Gurugram.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>1.3</b></td>
                    <td style="vertical-align: top;"><b>“Confidential Information”</b></td>
                    <td style="vertical-align: top;">
                        Shall include but not be restricted to all documents, materials, memoranda, copies, reports,
                        papers,
                        surveys, data,
                        graphs, charts, analyses, summaries, designs, drawings, diagrams, discs, tapes, floppy disks,
                        CDs,
                        DVDs, and other
                        information, of whatever nature and in whichever form, pertaining/relating to/owned or used by
                        GLAZIA WINDOORS
                        PRIVATE LIMITED (whether in physical/visual/oral/electronic/written and/or any other tangible
                        form
                        or otherwise)
                        and disclosed to the Fabricator/Dealer (whether prior to or after the execution of this
                        Agreement),
                        including without
                        limitations:
                        <ul style="list-style-type: none; padding-left: 0; margin-top: 0.5em;">
                            <li style="margin-bottom: 1em;">
                                ❖ any know-how, patent, copyright, software program, procedure, methodology, systems,
                                applications, computer files/data,
                                techniques, scientific data, price specifications, information pertaining to the
                                training
                                procedures/manuals, trade secrets,
                                business methods, business process, business techniques, customers list, price lists,
                                marketing plans, business plans,
                                drawings, designs, samples, past data concepts and ideas and other know-how, whether
                                protected under law or not, products
                                and product lines and other information relevant to GLAZIA WINDOORS PRIVATE LIMITED’s
                                business including but not limited
                                to technical information (and any tangible expression of such technical information),
                                commercial information and financial
                                information and past, present and future plans of GLAZIA WINDOORS PRIVATE LIMITED; and
                            </li>
                            <li>
                                ❖ any other matter which may reasonably be regarded as confidential or proprietary as
                                per
                                industry practice or which the
                                GLAZIA WINDOORS PRIVATE LIMITED informs the Fabricator/Dealer that it considers as
                                confidential or proprietary.
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>1.4</b></td>
                    <td style="vertical-align: top;"><b>“Purpose”</b></td>
                    <td style="vertical-align: top;">
                        Shall have the meaning ascribed to it in Recital C hereof.
                    </td>
                </tr>
            </table>
        </div>
        <div class="section">
            <b>3. CONFIDENTIALITY OBLIGATIONS</b>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <td style="width: 6%; vertical-align: top;"><b>3.1</b></td>
                    <td style="width: 94%; vertical-align: top;">
                        The Fabricator/Dealer hereby represents, warrants, and undertakes that it will not without the
                        specific prior written consent
                        of GLAZIA WINDOORS PRIVATE LIMITED, disclose the Confidential Information or any part thereof to
                        any
                        third party.
                        The Fabricator/Dealer acknowledges that the Confidential Information received by it on and from
                        ___
                        day of _______
                        shall be covered and governed by this Agreement as if disclosed pursuant to this Agreement.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>3.2</b></td>
                    <td style="vertical-align: top;">
                        The Fabricator/Dealer hereby represents, warrants, and undertakes that it will keep secret and
                        confidential
                        the Confidential Information and all other information that comes into its knowledge or is
                        generated
                        or
                        collected by it for the Purpose and will not use the same for any purpose whatsoever other than
                        for
                        the
                        Purpose in strict accordance with the terms and conditions of this Agreement. The
                        Fabricator/Dealer
                        shall
                        take all precautions and steps to preserve the secrecy and confidentiality of the Confidential
                        Information
                        and protect its security and integrity and further represents, warrants, and undertakes that it
                        will
                        take all
                        proper and effective precautions to prevent the disclosure of the Confidential Information to
                        any
                        third party
                        or an unauthorized person in any manner other than as per the terms of this Agreement. The
                        Fabricator/Dealer undertakes to use the strictest degree of care and scrutiny to avoid
                        disclosure,
                        publication, or dissemination of the Confidential Information, as it would have used with
                        respect to
                        its own
                        confidential information.
                    </td>
                </tr>
            </table>
        </div>
        <div class="section">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 6%; vertical-align: top;"><b>3.3</b></td>
                    <td style="width: 94%; vertical-align: top;">
                        The Fabricator/Dealer further agrees and undertakes that it shall not in any manner either
                        directly or indirectly disclose,
                        communicate, or make available to any third party or unauthorized person or use for any purpose
                        other than the Purpose,
                        the Confidential Information which may come to its knowledge or possession under this Agreement.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>3.4</b></td>
                    <td style="vertical-align: top;">
                        The Fabricator/Dealer acknowledges that all rights, titles, and interests in the Confidential
                        Information shall always
                        remain the property of GLAZIA WINDOORS PRIVATE LIMITED and the disclosure of Confidential
                        Information shall not
                        confer upon the Fabricator/Dealer any rights whatsoever in the Confidential Information.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>3.5</b></td>
                    <td style="vertical-align: top;">
                        The Fabricator/Dealer shall restrict access to the Confidential Information to such of its
                        directors, employees,
                        contractors, professional advisors, consultants, or agents who reasonably need to know such
                        Confidential Information for
                        the Purpose and shall ensure that such persons are aware of the confidentiality of the
                        Confidential Information and are
                        bound by obligations of confidentiality not less stringent than those contained in this
                        Agreement.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>3.6</b></td>
                    <td style="vertical-align: top;">
                        The Fabricator/Dealer shall not copy or reduce the Confidential Information to writing or other
                        recorded form except as
                        may be strictly necessary for the Purpose and then only in accordance with this Agreement.
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;"><b>3.7</b></td>
                    <td style="vertical-align: top;">
                        If the Fabricator/Dealer is requested or becomes legally compelled to disclose any Confidential
                        Information, the
                        Fabricator/Dealer shall provide GLAZIA WINDOORS PRIVATE LIMITED with prompt written notice of
                        such request or
                        requirement so that GLAZIA WINDOORS PRIVATE LIMITED may seek a protective order or other
                        appropriate remedy and/or
                        waive compliance with the provisions of this Agreement. The Fabricator/Dealer shall co-operate
                        with GLAZIA WINDOORS
                        PRIVATE LIMITED in its efforts to obtain such protective order or other remedy. If, in the
                        absence of a protective order or
                        other remedy or the receipt of a waiver by GLAZIA WINDOORS PRIVATE LIMITED, the
                        Fabricator/Dealer is nonetheless
                        legally compelled to disclose Confidential Information to any tribunal or else stand liable for
                        contempt or suffer other
                        censure or penalty, the Fabricator/Dealer may, without liability hereunder, disclose only such
                        portion of the Confidential
                        Information which it is legally required to disclose, provided that the Fabricator/Dealer shall
                        give GLAZIA WINDOORS
                        PRIVATE LIMITED written notice of the Confidential Information to be so disclosed as far in
                        advance of its disclosure as is
                        practicable and shall use its best efforts to ensure that such Confidential Information is
                        accorded confidential treatment.
                    </td>
                </tr>
            </table>
        </div>

        <div class="section">
            <b>4. EXCEPTIONS</b>
            <div class="indent">
                <p><b>4.1</b> The obligations of confidentiality provided in Article 3 hereof shall not apply with
                    respect to any information or data which: -</p>
                <ul style="padding-left: 2em; margin-top: 0;">
                    <li>
                        <b>(a)</b> the Fabricator/Dealer demonstrates within seven (7) days following its disclosure by
                        GLAZIA WINDOORS PRIVATE LIMITED to the Fabricator/Dealer to have been known to the
                        Fabricator/Dealer prior to such disclosure to it by GLAZIA WINDOORS PRIVATE LIMITED; or
                    </li>
                    <li>
                        <b>(b)</b> is in the public domain, as evidenced by a written publication thereof, without
                        breach of GLAZIA WINDOORS PRIVATE LIMITED's rights therein, or which subsequently enters into
                        the public domain otherwise than by any breach of this Agreement by the Fabricator/Dealer; or
                    </li>
                    <li>
                        <b>(c)</b> is approved for release upon the specific prior written permission of GLAZIA WINDOORS
                        PRIVATE LIMITED; or
                    </li>
                    <li>
                        <b>(d)</b> is required to be disclosed to a government/judicial/quasi-judicial body or tribunal
                        in pursuance of an order, however, subject to Article 3.7 hereof.
                    </li>
                </ul>
                <p><b>4.2</b> The exceptions to confidentiality obligations as contained in Article 4.1 hereof shall not
                    be interpreted as grounds for disregarding the obligations of confidentiality as provided in this
                    Agreement and the Fabricator/Dealer in all cases shall have the burden of proving the applicability
                    of any exception as contained in Article 4.1 hereof.</p>
            </div>
        </div>

        <div class="section">
            <b>5. OWNERSHIP RIGHTS</b>
            <div class="indent">
                <p><b>5.1</b> Disclosures by GLAZIA WINDOORS PRIVATE LIMITED of any of the Confidential Information to
                    the Fabricator/Dealer for the Purpose confer upon the Fabricator/Dealer, no proprietary rights over
                    any of the Confidential Information. In particular (without limitation) it is agreed between the
                    Parties under this Agreement that no license in respect of the Confidential Information, either
                    directly or indirectly, is granted to or acquired by the Fabricator/Dealer by implication or
                    otherwise.</p>

                <p><b>5.2</b> The Fabricator/Dealer hereby undertakes that it will not apply for any copyright or any
                    other form of intellectual property rights in the Confidential Information.</p>

                <p><b>5.3</b> GLAZIA WINDOORS PRIVATE LIMITED under the agreement shall supply the Aluminum windows as
                    per the system design in the repertoire which the dealer shall brand as GLAZIA WINDOORS PRIVATE
                    LIMITED. GLAZIA WINDOORS PRIVATE LIMITED shall only supply windows and doors material/product as per
                    designs as per the approved drawings signed off, and the installation will be the subject of the
                    dealer/Fabricator/Dealer.</p>
            </div>
        </div>

        <div class="section">
            <b>6. BREACH</b>
            <div class="indent">
                <p>It is agreed, understood, and acknowledged by the Fabricator/Dealer that the Confidential Information
                    is valuable and unique and that the obligations of and the conditions imposed on the
                    Fabricator/Dealer under this Agreement are necessary in the interest of the business of GLAZIA
                    WINDOORS PRIVATE LIMITED and any breach/threatened breach or violation of such obligations and
                    conditions in any manner whatsoever and to any extent or degree is likely to cause irreparable loss,
                    harm and injury to GLAZIA WINDOORS PRIVATE LIMITED which may not be adequately quantifiable or
                    determinable in monetary terms, and the Fabricator/Dealer agrees that GLAZIA WINDOORS PRIVATE
                    LIMITED shall have the right to remedy either directly or through any group company/entity any
                    breach/threatened breach or violation of any obligations and conditions as contained hereunder by
                    way of injunction or stay order in addition to and not in lieu of any other legal or equitable
                    relief including monetary damages.</p>
            </div>
        </div>
        <div class="section">
            <b>7. RETURN OF INFORMATION</b>
            <div class="indent">
                <p>
                    The Fabricator/Dealer hereby undertakes that it will within a period of fifteen (15) days of the
                    receipt of a written request
                    by GLAZIA WINDOORS PRIVATE LIMITED for return or destruction of any or all the Confidential
                    Information of GLAZIA
                    WINDOORS PRIVATE LIMITED, return any or all the Confidential Information so requested to GLAZIA
                    WINDOORS
                    PRIVATE LIMITED (without retaining any copies, extracts, records, duplicates etc. thereof in any
                    mode, whether written,
                    electronic, or otherwise) or irretrievably destroy and delete and procure the deletion and
                    destruction of the Confidential
                    Information so requested to be destroyed and/or to be deleted, by all parties dealing with or having
                    dealt with the
                    Confidential Information, as well as forthwith provide to GLAZIA WINDOORS PRIVATE LIMITED a
                    certificate of
                    destruction setting out particulars of all the Confidential Information so destroyed or deleted.
                </p>
            </div>
        </div>

        <div class="section">
            <b>8. TERM OF AGREEMENT</b>
            <div class="indent">
                <p>
                    This Agreement shall be deemed to be effective from ${date}/${month}/${year} being the date of first disclosure
                    of Confidential
                    Information by GLAZIA WINDOORS PRIVATE LIMITED to the Fabricator/Dealer. The license should be
                    renewed first on
                    completion of 3 years and subsequent renewal will be in each 5th year.
                </p>
            </div>
        </div>


        <div class="section">
            <b>9. INDEMNITY</b>
            <div class="indent">
                <p>
                    The Fabricator/Dealer agrees to and hereby indemnifies Rs 2Crore and undertakes to keep fully
                    indemnified and
                    harmless GLAZIA WINDOORS PRIVATE LIMITED, its shareholders, directors, employees, and officers from
                    and against
                    all or any claims, damages, (including penalties), losses, and costs (including attorney's fees)
                    arising out of or caused by
                    any act or omission, delay, negligence, default (willful or otherwise), error, infringement of any
                    third party intellectual
                    property rights, breach of any of the terms and conditions of this Agreement or of the
                    representations, warranties,
                    statements, covenants and/or undertakings under this Agreement or non-compliance with the
                    requirements of the
                    applicable laws. The aforesaid indemnification shall be without prejudice to any other
                    claim/judicial remedy that GLAZIA
                    WINDOORS PRIVATE LIMITED may have whether by way of injunctive or mandatory relief or otherwise.
                </p>
            </div>
        </div>
        <div class="section">
            <b>10. WAIVER</b>
            <div class="indent">
                <p>
                    Any delay or indulgence by GLAZIA WINDOORS PRIVATE LIMITED In enforcing the terms of this Agreement
                    or any
                    forbearance to the Fabricator/Dealer shall not be considered as a waiver by GLAZIA WINDOORS PRIVATE
                    LIMITED of
                    any breach of or non-compliance with any of the terms and conditions of this Agreement by the
                    Fabricator/Dealer nor
                    shall the same in any manner prejudice the rights of GLAZIA WINDOORS PRIVATE LIMITED hereunder.
                </p>
            </div>
        </div>

        <div class="section">
            <b>11. SEVERABILITY</b>
            <div class="indent">
                <p>
                    In the event any provision of this Agreement is held by a court of competent jurisdiction to be
                    unenforceable because it
                    is invalid or in conflict with any law of any relevant jurisdiction, the Validity of the remaining
                    provisions shall not be
                    affected, and the rights and obligations of the Parties shall be construed and enforced as if this
                    Agreement did not contain
                    the particular provisions held to be unenforceable and the unenforceable provisions shall be
                    replaced by mutually
                    acceptable provisions which, being valid, legal and enforceable, come closest to the intention of
                    the Parties underlying
                    the invalid or unenforceable provisions.
                </p>
            </div>
        </div>

        <div class="section">
            <b>12. ENTIRE AGREEMENT</b>
            <div class="indent">
                <p>
                    The Parties confirm and acknowledge that this Agreement constitutes the entire agreement between
                    them with respect
                    to the subject matter hereof and supersedes and overrides all previous communications, either oral
                    or written, between
                    the Parties with respect to the subject matter hereof and no agreement or understanding varying or
                    extending the same
                    shall be binding upon any Party unless arising out of the specific provisions of this Agreement and
                    is in writing.
                </p>
            </div>
        </div>
        <div class="section">
            <b>13. NOTICE</b>
            <div class="indent">
                <p><b>13.1</b> Any notice, demand, consent, or other communication given or made under this Agreement:
                </p>
                <ol type="a" style="margin-left: 1.5em;">
                    <li>must be in writing and signed by a person duly authorized by the sender; and</li>
                    <li>
                        must be delivered to the intended Fabricator/Dealer by prepaid post or by hand or email to the
                        address
                        or email addresses below or the address last notified by the intended Fabricator/Dealer to the
                        sender:
                        <br><br>
                        <b>To GLAZIA WINDOORS PRIVATE LIMITED</b><br>
                        Attention: Director<br>
                        Address: GLAZIA WINDOORS PRIVATE LIMITED,<br>
                        Kevat Khata No 361, Rect, No 21, Killa No 4/7 0-18<br>
                        Kherki Daula Village Road, Gurugram, India<br>
                        Phone: +91 9354876670, 9958053708; Email: sales@glazia.in<br><br>

                        <b>To The Fabricator/Dealer</b><br>
                        Attention: Mr./Ms. ${userName}<br>
                        Address: ${completeAddress}<br>
                        Phone: +91 ${phoneNumber}; Email: ${email}.com
                    </li>
                    <li>
                        will be deemed to be duly given or made:
                        <ol type="i" style="margin-left: 1.5em;">
                            <li>In the case of delivery in person, when delivered.</li>
                            <li>In the case of delivery by post, five (5) days after it has been posted; and</li>
                            <li>
                                in the case of delivery by email, on receipt by the sender of a delivery report (or sent
                                mail copy in
                                PDF) from the dispatching email ID showing the relevant number of pages and the correct
                                destination
                                email ID of Fabricator/Dealer and indication that the email has been made without
                                error/bounced.
                            </li>
                        </ol>
                    </li>
                </ol>
            </div>
        </div>
        <div class="section">
            <b>14. ARBITRATION</b>
            <div class="indent">
                <p>
                    All disputes, differences, controversies, or claims arising out of or relating to this Agreement
                    and/or the breach or
                    invalidity thereof and/or any other matter incidental thereto shall be referred to the arbitration
                    of three (3) arbitrators.
                </p>

                <p>
                    GLAZIA WINDOORS PRIVATE LIMITED shall appoint one (1) arbitrator and the Fabricator/Dealer shall
                    appoint one (1)
                    arbitrator and the two (2) arbitrators so appointed shall appoint a third arbitrator to act as the
                    presiding arbitrator. The
                    arbitrators shall also determine and make an award as to the costs of the arbitration proceedings
                    and/or reimbursement
                    for attorneys' fees etc. As the arbitrators shall deem fit. The arbitration shall be held in
                    accordance with the (Indian)
                    Arbitration and Conciliation Act, 1996, or any statutory modification or re-enactment thereof for
                    the time being in force.
                    The arbitration proceedings shall be held at Gurugram, Haryana, India, and the language of such
                    proceedings shall be
                    English.
                </p>
            </div>
        </div>
        <div class="section">
            <b>15. GOVERNING LAW</b>
            <div class="indent">
                <p>
                    This Agreement shall be interpreted and enforced in accordance with the laws of India and the Courts
                    at Gurugram,
                    Haryana shall have exclusive jurisdiction in relation to any matter arising out of or incidental to
                    this Agreement.
                </p>
            </div>
        </div>
        <div class="section">
            <p>
                <b>IN WITNESS WHEREOF,</b> the Parties have caused this Agreement to be executed by and through their
                duly
                authorized
                representatives as of the date first above written.
            </p>
        </div>

        <div class="section" style="margin-top: 2em;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <b>GLAZIA WINDOORS PRIVATE LIMITED</b><br><br>
                        By<br><br>
                    </td>
                    <td style="width: 50%; vertical-align: top;">
                        <b>(Fabricator/Dealer)</b><br><br>
                        By<br><br>
                    </td>
                </tr>
                <tr>
                    <td style="vertical-align: top;">
                        Name: _________________________________<br>
                        Title: <b>DIRECTOR</b><br><br>
                        Witness:<br>
                        Name: ____________________________<br>
                        Address: ______________________________
                    </td>
                    <td style="vertical-align: top;">
                        Name: _________________________________<br>
                        Title: __________________________________<br><br>
                        Witness:<br>
                        Name: _________________________________<br>
                        Address: ______________________________
                    </td>
                </tr>
            </table>
        </div>
        <div class="section" style="margin-top: 5em;">
            <p style="text-align: center; text-decoration: underline; font-weight: bold;">Details of Systems</p>
            <ul style="margin-left: 2em;">
                <li><b>C-Series</b> (Sliding System)</li>
                <li><b>E-series</b> (Sliding System)</li>
                <li><b>P-Series</b> (Sliding System)</li>
                <li><b>C4</b> (Casement System)</li>
                <li><b>C5</b> (Casement System)</li>
                <li><b>E131</b> (Casement System)</li>
                <li><b>E231</b> (Casement System)</li>
                <li><b>ESF</b> (Slide & Fold)</li>
                <li><b>PSF</b> (Slide & Fold)</li>
                <li><b>Railing</b></li>
                <li><b>C1645</b> (Internal Partition)</li>
            </ul>
        </div>

</body>

</html>`

         const opt = {
            margin:       0.5,
            filename:     'document.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const pdfBlob = await html2pdf().set(opt).from(htmlStr).outputPdf('blob');
        setBlob(pdfBlob);
        setUrl(URL.createObjectURL(pdfBlob));
    }

    React.useEffect(() => {
        generatePA();
    }, []);

    return (
        <iframe src={url} width="50%" />
    );
}

export default ParterAgreement;
