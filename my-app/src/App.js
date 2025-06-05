// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Gallery from './Gallery';
import MessageBoard from './MessageBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/messageboard" element={<MessageBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
