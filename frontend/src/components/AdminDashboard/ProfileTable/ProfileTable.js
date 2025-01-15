import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBBtn
} from "mdb-react-ui-kit";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveOption, setActiveProfile } from "../../../redux/selectionSlice";
import api from '../../../utils/api';
import Search from '../../Search'; // import the Search component

const ProfileTable = ({ selectedProfiles, profileData, refreshProducts }) => {
  const dispatch = useDispatch();
  const { activeProfile, activeOption } = useSelector((state) => state.selection);
  const [profileOptions, setProfileOptions] = useState({});
  const [editingProductId, setEditingProductId] = useState(null);
  const [editableProduct, setEditableProduct] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const productsToDisplay = searchResults.length > 0
  ? searchResults
  : profileOptions[activeProfile]?.products[activeOption];

  useEffect(() => {
    setProfileOptions(profileData);
    if (!activeProfile && Object.keys(profileData).length > 0) {
      const firstProfile = Object.keys(profileData)[0];
      dispatch(setActiveProfile(firstProfile));
      dispatch(setActiveOption(profileData[firstProfile]?.options[0]));
    }
  }, [profileData]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('http://localhost:5000/api/admin/search-product', {
        params: { sapCode: searchQuery, description: searchQuery, profile: activeProfile, option: activeOption },
      });
      setSearchResults(response.data.products);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const searchProduct = (value) => {
    setSearchResults([]);
    setSearchQuery(value);
  }

  return (
    <>
      <MDBTabs className="mb-4">
        {Object.keys(profileOptions).map((profile) => (
          <MDBTabsItem key={profile}>
            <MDBTabsLink
              active={activeProfile === profile}
              onClick={() => {
                dispatch(setActiveProfile(profile));
                dispatch(setActiveOption(profileOptions[profile]?.options[0]));
              }}
            >
              {profile}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>
      <hr />
      {activeProfile && (
        <MDBTabs className="mb-4">
          {profileOptions[activeProfile]?.options.map((option) => (
            <MDBTabsItem key={option}>
              <MDBTabsLink
                active={activeOption === option}
                onClick={() => dispatch(setActiveOption(option))}
              >
                {option}
              </MDBTabsLink>
            </MDBTabsItem>
          ))}
        </MDBTabs>
      )}

      {activeOption && (
        <MDBCard className="mt-4">
          <MDBCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white p-3" style={{ top: "0", zIndex: 1 }}>
              <div className="d-flex align-items-center">
                <MDBTypography tag="h4" className="mb-0" style={{ marginRight: '20px' }}>
                  Products
                </MDBTypography>
              </div>
              <Search searchQuery={searchQuery} setSearchQuery={searchProduct} handleSearch={handleSearch} />
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>SAP Code</th>
                  <th>Part</th>
                  <th>Description</th>
                  <th>90 degree/ 45 degree</th>
                  <th>Rate</th>
                  <th>Per</th>
                  <th>Kg/m</th>
                  <th>Length</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsToDisplay.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.sapCode}</td>
                    <td>{product.part === '' ? 'N.A' : product.part}</td>
                    <td>{product.description === '' ? 'N.A' : product.description}</td>
                    <td>{product.degree}</td>
                    <td>{profileOptions[activeProfile].rate[activeOption]}</td>
                    <td>{product.per}</td>
                    <td>{product.kgm}</td>
                    <td>{product.length}</td>
                    <td className="d-flex">
                      <MDBBtn color="warning" size="sm">Edit</MDBBtn>
                      <MDBBtn color="danger" size="sm">Delete</MDBBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
};

export default ProfileTable;
