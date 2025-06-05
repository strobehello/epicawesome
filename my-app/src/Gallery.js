import { Link } from 'react-router-dom';
import image1 from './ethan.jpg';
import './Gallery.css';

function Gallery() {
  const images = [image1];

  return (
    <div className="Gallery">
        <header className='Gallery-header'>
            <h2>Gallery Page</h2>
            <div className="gallery-grid">
                {images.map((img, idx) => (
                <img key={idx} src={img} alt={`Gallery ${idx + 1}`} />
                ))}
            </div>
            <nav>
                <Link to="/" style={{ color: 'green', textDecoration: 'none' }}>Home</Link>
            </nav>
        </header>
    </div>
  );
}

export default Gallery;
