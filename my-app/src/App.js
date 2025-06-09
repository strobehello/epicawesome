import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Gallery from './Gallery';
import MessageBoard from './MessageBoard';
import TravelTracker from './TravelTracker';
import WordCloud from './WordCloud';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/messageboard" element={<MessageBoard />} />
        <Route path='/travel' element={<TravelTracker />} />
        <Route path="/wordcloud" element={<WordCloud />} />
      </Routes>
    </Router>
  );
}

export default App;
