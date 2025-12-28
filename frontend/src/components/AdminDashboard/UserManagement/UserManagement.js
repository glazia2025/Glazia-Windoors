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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      const extraNumbers = parseExtraNumbers(form.extraPhoneNumbers);

      await api.post(
        `${BASE_API_URL}/user/register`,
        {
          name: form.name,
          email: form.email,
          gstNumber: form.gstNumber,
          pincode: form.pincode,
          city: form.city,
          state: form.state,
          address: form.address,
          phoneNumber: form.phoneNumber,
          phoneNumbers: extraNumbers.length ? extraNumbers : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm(emptyForm);
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
                <MDBCol md="12" className="mb-3">
                  <MDBInput
                    label="Address"
                    value={form.address}
                    onChange={handleChange("address")}
                    required
                    disabled={formLoading}
                  />
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
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {userRows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
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
