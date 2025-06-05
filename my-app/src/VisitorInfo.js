import React, { useEffect, useState } from 'react';

function VisitorInfo() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/') 
      .then(res => res.json())
      .then(data => {
        setInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          isp: data.org,
          timezone: data.timezone,
          browser: navigator.userAgent,
        });
      })
      .catch(err => {
        console.error('Error fetching visitor info:', err);
      });
  }, []);

  if (!info) return <p>Loading visitor info...</p>;

  return (
    <div>
      <h2>He is coming to kill you:</h2>
        <ul>IP: {info.ip}</ul>
        <ul>City: {info.city}</ul>
        <ul>Region: {info.region}</ul>
        <ul>Country: {info.country}</ul>
        <ul>ISP: {info.isp}</ul>
        <ul>Timezone: {info.timezone}</ul>
        <ul>Browser: {info.browser}</ul>
      <h2>Low-key you are fucked</h2>
    </div>
  );
}

export default VisitorInfo;