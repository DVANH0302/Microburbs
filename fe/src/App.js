import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyMap from './components/PropertyMap';
import PropertyList from './components/PropertyList';
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const suburb = 'Belmont North';

  const fetchProperties = async (suburbName) => {
    setLoading(true);
    setError(null);
    try {
      // Use backend server URL. If you run frontend with a proxy, change to '/api/properties'
      const response = await axios.get('http://localhost:5000/api/properties', {
        params: { suburb: suburbName }
      });
      let data = response.data;

      // If server returned the body as a string, try parsing it.
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          setError('Invalid response format');
          setProperties([]);
          setLoading(false);
          return;
        }
      }

      // Ensure we have an array of results
      const results = (data && Array.isArray(data.results)) ? data.results : [];

      // Helper to normalize each property item to avoid crashes in components
      const normalize = (p) => {
        const address = p.address || {};
        const attributes = p.attributes || {};

        // Convert string markers to null (defensive). Only convert when explicit string values used.
        const normalizeVal = (v) => {
          if (typeof v === 'string' && ['nan', 'none', 'null', ''].includes(v.trim().toLowerCase())) return null;
          return v;
        };

        const coords = p.coordinates || { latitude: null, longitude: null };

        return {
          ...p,
          address: {
            sa1: address.sa1 || null,
            sal: address.sal || null,
            state: address.state || null,
            street: address.street || null,
          },
          attributes: {
            bathrooms: normalizeVal(attributes.bathrooms) ?? null,
            bedrooms: normalizeVal(attributes.bedrooms) ?? null,
            building_size: normalizeVal(attributes.building_size) ?? null,
            description: normalizeVal(attributes.description) ?? null,
            garage_spaces: normalizeVal(attributes.garage_spaces) ?? null,
            land_size: normalizeVal(attributes.land_size) ?? null,
          },
          coordinates: {
            latitude: coords.latitude ?? null,
            longitude: coords.longitude ?? null,
          },
          price: p.price ?? null,
          property_type: p.property_type ?? null,
          listing_date: p.listing_date ?? null,
        };
      };

      const normalized = results.map(normalize);

      if (normalized.length > 0) {
        setProperties(normalized);
      } else {
        setError('No properties found');
        setProperties([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to fetch properties');
      }
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(suburb);
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏠 Property Map Finder</h1>
        <p>Showing properties for <strong>Belmont North</strong></p>
      </header>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="content-wrapper">
          <div className="map-section">
            <PropertyMap properties={properties} />
          </div>
          <div className="list-section">
            <PropertyList properties={properties} />
          </div>
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="no-results">
          <p>No properties found for "Belmont North"</p>
        </div>
      )}
    </div>
  );
}

export default App;