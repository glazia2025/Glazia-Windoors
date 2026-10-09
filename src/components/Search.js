import React, { useState, useEffect } from 'react';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import './Search.css';

const Search = ({ searchQuery, setSearchQuery, handleSearch }) => {
  const [localQuery, setLocalQuery] = useState('');

  useEffect(() => {
    setLocalQuery(searchQuery || '');
  }, [searchQuery]);

  const handleSubmit = (e) => {
    typeof e?.preventDefault === "function" && e?.preventDefault();
    handleSearch(localQuery);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    // Clear results if input is empty
    if (!value.trim() && typeof setSearchQuery === "function") {
      setSearchQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex input-group w-auto search-bar">
      <input
        type="search"
        className="form-control search-input"
        placeholder="Search SAP Code or Description"
        aria-label="Search products"
        value={localQuery}
        onChange={handleInputChange}
        autoComplete="off"
      />
      <MDBBtn 
        type="submit" 
        color="primary"
        disabled={!localQuery.trim()}
      >
        <MDBIcon fas icon="search" />
        <span className="ms-2">Search</span>
      </MDBBtn>
    </form>
  );
};

export default Search;