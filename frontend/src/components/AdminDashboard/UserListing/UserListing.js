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
import api, { BASE_API_URL } from "../../../utils/api";

const emptyRow = () => ({ key: "", value: "" });
const SUBCATEGORY_SEPARATOR = " - ";

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

const splitProfileRows = (rows) => {
  const categoryRows = [];
  const subcategoryRows = [];

  rows.forEach((row) => {
    if (row.key.includes(SUBCATEGORY_SEPARATOR)) {
      subcategoryRows.push(row);
    } else {
      categoryRows.push(row);
    }
  });

  return { categoryRows, subcategoryRows };
};

const mergeProfileStructureRows = (record, profileStructure) => {
  if (!profileStructure.length) {
    return rowsFromRecord(record);
  }

  const nextRows = rowsFromRecord(record);
  const existingKeys = new Set(nextRows.map((row) => row.key));

  profileStructure.forEach((category) => {
    if (category?.name && !existingKeys.has(category.name)) {
      nextRows.push({ key: category.name, value: 0 });
      existingKeys.add(category.name);
    }
    (category?.sizes || []).forEach((size) => {
      if (!size?.label) {
        return;
      }
      const key = `${category.name}${SUBCATEGORY_SEPARATOR}${size.label}`;
      if (!existingKeys.has(key)) {
        nextRows.push({ key, value: 0 });
        existingKeys.add(key);
      }
    });
  });

  return nextRows;
};

const orderProfileCategoryRows = (rows, profileStructure) => {
  if (!profileStructure.length) {
    return rows;
  }
  const orderMap = new Map(
    profileStructure
      .filter((category) => category?.name)
      .map((category, index) => [category.name, index])
  );
  return [...rows].sort((a, b) => {
    const orderA = orderMap.has(a.key) ? orderMap.get(a.key) : Number.MAX_SAFE_INTEGER;
    const orderB = orderMap.has(b.key) ? orderMap.get(b.key) : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.key.localeCompare(b.key);
  });
};

const buildSubcategoryGroups = (subcategoryRows) => {
  const groups = new Map();
  const unmatched = [];

  subcategoryRows.forEach((row, index) => {
    const separatorIndex = row.key.indexOf(SUBCATEGORY_SEPARATOR);
    if (separatorIndex === -1) {
      unmatched.push({ row, index, label: row.key });
      return;
    }

    const category = row.key.slice(0, separatorIndex).trim();
    const label = row.key.slice(separatorIndex + SUBCATEGORY_SEPARATOR.length).trim();
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category).push({ row, index, label: label || row.key });
  });

  return { groups, unmatched };
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

const ProfilePricingTable = ({
  categoryRows,
  subcategoryRows,
  profileStructure,
  onCategoryChange,
  onCategoryDelete,
  onSubcategoryChange,
  onSubcategoryDelete,
  loading,
}) => {
  const { groups, unmatched } = buildSubcategoryGroups(subcategoryRows);
  const sizeOrderByCategory = new Map();
  profileStructure.forEach((category) => {
    const order = new Map();
    (category.sizes || []).forEach((size, index) => {
      if (size?.label) {
        order.set(size.label, index);
      }
    });
    if (category?.name) {
      sizeOrderByCategory.set(category.name, order);
    }
  });

  return (
    <MDBCard className="mb-4">
      <MDBCardHeader className="d-flex justify-content-between align-items-center">
        <MDBTypography tag="h6" className="mb-0">
          Profile Pricing
        </MDBTypography>
      </MDBCardHeader>
      <MDBCardBody className="p-0">
        <MDBTable responsive hover className="mb-0" style={{ color: "black" }}>
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
            {categoryRows.length === 0 && subcategoryRows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  No entries configured
                </td>
              </tr>
            )}
            {categoryRows.map((row, index) => {
              const subcategories = [...(groups.get(row.key) || [])];
              const orderMap = sizeOrderByCategory.get(row.key);
              if (orderMap) {
                subcategories.sort((a, b) => {
                  const orderA = orderMap.has(a.label)
                    ? orderMap.get(a.label)
                    : Number.MAX_SAFE_INTEGER;
                  const orderB = orderMap.has(b.label)
                    ? orderMap.get(b.label)
                    : Number.MAX_SAFE_INTEGER;
                  if (orderA !== orderB) {
                    return orderA - orderB;
                  }
                  return a.label.localeCompare(b.label);
                });
              }
              return (
                <React.Fragment key={`${row.key}-${index}`}>
                  <tr>
                    <td>
                      <strong>{row.key}</strong>
                    </td>
                    <td>
                      <MDBInput
                        type="number"
                        size="sm"
                        value={row.value}
                        onChange={(e) =>
                          onCategoryChange(index, "value", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>
                    <td className="text-center">
                      <MDBBtn
                        size="sm"
                        color="danger"
                        outline
                        onClick={() => onCategoryDelete(index)}
                        disabled={loading}
                      >
                        <MDBIcon icon="trash" />
                      </MDBBtn>
                    </td>
                  </tr>
                  {subcategories.map((sub) => (
                    <tr key={`${sub.row.key}-${sub.index}`}>
                      <td style={{ paddingLeft: "1.5rem" }}>
                        {sub.label}
                      </td>
                      <td>
                        <MDBInput
                          type="number"
                          size="sm"
                          value={sub.row.value}
                          onChange={(e) =>
                            onSubcategoryChange(sub.index, "value", e.target.value)
                          }
                          disabled={loading}
                        />
                      </td>
                      <td className="text-center">
                        <MDBBtn
                          size="sm"
                          color="danger"
                          outline
                          onClick={() => onSubcategoryDelete(sub.index)}
                          disabled={loading}
                        >
                          <MDBIcon icon="trash" />
                        </MDBBtn>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
            {unmatched.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="text-muted">
                    Other subcategories
                  </td>
                </tr>
                {unmatched.map((sub) => (
                  <tr key={`${sub.row.key}-${sub.index}`}>
                    <td style={{ paddingLeft: "1.5rem" }}>{sub.label}</td>
                    <td>
                      <MDBInput
                        type="number"
                        size="sm"
                        value={sub.row.value}
                        onChange={(e) =>
                          onSubcategoryChange(sub.index, "value", e.target.value)
                        }
                        disabled={loading}
                      />
                    </td>
                    <td className="text-center">
                      <MDBBtn
                        size="sm"
                        color="danger"
                        outline
                        onClick={() => onSubcategoryDelete(sub.index)}
                        disabled={loading}
                      >
                        <MDBIcon icon="trash" />
                      </MDBBtn>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </MDBTableBody>
        </MDBTable>
      </MDBCardBody>
    </MDBCard>
  );
};

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
  const [profileSubcategoryRows, setProfileSubcategoryRows] = useState([]);
  const [profileStructure, setProfileStructure] = useState([]);

  useEffect(() => {
    dispatch(fetchAdminUsers());
    return () => {
      dispatch(clearDynamicPricing());
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  useEffect(() => {
    setHardwareRows(rowsFromRecord(dynamicPricing.hardware));
    const profileRowsAll = mergeProfileStructureRows(
      dynamicPricing.profiles,
      profileStructure
    );
    const { categoryRows, subcategoryRows } = splitProfileRows(profileRowsAll);
    setProfileRows(orderProfileCategoryRows(categoryRows, profileStructure));
    setProfileSubcategoryRows(subcategoryRows);
  }, [dynamicPricing, profileStructure]);

  useEffect(() => {
    let isActive = true;

    const loadProfileStructure = async () => {
      try {
        const { data: categories } = await api.get(
          `${BASE_API_URL}/profile/categories`
        );

        const categoryList = Array.isArray(categories) ? categories : [];
        const sizeResponses = await Promise.all(
          categoryList.map((category) =>
            api.get(`${BASE_API_URL}/profile/sizes/category/${category._id}`)
          )
        );

        const nextStructure = categoryList.map((category, index) => ({
          id: category._id,
          name: category.name,
          sizes: (sizeResponses[index]?.data || [])
            .filter((size) => size?.label)
            .map((size) => ({ id: size._id, label: size.label })),
        }));

        if (isActive) {
          setProfileStructure(nextStructure);
        }
      } catch (error) {
        if (isActive) {
          setProfileStructure([]);
        }
      }
    };

    loadProfileStructure();

    return () => {
      isActive = false;
    };
  }, []);

  const userList = useMemo(() => users ?? [], [users]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
    setHardwareRows([]);
    setProfileRows([]);
    setProfileSubcategoryRows([]);
    dispatch(fetchUserDynamicPricing(user._id));
  };

  const handleRowChange = (section, index, field, value) => {
    const isHardware = section === "hardware";
    const isSubcategory = section === "profileSubcategories";
    const updater = isHardware
      ? setHardwareRows
      : isSubcategory
        ? setProfileSubcategoryRows
        : setProfileRows;
    const rows = isHardware
      ? [...hardwareRows]
      : isSubcategory
        ? [...profileSubcategoryRows]
        : [...profileRows];
    rows[index] = { ...rows[index], [field]: value };
    updater(rows);
  };

  const handleAddRow = (section) => {
    const isHardware = section === "hardware";
    const isSubcategory = section === "profileSubcategories";
    const updater = isHardware
      ? setHardwareRows
      : isSubcategory
        ? setProfileSubcategoryRows
        : setProfileRows;
    const rows = isHardware
      ? [...hardwareRows]
      : isSubcategory
        ? [...profileSubcategoryRows]
        : [...profileRows];
    updater([...rows, emptyRow()]);
  };

  const handleDeleteRow = (section, index) => {
    const isHardware = section === "hardware";
    const isSubcategory = section === "profileSubcategories";
    const updater = isHardware
      ? setHardwareRows
      : isSubcategory
        ? setProfileSubcategoryRows
        : setProfileRows;
    const rows = isHardware
      ? [...hardwareRows]
      : isSubcategory
        ? [...profileSubcategoryRows]
        : [...profileRows];
    rows.splice(index, 1);
    updater(rows);
  };

  const handleSave = () => {
    if (!selectedUser) return;

    const payload = {
      hardware: rowsToRecord(hardwareRows),
      profiles: {
        ...rowsToRecord(profileRows),
        ...rowsToRecord(profileSubcategoryRows),
      },
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

                <ProfilePricingTable
                  categoryRows={profileRows}
                  subcategoryRows={profileSubcategoryRows}
                  profileStructure={profileStructure}
                  onCategoryChange={(index, field, value) =>
                    handleRowChange("profiles", index, field, value)
                  }
                  onCategoryDelete={(index) => handleDeleteRow("profiles", index)}
                  onSubcategoryChange={(index, field, value) =>
                    handleRowChange("profileSubcategories", index, field, value)
                  }
                  onSubcategoryDelete={(index) =>
                    handleDeleteRow("profileSubcategories", index)
                  }
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
