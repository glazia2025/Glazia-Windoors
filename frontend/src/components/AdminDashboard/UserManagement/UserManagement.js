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
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showAgreement, setShowAgreement] = useState(false);
  const [paBlob, setPaBlob] = useState(null);

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

  const userRows = useMemo(() => users ?? [], [users]);

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
          <MDBCardBody className="p-0">
            {listLoading ? (
              <div className="d-flex justify-content-center py-4">
                <MDBSpinner role="status" />
              </div>
            ) : (
              <MDBTable responsive hover className="mb-0">
                <MDBTableHead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Additional Phones</th>
                    <th>GST</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Partner Agreement</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {userRows.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No users available
                      </td>
                    </tr>
                  ) : (
                    userRows.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber}</td>
                        <td>
                          {(user.phoneNumbers || [])
                            .filter((num) => num !== user.phoneNumber)
                            .join(", ") || "-"}
                        </td>
                        <td>{user.gstNumber || "-"}</td>
                        <td>{user.city || "-"}</td>
                        <td>{user.state || "-"}</td>
                        <td>
                          {user.paUrl ? (
                            <div className="d-flex gap-2">
                              <a
                                href={user.paUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                              <a href={user.paUrl} download>
                                Download
                              </a>
                            </div>
                          ) : (
                            "-"
                          )}
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
    </MDBRow>
  );
};

export default UserManagement;
