import React from 'react';
import { MDBBtn, MDBIcon, MDBInput } from 'mdb-react-ui-kit';

const Search = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="d-flex input-group w-auto me-3">
      <input
        type="search"
        className="form-control"
        placeholder="Search Items"
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
