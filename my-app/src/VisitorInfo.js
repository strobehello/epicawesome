import React, { useEffect, useState } from 'react';

function VisitorInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            const info = {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                isp: data.org,
                timezone: data.timezone,
                latitude: data.latitude,
                longitude: data.longitude,
                browser: navigator.userAgent,
            };

            setInfo(info);

            fetch('http://localhost:5000/api/visitors', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(info)
            }).catch(err => console.error('Failed to send to DB:', err));
        }).catch(err => console.error('Fetch error:', err));
    }, []);

    if (!info) return <p>Loading visitor info...</p>;

  return (
    <div>
      <h2>He is coming to kill you NOW:</h2>
      <ul>IP: {info.ip}</ul>
      <ul>Country: {info.country}</ul>
      <ul>Region: {info.region}</ul>
      <ul>City: {info.city}</ul>
      <ul>Latitude: {info.latitude}</ul>
      <ul>Longitude: {info.longitude}</ul>
      <ul>ISP: {info.isp}</ul>
      <ul>Timezone: {info.timezone}</ul>
      <ul>Browser: {info.browser}</ul>
      <h2>Low-key you are fucked</h2>
    </div>
  );
}

export default VisitorInfo;