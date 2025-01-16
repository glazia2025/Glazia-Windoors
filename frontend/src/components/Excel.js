import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../utils/api';

const ExcelDataFetcher = () => {
  const [data, setData] = useState([]);
  const [convertedData, setConvertedData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
      convertToSchema(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const convertToSchema = (jsonData) => {
    let formattedData = jsonData.map(item => ({
      id: item["S.No"] || 0,
      sapCode: item["PRODUCT CODE"] || '',
      perticular: item["PERTICULAR"] || '',
      subCategory: item["SUB-CATEGORY"] || '',
      rate: Number(String(item["NET RATE"]).split('/')[0]) || 0,
      system: item["SYSTEM"] || '',
      moq: item["MOQ in PCS"] ? item["MOQ in PCS"].toString() : '0',
      image: '' // Placeholder for image
    }));
    // setConvertedData(formattedData);

    console.log("formattedData", formattedData);
    formattedData = formattedData.filter((data) => data.subCategory === 'HANDLES');

    addAllProducts(formattedData);
  };

  const addAllProducts = async (formattedData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.post(
        "http://localhost:5000/api/admin/add-all",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        console.log('Product added successfully');
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Excel Data Fetcher</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <h3>Original Data:</h3>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      <h3>Converted Data (Schema Format):</h3>
      <pre>{JSON.stringify(convertedData, null, 2)}</pre>
    </div>
  );
};

export default ExcelDataFetcher;
