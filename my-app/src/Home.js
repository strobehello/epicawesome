import ethanjpg from './ethan.jpg';
import VisitorInfo from './VisitorInfo';
import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={ethanjpg} className="ethan-logo" alt="logo" />
        <p>Ethan Ellsworth</p>
        <nav>
            <Link to="/gallery" style={{ color: 'green', textDecoration: 'none' }}>The Ellsworth Gallery</Link>
        </nav>
        <VisitorInfo />
      </header>
    </div>
  );
}

export default Home;
