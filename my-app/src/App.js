import ethanjpg from './ethan.jpg';
import VisitorInfo from './VisitorInfo.js'; 
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={ethanjpg} className="ethan-logo" alt="logo" />
        <p>
          Ethan Ellsworth
        </p>

        <VisitorInfo />
      </header>
    </div>
  );
}

export default App;
