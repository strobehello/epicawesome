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
        
        console.log(info);

        setInfo(info);

        fetch('http://localhost:5000/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(info),
        })
        .then(res => res.json())
        .then(data => console.log('Posted visitor info:', data))
        .catch(err => console.error('failed:', err));
      })
      .catch(err => console.error('fetch error:', err));
  }, []);

  if (!info) return <p>Loading...</p>;

  return (
    <div>
      <h2>He is coming to kill you NOW</h2>
      <ul><strong>IP:</strong> {info.ip}</ul>
      <ul><strong>Country:</strong> {info.country}</ul>
      <ul><strong>Region:</strong> {info.region}</ul>
      <ul><strong>City:</strong> {info.city}</ul>
      <ul><strong>Latitude:</strong> {info.latitude}</ul>
      <ul><strong>Longitude:</strong> {info.longitude}</ul>
      <ul><strong>ISP:</strong> {info.isp}</ul>
      <ul><strong>Timezone:</strong> {info.timezone}</ul>
      <ul><strong>Browser:</strong> {info.browser}</ul>
      <h2>Low-key you are fucked</h2>
    </div>
  );
}

export default VisitorInfo;
