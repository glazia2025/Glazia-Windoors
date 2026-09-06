import React, { useEffect, useMemo, useState } from "react";
import "./UserListing.css";
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

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "CL";
};

const PricingTable = ({
  title,
  rows,
  onChange,
  onDeleteRow,
  loading,
}) => (
  <div className="udp-section-card mb-4">
    <div className="udp-section-header">
      <div className="udp-section-title-wrapper">
        <div className="udp-section-icon">
          <i className="fas fa-cubes"></i>
        </div>
        <h5 className="udp-section-title">{title}</h5>
        <span className="udp-section-badge">{rows.length} items</span>
      </div>
    </div>

    <div className="udp-table-responsive">
      <table className="udp-table">
        <thead>
          <tr>
            <th style={{ width: "8%", textAlign: "center" }}>#</th>
            <th style={{ width: "47%" }}>Hardware Item</th>
            <th style={{ width: "30%" }}>Custom Rate</th>
            <th style={{ width: "15%", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="udp-table-empty">
                <i className="fas fa-inbox me-2"></i> No hardware dynamic entries configured
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.key}-${index}`}>
                <td style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                  {index + 1}
                </td>
                <td>
                  <strong style={{ color: "#1e293b" }}>{row.key}</strong>
                </td>
                <td>
                  <div className="udp-currency-box">
                    <span className="udp-currency-prefix">₹</span>
                    <input
                      type="number"
                      className="udp-rate-input"
                      value={row.value}
                      onChange={(e) => onChange(index, "value", e.target.value)}
                      disabled={loading}
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    className="udp-btn-trash"
                    onClick={() => onDeleteRow(index)}
                    disabled={loading}
                    title="Remove rate"
                  >
                    <i className="far fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
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

  const totalCount = categoryRows.length + subcategoryRows.length;

  return (
    <div className="udp-section-card mb-4">
      <div className="udp-section-header">
        <div className="udp-section-title-wrapper">
          <div className="udp-section-icon">
            <i className="fas fa-layer-group"></i>
          </div>
          <h5 className="udp-section-title">Profile Dynamic Pricing</h5>
          <span className="udp-section-badge">{totalCount} rates configured</span>
        </div>
      </div>

      <div className="udp-table-responsive">
        <table className="udp-table">
          <thead>
            <tr>
              <th style={{ width: "8%", textAlign: "center" }}>#</th>
              <th style={{ width: "47%" }}>Profile Category / Sub-size</th>
              <th style={{ width: "30%" }}>Custom Rate</th>
              <th style={{ width: "15%", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {categoryRows.length === 0 && subcategoryRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="udp-table-empty">
                  <i className="fas fa-inbox me-2"></i> No profile dynamic entries configured
                </td>
              </tr>
            ) : (
              categoryRows.map((row, index) => {
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
                    <tr className="udp-category-row">
                      <td style={{ textAlign: "center", color: "#64748b", fontWeight: "600" }}>
                        {index + 1}
                      </td>
                      <td>
                        <div className="udp-category-name">
                          <i className="fas fa-folder-open"></i>
                          <span>{row.key}</span>
                          <span className="udp-category-pill">Base Category</span>
                        </div>
                      </td>
                      <td>
                        <div className="udp-currency-box">
                          <span className="udp-currency-prefix">₹</span>
                          <input
                            type="number"
                            className="udp-rate-input"
                            value={row.value}
                            onChange={(e) =>
                              onCategoryChange(index, "value", e.target.value)
                            }
                            disabled={loading}
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="udp-btn-trash"
                          onClick={() => onCategoryDelete(index)}
                          disabled={loading}
                          title="Remove category rate"
                        >
                          <i className="far fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>

                    {subcategories.map((sub, subIdx) => (
                      <tr className="udp-subcategory-row" key={`${sub.row.key}-${sub.index}`}>
                        <td style={{ textAlign: "center", color: "#cbd5e1", fontSize: "11px" }}>
                          {index + 1}.{subIdx + 1}
                        </td>
                        <td>
                          <div className="udp-subcategory-name">
                            <span className="udp-sub-indicator">↳</span>
                            <span>{sub.label}</span>
                            <span className="udp-sub-badge">Sub-size</span>
                          </div>
                        </td>
                        <td>
                          <div className="udp-currency-box">
                            <span className="udp-currency-prefix">₹</span>
                            <input
                              type="number"
                              className="udp-rate-input"
                              value={sub.row.value}
                              onChange={(e) =>
                                onSubcategoryChange(sub.index, "value", e.target.value)
                              }
                              disabled={loading}
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="udp-btn-trash"
                            onClick={() => onSubcategoryDelete(sub.index)}
                            disabled={loading}
                            title="Remove sub-size rate"
                          >
                            <i className="far fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}

            {unmatched.length > 0 && (
              <>
                <tr className="udp-category-row">
                  <td colSpan={4}>
                    <div className="udp-category-name">
                      <i className="fas fa-list-ul"></i>
                      <span>Additional Subcategories</span>
                    </div>
                  </td>
                </tr>
                {unmatched.map((sub, uIdx) => (
                  <tr className="udp-subcategory-row" key={`${sub.row.key}-${sub.index}`}>
                    <td style={{ textAlign: "center", color: "#cbd5e1", fontSize: "11px" }}>
                      *
                    </td>
                    <td>
                      <div className="udp-subcategory-name">
                        <span className="udp-sub-indicator">↳</span>
                        <span>{sub.label}</span>
                      </div>
                    </td>
                    <td>
                      <div className="udp-currency-box">
                        <span className="udp-currency-prefix">₹</span>
                        <input
                          type="number"
                          className="udp-rate-input"
                          value={sub.row.value}
                          onChange={(e) =>
                            onSubcategoryChange(sub.index, "value", e.target.value)
                          }
                          disabled={loading}
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="udp-btn-trash"
                        onClick={() => onSubcategoryDelete(sub.index)}
                        disabled={loading}
                        title="Remove rate"
                      >
                        <i className="far fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
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

  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return userList;
    const q = searchTerm.toLowerCase();
    return userList.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q) ||
        u.gstNumber?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.state?.toLowerCase().includes(q)
    );
  }, [userList, searchTerm]);

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
    <div className="udp-container">
      <div className="udp-card">
        {/* Card Top Header */}
        <div className="udp-card-header">
          <div className="udp-header-left">
            <div className="udp-header-icon">
              <i className="fas fa-sliders-h"></i>
            </div>
            <div>
              <h4 className="udp-card-title">Manage User Dynamic Pricing</h4>
              <p className="udp-card-subtitle">
                Configure custom hardware & profile pricing rules for specific client accounts
              </p>
            </div>
          </div>
          <div className="udp-header-badges">
            <span className="udp-badge-clients">
              <i className="fas fa-users"></i>
              {userList.length} Registered Clients
            </span>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="alert alert-danger m-3 mb-0 d-flex align-items-center" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Two-Column Workspace */}
        <div className="udp-layout">
          {/* Left Column: Client Directory */}
          <aside className="udp-users-sidebar">
            <div className="udp-sidebar-header">
              <div className="udp-sidebar-title-row">
                <span className="udp-sidebar-title">Client Directory</span>
                <span className="udp-count-pill">{filteredUsers.length}</span>
              </div>
              <div className="udp-search-wrapper">
                <i className="fas fa-search udp-search-icon"></i>
                <input
                  type="text"
                  className="udp-search-input"
                  placeholder="Search by name, phone, GST..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="udp-search-clear"
                    onClick={() => setSearchTerm("")}
                    title="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="udp-users-list">
              {listLoading ? (
                <div className="udp-spinner-center">
                  <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                  <span>Loading clients...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="udp-users-empty">
                  <i className="fas fa-user-slash"></i>
                  <span>No matching clients found</span>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = selectedUser?._id === user._id;
                  const initials = getInitials(user.name);
                  return (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`udp-user-item ${isActive ? "active" : ""}`}
                    >
                      <div className="udp-user-avatar">{initials}</div>
                      <div className="udp-user-info">
                        <h6 className="udp-user-name">{user.name}</h6>
                        {user.phoneNumber && (
                          <div className="udp-user-meta">
                            <i className="fas fa-phone-alt"></i>
                            <span>{user.phoneNumber}</span>
                          </div>
                        )}
                        {user.email && (
                          <div className="udp-user-meta">
                            <i className="far fa-envelope"></i>
                            <span>{user.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="udp-active-arrow">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Column: Dynamic Pricing Editor */}
          <main className="udp-pricing-panel">
            {selectedUser ? (
              <>
                {/* Client Overview Card Banner */}
                <div className="udp-client-banner">
                  <div className="udp-client-profile">
                    <div className="udp-client-avatar-lg">
                      {getInitials(selectedUser.name)}
                    </div>
                    <div className="udp-client-details">
                      <h4>{selectedUser.name}</h4>
                      <div className="udp-client-tags">
                        {selectedUser.gstNumber && (
                          <span className="udp-client-tag">
                            <i className="fas fa-file-invoice"></i>
                            GST: {selectedUser.gstNumber}
                          </span>
                        )}
                        {(selectedUser.city || selectedUser.state) && (
                          <span className="udp-client-tag">
                            <i className="fas fa-map-marker-alt"></i>
                            {[selectedUser.city, selectedUser.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {pricingLoading ? (
                      <div className="d-flex align-items-center text-muted small">
                        <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                        <span>Fetching rates...</span>
                      </div>
                    ) : (
                      <div className="udp-status-pill">
                        <span className="udp-status-dot"></span>
                        <span>Dynamic Rates Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 1: Hardware Pricing */}
                <PricingTable
                  title="Hardware Dynamic Pricing"
                  rows={hardwareRows}
                  onChange={(index, field, value) =>
                    handleRowChange("hardware", index, field, value)
                  }
                  onDeleteRow={(index) => handleDeleteRow("hardware", index)}
                  loading={updateLoading}
                />

                {/* Section 2: Profile Pricing */}
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

                {/* Save Changes Docked Bar */}
                <div className="udp-save-bar">
                  <div className="udp-save-info">
                    <i className="fas fa-shield-alt"></i>
                    <span>
                      Dynamic rates override standard catalogue pricing for <strong>{selectedUser.name}</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="udp-btn-save"
                    onClick={handleSave}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        <span>Save Dynamic Pricing</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="udp-no-selection">
                <div className="udp-no-selection-icon">
                  <i className="fas fa-user-edit"></i>
                </div>
                <h5 className="udp-no-selection-title">No Client Selected</h5>
                <p className="udp-no-selection-desc">
                  Select a client account from the directory on the left to view and configure custom dynamic pricing rates.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserListing;
