import ethanjpg from './ethan.jpg';
import VisitorInfo from './VisitorInfo.js';
import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={ethanjpg} className="ethan-logo" alt="logo" />
        <p>Ethan Ellsworth</p>
        <nav>
            <ul><Link to="/gallery" style={{ color: 'green', textDecoration: 'none' }}>The Ellsworth Gallery</Link></ul>
            <ul><Link to="/messageboard" style={{ color: 'green', textDecoration: 'none' }}>The Ellsworth Messageboard</Link></ul>
            <ul><Link to="/travel" style={{ color: 'green', textDecoration: 'none' }}>The Ellsworth Travels</Link></ul>
        </nav>
        <VisitorInfo />
      </header>
    </div>
  );
}

export default Home;
