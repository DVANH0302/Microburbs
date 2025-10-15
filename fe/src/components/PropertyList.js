import React, { useState } from 'react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(price);
};

const PropertyList = ({ properties }) => {
  const [sortBy, setSortBy] = useState('price-asc');

  const sortProperties = (props) => {
    const sorted = [...props];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'bedrooms-desc':
        return sorted.sort((a, b) => (b.attributes.bedrooms || 0) - (a.attributes.bedrooms || 0));
      case 'date-new':
        return sorted.sort((a, b) => new Date(b.listing_date) - new Date(a.listing_date));
      default:
        return sorted;
    }
  };

  const sortedProperties = sortProperties(properties);

  return (
    <div className="property-list">
      <div className="list-header">
        <h2>Properties ({properties.length})</h2>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="bedrooms-desc">Most Bedrooms</option>
          <option value="date-new">Newest Listed</option>
        </select>
      </div>

      <div className="properties-scroll">
        {sortedProperties.map((property, index) => {
          const { street, sal, state } = property.address;
          const { bedrooms, bathrooms, garage_spaces, land_size, description } = property.attributes;
          
          return (
            <div key={index} className="property-card">
              <div className="card-header">
                <div className="price">{formatPrice(property.price)}</div>
                <div className="property-type">{property.property_type}</div>
              </div>
              
              <div className="card-address">
                <strong>{street}</strong>
                <div>{sal}, {state}</div>
              </div>
              
              <div className="card-details">
                {bedrooms && (
                  <div className="detail-item">
                    <span className="icon">🛏️</span>
                    <span>{bedrooms}</span>
                  </div>
                )}
                {bathrooms && (
                  <div className="detail-item">
                    <span className="icon">🚿</span>
                    <span>{bathrooms}</span>
                  </div>
                )}
                {garage_spaces && (
                  <div className="detail-item">
                    <span className="icon">🚗</span>
                    <span>{garage_spaces}</span>
                  </div>
                )}
                {land_size && (
                  <div className="detail-item">
                    <span className="icon">📏</span>
                    <span>{land_size}</span>
                  </div>
                )}
              </div>
              
              {description && (
                <div className="card-description">
                  {description.substring(0, 150)}...
                </div>
              )}
              
              <div className="card-footer">
                <span className="listing-date">
                  Listed: {new Date(property.listing_date).toLocaleDateString('en-AU')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyList;