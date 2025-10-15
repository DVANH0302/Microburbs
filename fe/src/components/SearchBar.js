import React, { useState } from 'react';

const SearchBar = ({ onSearch, initialValue }) => {
  const [suburb, setSuburb] = useState(initialValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suburb.trim()) {
      onSearch(suburb.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={suburb}
        onChange={(e) => setSuburb(e.target.value)}
        placeholder="Enter suburb name (e.g., Belmont North)"
        className="search-input"
      />
      <button type="submit" className="search-button">
        🔍 Search
      </button>
    </form>
  );
};

export default SearchBar;