import ethanjpg from './ethan.jpg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={ethanjpg} className="ethan-logo" alt="logo" />
        <p>
          Ethan Ellsworth
        </p>
      </header>
    </div>
  );
}

export default App;
