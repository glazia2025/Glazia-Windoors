import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { BASE_API_URL } from '../utils/api';

const ExcelUploader = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  const PRODUCT_CODE_COLUMN_INDEX = 4;

  const saveProductImages = async (data) => {
    try {
      const token = localStorage.getItem("authToken");
      setSaveStatus('saving');
      const response = await fetch(`${BASE_API_URL}/admin/save-product-images`, {
        method: 'POST',
        headers: {
          headers: { Authorization: `Bearer ${token}` },
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSaveStatus('success');
      return await response.json();
    } catch (error) {
      console.error('Error saving product images:', error);
      setSaveStatus('error');
      throw error;
    }
  };

  const processExcelFile = async (file) => {
    const workbook = new ExcelJS.Workbook();
    
    try {
      setLoading(true);
      await workbook.xlsx.load(await file.arrayBuffer());
      
      const worksheet = workbook.worksheets[0];
      const processedData = [];
      const productImageMapping = [];

      const imageMap = new Map();
      worksheet.getImages().forEach(image => {
        const imageId = image.imageId;
        const imageBuffer = workbook.getImage(imageId);
        // console.log("extension", imageBuffer.extension);
        const base64Image = `data:${imageBuffer.extension};base64,${imageBuffer.buffer.toString('base64')}`;
        imageMap.set(image.range.tl, base64Image);
      });

      worksheet.eachRow((row, rowNumber) => {
        // console.log("rownm", rowNumber)
        const rowData = {};
        // console.log("row.getCell(PRODUCT_CODE_COLUMN_INDEX + 1)", row.getCell(PRODUCT_CODE_COLUMN_INDEX + 1))
        let productCode = row.getCell(PRODUCT_CODE_COLUMN_INDEX + 1).value?.richText[0].text.toString() || '';
        let rowImage = null;
        
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getRow(1).getCell(colNumber);
          const header = headerCell.value ? headerCell.value.toString() : `Column ${colNumber}`;
          
          const imageInCell = Array.from(imageMap.entries()).find(
            ([pos]) => {
              return Math.trunc(pos.row) === rowNumber - 1 && Math.trunc(pos.col) === colNumber;
            }
          );

          // console.log("imageInCell", imageInCell)

          if (imageInCell) {
            rowImage = imageInCell[1];
            rowData[header] = {
              type: 'image',
              data: imageInCell[1]
            };
          } else {
            rowData[header] = {
              type: 'text',
              data: cell.value ? cell.value.toString() : ''
            };
          }
        });
        // console.log("productCode",productCode);
        // console.log("rowImage",rowImage);

        if (productCode && rowImage) {
          productImageMapping.push({
            productCode,
            image: rowImage
          });
        }

        processedData.push({
          id: rowNumber-1,
          timestamp: new Date().toISOString(),
          data: rowData
        });
      });

      setProductImages(productImageMapping);
      console.log("productImageMapping", productImageMapping)
      // Call API to save product images
      if (productImageMapping.length > 0) {
        try {
          await saveProductImages(productImageMapping.slice(0, 506));
        } catch (error) {
          setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toISOString(),
            error: `Error saving to API: ${error.message}`
          }, ...prev]);
        }
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      setLogs(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        error: `Error processing file: ${error.message}`
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSaveStatus('');
      setLogs(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        info: `Processing file: ${file.name}`
      }, ...prev]);
      
      processExcelFile(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            {loading ? 'Processing...' : 'Upload Excel file'}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
      </div>

      {/* Save Status Message */}
      {saveStatus && (
        <div className={`mb-4 p-4 rounded-lg ${
          saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
          saveStatus === 'success' ? 'bg-green-100 text-green-700' :
          saveStatus === 'error' ? 'bg-red-100 text-red-700' : ''
        }`}>
          {saveStatus === 'saving' && 'Saving product images...'}
          {saveStatus === 'success' && 'Product images saved successfully!'}
          {saveStatus === 'error' && 'Error saving product images'}
        </div>
      )}

      {/* Product Code - Image Mapping Section */}
      {productImages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Product Code - Image Mapping</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productImages.map((item, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow flex items-center">
                <div className="mr-4">
                  <div className="font-medium">Product Code:</div>
                  <div className="text-gray-600">{item.productCode}</div>
                </div>
                <img
                  src={item.image}
                  alt={`Product ${item.productCode}`}
                  className="max-w-24 max-h-24 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;