import React, { useEffect, useMemo, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCol,
  MDBRow,
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  MDBInput,
  MDBBtn,
  MDBSpinner,
  MDBTypography,
} from "mdb-react-ui-kit";
import api, { BASE_API_URL } from "../../../utils/api";
import ParterAgreement from "../../UserDetailsForm/PartnerAgreement/PartnerAgreement";
import "./UserManagement.css";

const emptyForm = {
  name: "",
  email: "",
  gstNumber: "",
  pincode: "",
  city: "",
  state: "",
  address: "",
  phoneNumber: "",
  extraPhoneNumbers: "",
  authorisedPerson: "",
  authorisedPersonDesignation: "",
};

const parseExtraNumbers = (raw) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showAgreement, setShowAgreement] = useState(false);
  const [paBlob, setPaBlob] = useState(null);
  const [promotionUser, setPromotionUser] = useState(null);
  const [promotionBlob, setPromotionBlob] = useState(null);
  const [promotionAccepted, setPromotionAccepted] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);

  const token = localStorage.getItem("authToken");

  const fetchUsers = async () => {
    setListLoading(true);
    setError("");
    try {
      const response = await api.get(`${BASE_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const userRows = useMemo(() => {
    let sorted = [...users];
    if (sortBy === "name") {
      sorted.sort((a, b) => {
        if (order === "asc") {
          return a.name.trim().localeCompare(b.name.trim(), 'en', { sensitivity: 'base' })
        } else {
          return b.name.trim().localeCompare(a.name.trim(), 'en', { sensitivity: 'base' })
        }
      });
    }
    if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        if (order == "asc") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }
    return sorted;
  }, [users, sortBy, order]);


  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (showAgreement || paBlob) {
      setShowAgreement(false);
      setPaBlob(null);
    }
  };

  const handleGenerateAgreement = () => {
    if (
      !form.name ||
      !form.email ||
      !form.gstNumber ||
      !form.pincode ||
      !form.city ||
      !form.state ||
      !form.address ||
      !form.phoneNumber
    ) {
      setError("Fill all required fields before generating the agreement.");
      return;
    }

    setError("");
    setShowAgreement(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      if (!paBlob) {
        setError("Generate the partner agreement before creating the user.");
        return;
      }

      const extraNumbers = parseExtraNumbers(form.extraPhoneNumbers);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("gstNumber", form.gstNumber);
      formData.append("pincode", form.pincode);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("address", form.address);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append('authorizedPerson', form.authorisedPerson);
      formData.append('authorizedPersonDesignation', form.authorisedPersonDesignation);

      extraNumbers.forEach((number) => formData.append("phoneNumbers", number));
      formData.append(
        "paPdf",
        new File([paBlob], "partner-agreement.pdf", {
          type: "application/pdf",
        })
      );

      await api.post(`${BASE_API_URL}/user/register`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setForm(emptyForm);
      setShowAgreement(false);
      setPaBlob(null);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const promoteToDealership = async () => {
    if (!promotionUser || !promotionBlob || !promotionAccepted) return;
    setPromotionLoading(true); setError("");
    try {
      const data = new FormData();
      data.append("partnerAgreementAccepted", "true");
      data.append("paPdf", new File([promotionBlob], "glazia-dealership-agreement.pdf", { type: "application/pdf" }));
      await api.post(`${BASE_API_URL}/admin/users/${promotionUser._id}/promote-dealership`, data, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setPromotionUser(null); setPromotionBlob(null); setPromotionAccepted(false); await fetchUsers();
    } catch (err) { setError(err.response?.data?.message || "Failed to promote fabricator"); }
    finally { setPromotionLoading(false); }
  };

  return (
    <MDBRow className="user-management-wrapper mt-5">
      <MDBCol md="12">
        <MDBCard className="mb-4">
          <MDBCardHeader>
            <MDBTypography tag="h5" className="mb-0">
              Add New User
            </MDBTypography>
          </MDBCardHeader>
          <MDBCardBody>
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <MDBRow>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Name"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="GST Number"
                    value={form.gstNumber}
                    onChange={handleChange("gstNumber")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Additional Phone Numbers (comma separated)"
                    value={form.extraPhoneNumbers}
                    onChange={handleChange("extraPhoneNumbers")}
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Pincode"
                    value={form.pincode}
                    onChange={handleChange("pincode")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="City"
                    value={form.city}
                    onChange={handleChange("city")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="State"
                    value={form.state}
                    onChange={handleChange("state")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Authorised Person"
                    value={form.authorisedPerson}
                    onChange={handleChange("authorisedPerson")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="6" className="mb-3">
                  <MDBInput
                    label="Authorised Person Designation"
                    value={form.authorisedPersonDesignation}
                    onChange={handleChange("authorisedPersonDesignation")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="12" className="mb-3">
                  <MDBInput
                    label="Address"
                    value={form.address}
                    onChange={handleChange("address")}
                    required
                    disabled={formLoading}
                  />
                </MDBCol>
                <MDBCol md="12" className="mb-3">
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <MDBBtn
                      color="secondary"
                      type="button"
                      disabled={formLoading}
                      onClick={handleGenerateAgreement}
                    >
                      Generate Partner Agreement
                    </MDBBtn>
                    {showAgreement && (
                      <ParterAgreement
                        userName={form.name}
                        completeAddress={form.address}
                        gstNumber={form.gstNumber}
                        pincode={form.pincode}
                        city={form.city}
                        state={form.state}
                        phoneNumber={form.phoneNumber}
                        email={form.email}
                        setBlob={setPaBlob}
                      />
                    )}
                  </div>
                </MDBCol>
              </MDBRow>
              <div className="d-flex justify-content-end">
                <MDBBtn color="primary" type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <MDBSpinner size="sm" role="status" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Create User"
                  )}
                </MDBBtn>
              </div>
            </form>
          </MDBCardBody>
        </MDBCard>

        <MDBCard>
          <MDBCardHeader>
            <div className="d-flex align-items-center justify-content-between">
              <MDBTypography tag="h5" className="mb-0">
                Current Users
              </MDBTypography>
              <MDBBtn
                size="sm"
                color="light"
                onClick={fetchUsers}
                disabled={listLoading}
              >
                Refresh
              </MDBBtn>
            </div>
          </MDBCardHeader>
          <div className="d-flex gap-3 p-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Registered Date</option>
            </select>

            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <MDBCardBody className="p-0">
            {listLoading ? (
              <div className="d-flex justify-content-center py-4">
                <MDBSpinner role="status" />
              </div>
            ) : (
              <MDBTable responsive hover className="mb-0">
                <MDBTableHead className="bg-light">
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Additional Phones</th>
                    <th>GST</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Registered At</th>
                    <th>Account</th>
                    <th>Action</th>
                  </tr>
                </MDBTableHead>

                <MDBTableBody>
                  {userRows.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center py-4 text-muted">
                        No users available
                      </td>
                    </tr>
                  ) : (
                    userRows.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>
                          {(user.phoneNumbers || [])
                            .filter((num) => num !== user.phoneNumber)
                            .join(", ") || "-"}
                        </td>
                        <td><span className={`badge ${user.accountType === "DEALERSHIP" ? "bg-success" : "bg-secondary"}`}>{user.accountType || "FABRICATOR"}</span></td>
                        <td>{user.accountType === "FABRICATOR" ? <MDBBtn size="sm" color="secondary" onClick={() => { setPromotionUser(user); setPromotionBlob(null); setPromotionAccepted(false); }}>Promote to dealership</MDBBtn> : "—"}</td>
                        <td>{user.gstNumber || "-"}</td>
                        <td>{user.city || "-"}</td>
                        <td>{user.state || "-"}</td>
                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </MDBTableBody>
              </MDBTable>


            )}
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
      {promotionUser && <div className="promotion-backdrop"><div className="promotion-modal" role="dialog" aria-modal="true"><div className="d-flex justify-content-between align-items-start"><div><h4>Promote to dealership</h4><p className="text-muted">{promotionUser.name} · {promotionUser.phoneNumber}</p></div><button className="promotion-close" onClick={() => setPromotionUser(null)}>×</button></div><div className="alert alert-warning small">The existing Glazia–Fabricator agreement will be deleted from S3 and replaced by this Glazia–Dealership agreement.</div><div className="promotion-agreement"><ParterAgreement agreementType="GLAZIA_DEALERSHIP" userName={promotionUser.name} completeAddress={promotionUser.address || ""} gstNumber={promotionUser.gstNumber} pincode={promotionUser.pincode || ""} city={promotionUser.city} state={promotionUser.state} phoneNumber={promotionUser.phoneNumber} email={promotionUser.email} setBlob={setPromotionBlob}/></div><label className="d-flex align-items-start gap-2 mt-3"><input type="checkbox" className="mt-1" checked={promotionAccepted} onChange={event => setPromotionAccepted(event.target.checked)}/><span>I confirm the dealership has reviewed and accepted the new agreement.</span></label><div className="d-flex justify-content-end gap-2 mt-4"><MDBBtn color="light" onClick={() => setPromotionUser(null)}>Cancel</MDBBtn><MDBBtn disabled={!promotionBlob || !promotionAccepted || promotionLoading} onClick={promoteToDealership}>{promotionLoading ? "Promoting…" : "Promote dealership"}</MDBBtn></div></div></div>}
    </MDBRow>
  );
};

export default UserManagement;
