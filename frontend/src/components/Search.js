import React from 'react';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import './Search.css';

const Search = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="d-flex input-group w-auto search-bar">
      <input
        type="search"
        className="form-control search-input"
        placeholder="Search Sap Code or Description"
        aria-label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <MDBBtn color="primary">
        <MDBIcon fas icon="search" />&nbsp;
        Search
      </MDBBtn>
    </form>
  );
};

export default Search;
