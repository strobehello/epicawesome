import React, { useState, useEffect } from 'react';
import './TravelTracker.css';

const TravelTracker = () => {
  const [flightData, setFlightData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    // Real flight data for 5/6
    setTimeout(() => {
      setFlightData([
        {
          id: 'WN2229',
          airline: 'Southwest Airlines',
          aircraft: 'Boeing 737-800 (B738)',
          departure: {
            airport: 'OMA',
            city: 'Omaha, NE',
            time: '2025-06-05T20:50:00-05:00',
            gate: 'B19',
            actualTime: '2025-06-05T21:01:00-05:00',
            taxiTime: '11 minutes'
          },
          arrival: {
            airport: 'PHX',
            city: 'Phoenix, AZ',
            time: '2025-06-05T21:35:00-07:00',
            gate: 'C19',
            actualTime: '2025-06-05T21:37:00-07:00',
            taxiTime: '10 minutes'
          },
          seat: 'Unknown',
          status: 'COMPLETED',
          bookingRef: 'Unknown',
          cost: 'Unknown',
          purpose: 'Suspicious Activity',
          notes: 'Economy cabin - No meal service. Flight departed Eppley Airfield on time.',
          tailNumber: '[CLASSIFIED]'
        }
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'CONFIRMED': return 'status-confirmed';
      case 'SCHEDULED': return 'status-scheduled';
      case 'CANCELLED': return 'status-cancelled';
      case 'IN PROGRESS': return 'status-in-progress';
      default: return 'status-in-progress';
    }
  };

  const getIndicatorClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'indicator-completed';
      case 'CONFIRMED': return 'indicator-confirmed';
      case 'SCHEDULED': return 'indicator-scheduled';
      case 'CANCELLED': return 'indicator-cancelled';
      case 'IN PROGRESS': return 'indicator-in-progress';
      default: return 'indicator-in-progress';
    }
  };

  const calculateFlightDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-title">ACCESSING TRAVEL DATABASE</div>
          <div className="loading-bar">
            <div className="loading-progress" />
          </div>
          <div className="loading-text">
            Retrieving flight manifests...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="travel-tracker">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="title">
              ETHAN ELLSWORTH
            </div>
            <div className="subtitle">
              PASSENGER ID: EE-7749-CHUNGUS | FLIGHT RISK: HIGH
            </div>
          </div>
          <div className="header-right">
            <div className="status">
              TRAVEL MONITORING
            </div>
            <div className="timestamp">
              {new Date().toISOString().substring(0, 19)}Z
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#00ff41' }}>
            {flightData.length}
          </div>
          <div className="stat-label">TOTAL TRIPS</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ffa500' }}>
            MEDIUM
          </div>
          <div className="stat-label">RISK LEVEL</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#4aa3ff' }}>
            0 DAYS AGO
          </div>
          <div className="stat-label">LAST SEEN</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel Travel History */}
        <div className="left-panel">
          <div className="panel-header">
            TRAVEL ITINERARY
          </div>
          
          <div className="trips-list">
            {flightData.map((trip, index) => {
              const isVehicle = trip.type === 'VEHICLE';
              const depTime = formatDateTime(isVehicle ? trip.departure.time : trip.departure.time);
              const arrTime = formatDateTime(isVehicle ? trip.arrival.time : trip.arrival.time);
              
              return (
                <div 
                  key={index}
                  onClick={() => setSelectedFlight(trip)}
                  className={`trip-item ${selectedFlight === trip ? 'selected' : ''}`}
                >
                  <div className={`status-indicator ${getIndicatorClass(trip.status)}`} />
                  
                  {/* General travel info */}
                  <div className="trip-header">
                    <span className="trip-title">
                      {isVehicle ? `VEHICLE ${trip.id}` : `${trip.airline} ${trip.id}`}
                    </span>
                    <span className={`trip-status ${getStatusClass(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                  
                  {/* Location */}
                  <div className="trip-route">
                    <div className="location-info">
                      <div className="location-code">
                        {isVehicle ? trip.departure.location : trip.departure.airport}
                      </div>
                      <div className="location-city">
                        {isVehicle ? trip.departure.address : trip.departure.city}
                      </div>
                      <div className="location-time">
                        {depTime.date} {depTime.time}
                      </div>
                    </div>
                    
                    <div className="route-icon">
                      {isVehicle ? '🚗' : '✈️'}
                    </div>
                    
                    <div className="location-info">
                      <div className="location-code">
                        {isVehicle ? trip.arrival.location : trip.arrival.airport}
                      </div>
                      <div className="location-city">
                        {isVehicle ? trip.arrival.address : trip.arrival.city}
                      </div>
                      <div className="location-time">
                        {arrTime.date} {arrTime.time}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="trip-details">
                    <span>{isVehicle ? trip.vehicle : `Seat ${trip.seat}`}</span>
                    <span>
                      {isVehicle ? trip.distance : calculateFlightDuration(trip.departure.time, trip.arrival.time)}
                    </span>
                    <span>{trip.purpose}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel Travel Details */}
        <div className="right-panel">
          <div className="panel-header">
            TRIP DETAILS
          </div>
          
          {selectedFlight ? (
            <div className="details-content">
              {selectedFlight.type === 'VEHICLE' ? (
                // Vehicle Trip Details
                <>
                  <div className="detail-section">
                    <div className="detail-label">
                      VEHICLE
                    </div>
                    <div className="detail-value">
                      {selectedFlight.vehicle}
                    </div>
                    <div className="detail-secondary">
                      Trip {selectedFlight.id}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">
                      DEPARTURE
                    </div>
                    <div className="detail-highlight">
                      {selectedFlight.departure.location}
                    </div>
                    <div className="detail-secondary">
                      {selectedFlight.departure.address}
                    </div>
                    <div className="detail-secondary">
                      {formatDateTime(selectedFlight.departure.time).date} at {formatDateTime(selectedFlight.departure.time).time}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">
                      ARRIVAL
                    </div>
                    <div className="detail-highlight">
                      {selectedFlight.arrival.location}
                    </div>
                    <div className="detail-secondary">
                      {selectedFlight.arrival.address}
                    </div>
                    <div className="detail-secondary">
                      {formatDateTime(selectedFlight.arrival.time).date} at {formatDateTime(selectedFlight.arrival.time).time}
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">
                      DISTANCE
                    </div>
                    <div style={{ color: '#fff', fontSize: '12px' }}>
                      {selectedFlight.distance}
                    </div>
                  </div>
                </>
              ) : (
                // Flight Details
                <>
                  <div className="detail-section">
                    <div className="detail-label">
                      AIRCRAFT
                    </div>
                    <div className="detail-value">
                      {selectedFlight.aircraft}
                    </div>
                    <div className="detail-secondary">
                      Flight {selectedFlight.id}
                    </div>
                    {selectedFlight.tailNumber && (
                      <div className="detail-danger">
                        Tail: {selectedFlight.tailNumber}
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">
                      DEPARTURE
                    </div>
                    <div className="detail-highlight">
                      Gate {selectedFlight.departure.gate} • {selectedFlight.departure.airport}
                    </div>
                    <div className="detail-secondary">
                      Scheduled: {formatDateTime(selectedFlight.departure.time).date} at {formatDateTime(selectedFlight.departure.time).time}
                    </div>
                    {selectedFlight.departure.actualTime && (
                      <div className="detail-success">
                        Actual: {formatDateTime(selectedFlight.departure.actualTime).time}
                      </div>
                    )}
                    {selectedFlight.departure.taxiTime && (
                      <div className="detail-warning">
                        Taxi: {selectedFlight.departure.taxiTime}
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">
                      ARRIVAL
                    </div>
                    <div className="detail-highlight">
                      Gate {selectedFlight.arrival.gate} • {selectedFlight.arrival.airport}
                    </div>
                    <div className="detail-secondary">
                      Scheduled: {formatDateTime(selectedFlight.arrival.time).date} at {formatDateTime(selectedFlight.arrival.time).time}
                    </div>
                    {selectedFlight.arrival.actualTime && (
                      <div className="detail-success">
                        Actual: {formatDateTime(selectedFlight.arrival.actualTime).time}
                      </div>
                    )}
                    {selectedFlight.arrival.taxiTime && (
                      <div className="detail-warning">
                        Taxi: {selectedFlight.arrival.taxiTime}
                      </div>
                    )}
                  </div>

                  {selectedFlight.seat && selectedFlight.seat !== 'Unknown' && (
                    <div className="detail-section">
                      <div className="detail-label">
                        SEATING
                      </div>
                      <div style={{ color: '#fff', fontSize: '12px' }}>
                        Seat {selectedFlight.seat}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="detail-section">
                <div className="detail-label">
                  PURPOSE
                </div>
                <div style={{ color: '#ffa500', fontSize: '12px' }}>
                  {selectedFlight.purpose}
                </div>
              </div>

              {selectedFlight.notes && (
                <div className="notes-section">
                  <div className="notes-title">
                    INTELLIGENCE NOTES
                  </div>
                  <div className="notes-content">
                    {selectedFlight.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-details">
              Select a trip to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelTracker;