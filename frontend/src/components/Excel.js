import React, { useState } from "react";
import * as XLSX from "xlsx";
import api, { BASE_API_URL } from "../utils/api";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/common";
import "./Excel.css";

const ExcelDataFetcher = () => {
  const [data, setData] = useState([]);
  const [convertedData, setConvertedData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState("HANDLES");

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setData(jsonData);
        convertToSchema(jsonData, filterCategory);
      } catch (err) {
        console.error("Error parsing excel:", err);
        toast.error("Could not parse Excel file. Please ensure it has valid columns.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const convertToSchema = (jsonData, cat) => {
    let formattedData = jsonData.map((item) => ({
      id: item["S.No"] || 0,
      sapCode: item["PRODUCT CODE"] || "",
      perticular: item["PERTICULAR"] || "",
      subCategory: item["SUB-CATEGORY"] || "",
      rate: Number(String(item["NET RATE"]).split("/")[0]) || 0,
      system: item["SYSTEM"] || "",
      moq: item["MOQ in PCS"] ? item["MOQ in PCS"].toString() : "0",
      image: "",
    }));

    if (cat && cat !== "ALL") {
      formattedData = formattedData.filter((d) => d.subCategory?.toUpperCase() === cat.toUpperCase());
    }

    setConvertedData(formattedData);
  };

  const handleCategoryChange = (cat) => {
    setFilterCategory(cat);
    if (data.length > 0) {
      convertToSchema(data, cat);
    }
  };

  const addAllProducts = async () => {
    if (!convertedData || convertedData.length === 0) {
      toast.error("No product rows to import");
      return;
    }

    setImporting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await api.post(
        `${BASE_API_URL}/admin/add-all`,
        convertedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success(`Successfully imported ${convertedData.length} products to catalog!`);
        setImportSuccess(true);
      }
    } catch (error) {
      console.error("Error adding products:", error);
      toast.error("Failed to import products. Please check authorization.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="excel-mgmt-container">
      <div className="excel-card">
        {/* Header */}
        <div className="excel-card-header">
          <div className="excel-header-left">
            <div className="excel-header-icon">
              <i className="fas fa-file-excel"></i>
            </div>
            <div>
              <h4 className="excel-card-title">Add Products via Excel</h4>
              <p className="excel-card-subtitle">
                Bulk upload and import hardware and profile inventory worksheets (.xlsx, .xls)
              </p>
            </div>
          </div>
        </div>

        <div className="excel-card-body">
          {/* Drag & Drop Upload Box */}
          <div
            className={`excel-upload-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <input
              type="file"
              className="excel-file-hidden"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
            <div className="excel-upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="excel-upload-title">
              {fileName ? "Change Excel Spreadsheet" : "Drag and drop your Excel worksheet here"}
            </div>
            <div className="excel-upload-desc">
              Supports standard product catalog sheets (.xlsx, .xls) with S.No, Product Code, Particular, Net Rate
            </div>
            <button type="button" className="excel-browse-btn">
              <i className="fas fa-folder-open"></i>
              <span>Browse File</span>
            </button>
          </div>

          {/* File Selected Banner */}
          {fileName && (
            <div className="excel-selected-banner mt-4">
              <div className="excel-selected-left">
                <div className="excel-selected-icon">
                  <i className="fas fa-file-excel"></i>
                </div>
                <div>
                  <div className="excel-selected-name">{fileName}</div>
                  <div className="excel-selected-meta">
                    Size: {fileSize} • {data.length} total rows parsed
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted fw-bold">Filter Sub-Category:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "160px" }}
                    value={filterCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="HANDLES">HANDLES only</option>
                    <option value="ALL">ALL Categories</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="excel-btn-import"
                  onClick={addAllProducts}
                  disabled={importing || convertedData.length === 0}
                >
                  {importing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Importing to Catalog...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-file-import"></i>
                      <span>Import {convertedData.length} Products</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {importSuccess && (
            <div className="alert alert-success d-flex align-items-center gap-2 mt-3" role="alert">
              <i className="fas fa-check-circle fs-5"></i>
              <div>
                <strong>Import Complete!</strong> All {convertedData.length} product specifications have been saved to the Glazia catalog.
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {convertedData.length > 0 && (
            <div className="excel-stats-strip mt-4">
              <div className="excel-stat-card">
                <div className="excel-stat-label">Total Rows in Sheet</div>
                <div className="excel-stat-val">{data.length}</div>
              </div>
              <div className="excel-stat-card">
                <div className="excel-stat-label">Mapped for Import</div>
                <div className="excel-stat-val" style={{ color: "#059669" }}>
                  {convertedData.length}
                </div>
              </div>
              <div className="excel-stat-card">
                <div className="excel-stat-label">Active Filter</div>
                <div className="excel-stat-val" style={{ fontSize: "16px", color: "#2563eb" }}>
                  {filterCategory}
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {convertedData.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold text-dark mb-0">Preview Converted Products (First 20 items):</h6>
                <span className="small text-muted">Showing min(20, {convertedData.length}) items</span>
              </div>
              <div className="excel-table-wrapper">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th style={{ width: "6%" }}>S.No</th>
                      <th style={{ width: "16%" }}>Product Code</th>
                      <th style={{ width: "34%" }}>Particulars / Description</th>
                      <th style={{ width: "14%" }}>Sub-Category</th>
                      <th style={{ width: "12%" }}>Rate</th>
                      <th style={{ width: "10%" }}>System</th>
                      <th style={{ width: "8%" }}>MOQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convertedData.slice(0, 20).map((prod, idx) => (
                      <tr key={idx}>
                        <td>{prod.id || idx + 1}</td>
                        <td>
                          <span className="user-gst-badge">{prod.sapCode || "-"}</span>
                        </td>
                        <td className="fw-semibold text-dark">{prod.perticular || "-"}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{prod.subCategory}</span>
                        </td>
                        <td className="fw-bold text-success">{formatPrice(prod.rate)}</td>
                        <td>{prod.system || "-"}</td>
                        <td>{prod.moq} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelDataFetcher;
