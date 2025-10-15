import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons based on price ranges
const createCustomIcon = (price) => {
  let color = '#3388ff'; // default blue
  
  if (price < 700000) {
    color = '#28a745'; // green - affordable
  } else if (price < 1000000) {
    color = '#ffc107'; // yellow - moderate
  } else if (price < 1500000) {
    color = '#fd7e14'; // orange - expensive
  } else {
    color = '#dc3545'; // red - luxury
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(price);
};

const PropertyMap = ({ properties }) => {
  // Calculate center of all properties
  const getCenter = () => {
    if (properties.length === 0) return [-33.0165, 151.6715]; // Default Belmont North
    
    const avgLat = properties.reduce((sum, p) => sum + p.coordinates.latitude, 0) / properties.length;
    const avgLng = properties.reduce((sum, p) => sum + p.coordinates.longitude, 0) / properties.length;
    
    return [avgLat, avgLng];
  };

  return (
    <div className="map-container">
      <div className="map-legend">
        <h3>Price Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#28a745'}}></span>
            <span>Under $700K</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#ffc107'}}></span>
            <span>$700K - $1M</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#fd7e14'}}></span>
            <span>$1M - $1.5M</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#dc3545'}}></span>
            <span>Over $1.5M</span>
          </div>
        </div>
      </div>
      
      <MapContainer
        center={getCenter()}
        zoom={14}
        style={{ height: '100%', width: '100%', borderRadius: '10px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((property, index) => {
          const { latitude, longitude } = property.coordinates;
          const { street, sal, state } = property.address;
          const { bedrooms, bathrooms, garage_spaces, land_size } = property.attributes;
          
          return (
            <Marker
              key={index}
              position={[latitude, longitude]}
              icon={createCustomIcon(property.price)}
            >
              <Popup>
                <div className="popup-content">
                  <h3 className="popup-price">{formatPrice(property.price)}</h3>
                  <p className="popup-address">
                    <strong>{street}</strong><br />
                    {sal}, {state}
                  </p>
                  <div className="popup-details">
                    {bedrooms && <span>🛏️ {bedrooms} bed</span>}
                    {bathrooms && <span>🚿 {bathrooms} bath</span>}
                    {garage_spaces && <span>🚗 {garage_spaces} car</span>}
                  </div>
                  {land_size && (
                    <p className="popup-land">📏 Land: {land_size}</p>
                  )}
                  <p className="popup-type">{property.property_type}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;