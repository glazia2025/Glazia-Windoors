import React, { useEffect, useMemo, useState } from "react";
import "./UserListing.css";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCol,
  MDBRow,
  MDBListGroup,
  MDBListGroupItem,
  MDBSpinner,
  MDBBtn,
  MDBTable,
  MDBTableBody,
  MDBTableHead,
  MDBInput,
  MDBTypography,
  MDBIcon,
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  fetchUserDynamicPricing,
  updateUserDynamicPricing,
  setSelectedUser,
  clearDynamicPricing,
} from "../../../redux/adminUsersSlice";

const emptyRow = () => ({ key: "", value: "" });

const rowsFromRecord = (record = {}) =>
  Object.entries(record).map(([key, value]) => ({ key, value: value ?? "" }));

const rowsToRecord = (rows) => {
  return rows.reduce((acc, row) => {
    if (!row.key) {
      return acc;
    }
    const numericValue = Number(row.value);
    acc[row.key] = Number.isFinite(numericValue) ? numericValue : row.value;
    return acc;
  }, {});
};

const PricingTable = ({
  title,
  rows,
  onChange,
  onAddRow,
  onDeleteRow,
  loading,
}) => (
  <MDBCard className="mb-4">
    <MDBCardHeader className="d-flex justify-content-between align-items-center">
      <MDBTypography tag="h6" className="mb-0">
        {title}
      </MDBTypography>
    </MDBCardHeader>
    <MDBCardBody className="p-0">
      <MDBTable responsive hover className="mb-0" style={{color: 'black'}}>
        <MDBTableHead className="bg-light">
          <tr>
            <th style={{ width: "45%" }}>Key</th>
            <th style={{ width: "35%" }}>Value</th>
            <th style={{ width: "20%" }} className="text-center">
              Actions
            </th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-4 text-muted">
                No entries configured
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={`${row.key}-${index}`}>
              <td>
                {row.key}
              </td>
              <td>
                <MDBInput
                  type="number"
                  size="sm"
                  value={row.value}
                  onChange={(e) => onChange(index, "value", e.target.value)}
                  disabled={loading}
                  
                />
              </td>
              <td className="text-center">
                <MDBBtn
                  size="sm"
                  color="danger"
                  outline
                  onClick={() => onDeleteRow(index)}
                  disabled={loading}
                >
                  <MDBIcon icon="trash" />
                </MDBBtn>
              </td>
            </tr>
          ))}
        </MDBTableBody>
      </MDBTable>
    </MDBCardBody>
  </MDBCard>
);

const UserListing = () => {
  const dispatch = useDispatch();
  const {
    users,
    listLoading,
    pricingLoading,
    updateLoading,
    error,
    selectedUser,
    dynamicPricing,
  } = useSelector((state) => state.adminUsers);

  const [hardwareRows, setHardwareRows] = useState([]);
  const [profileRows, setProfileRows] = useState([]);

  useEffect(() => {
    dispatch(fetchAdminUsers());
    return () => {
      dispatch(clearDynamicPricing());
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  useEffect(() => {
    setHardwareRows(rowsFromRecord(dynamicPricing.hardware));
    setProfileRows(rowsFromRecord(dynamicPricing.profiles));
  }, [dynamicPricing]);

  const userList = useMemo(() => users ?? [], [users]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
    setHardwareRows([]);
    setProfileRows([]);
    dispatch(fetchUserDynamicPricing(user._id));
  };

  const handleRowChange = (section, index, field, value) => {
    const updater = section === "hardware" ? setHardwareRows : setProfileRows;
    const rows = section === "hardware" ? [...hardwareRows] : [...profileRows];
    rows[index] = { ...rows[index], [field]: value };
    updater(rows);
  };

  const handleAddRow = (section) => {
    const updater = section === "hardware" ? setHardwareRows : setProfileRows;
    const rows = section === "hardware" ? [...hardwareRows] : [...profileRows];
    updater([...rows, emptyRow()]);
  };

  const handleDeleteRow = (section, index) => {
    const updater = section === "hardware" ? setHardwareRows : setProfileRows;
    const rows = section === "hardware" ? [...hardwareRows] : [...profileRows];
    rows.splice(index, 1);
    updater(rows);
  };

  const handleSave = () => {
    if (!selectedUser) return;

    const payload = {
      hardware: rowsToRecord(hardwareRows),
      profiles: rowsToRecord(profileRows),
    };

    dispatch(updateUserDynamicPricing({ userId: selectedUser._id, pricing: payload }));
  };

  return (
    <MDBCard className="mt-5">
      <MDBCardHeader>
        <MDBTypography tag="h5" className="mb-0">
          Manage User Dynamic Pricing
        </MDBTypography>
      </MDBCardHeader>
      <MDBCardBody>
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        <MDBRow>
          <MDBCol md="4" className="mb-4">
            <MDBTypography tag="h6" className="mb-3">
              Users
            </MDBTypography>
            {listLoading ? (
              <div className="d-flex justify-content-center py-4">
                <MDBSpinner role="status" />
              </div>
            ) : (
              <MDBListGroup style={{ maxHeight: "380px", overflowY: "auto" }}>
                {userList.length === 0 && (
                  <MDBListGroupItem className="text-muted">
                    No users available
                  </MDBListGroupItem>
                )}
                {userList.map((user) => {
                  const isActive = selectedUser?._id === user._id;
                  return (
                    <MDBListGroupItem
                      key={user._id}
                      action
                      active={isActive}
                      onClick={() => handleSelectUser(user)}
                      className="d-flex flex-column"
                    >
                      <strong>{user.name}</strong>
                      <small className="text-muted">{user.email}</small>
                      <small className="text-muted">{user.phoneNumber}</small>
                    </MDBListGroupItem>
                  );
                })}
              </MDBListGroup>
            )}
          </MDBCol>

          <MDBCol md="8">
            {selectedUser ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <MDBTypography tag="h6" className="mb-1">
                      {selectedUser.name}
                    </MDBTypography>
                    <small className="text-muted">
                      GST: {selectedUser.gstNumber || "N/A"} | {selectedUser.city}, {" "}
                      {selectedUser.state}
                    </small>
                  </div>
                  {pricingLoading && <MDBSpinner size="sm" role="status" />}
                </div>

                <PricingTable
                  title="Hardware Pricing"
                  rows={hardwareRows}
                  onChange={(index, field, value) =>
                    handleRowChange("hardware", index, field, value)
                  }
                  onAddRow={() => handleAddRow("hardware")}
                  onDeleteRow={(index) => handleDeleteRow("hardware", index)}
                  loading={updateLoading}
                />

                <PricingTable
                  title="Profile Pricing"
                  rows={profileRows}
                  onChange={(index, field, value) =>
                    handleRowChange("profiles", index, field, value)
                  }
                  onAddRow={() => handleAddRow("profiles")}
                  onDeleteRow={(index) => handleDeleteRow("profiles", index)}
                  loading={updateLoading}
                />

                <div className="d-flex justify-content-end">
                  <MDBBtn
                    color="success"
                    onClick={handleSave}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <MDBSpinner size="sm" role="status" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </MDBBtn>
                </div>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                <MDBIcon icon="arrow-left" size="2x" className="mb-3" />
                <p>Select a user to view pricing</p>
              </div>
            )}
          </MDBCol>
        </MDBRow>
      </MDBCardBody>
    </MDBCard>
  );
};

export default UserListing;
