import React from 'react';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';

const TechSheet = ({ sheetData }) => {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <MDBTable>
        <MDBTableHead dark>
          <tr>
            <th scope='col'>Specification - </th>
            <th scope='col'>Max Shutter Height (mm)</th>
            <th scope='col'>Max Shutter Width (mm)</th>
            <th scope='col'>Locking Mechanism</th>
            <th scope='col'>Glass Size, mm</th>
            <th scope='col'>Alloy</th>
            <th scope='col'>Interlock (mm)</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          <tr>
            <th scope='row'>Feasibility -</th>
            <td>{sheetData?.shutterHeight ?? ''}</td>
            <td>{sheetData?.shutterWidth ?? ''}</td>
            <td>{sheetData?.lockingMechanism ?? ''}</td>
            <td>{sheetData?.glassSize ?? ''}</td>
            <td>{sheetData?.alloy ?? ''}</td>
            <td>{sheetData?.interlock ?? ''}</td>
          </tr>
        </MDBTableBody>
      </MDBTable>
    </div>
  );
};

export default TechSheet;
