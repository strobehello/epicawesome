import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MessageBoard.css';

function MessageBoard() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/posts')
      .then(res => setMessages(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const safeUsername = (typeof username === 'string' && username.trim()) ? username.trim() : 'Ethan Ellsworth Enjoyer';

    if (!isValidImageUrl(imageUrl)) {
        alert('Please enter a valid image URL (jpg, jpeg, png, gif, mp4, webp).');
        return;
    }

    try {

      const newPost = { username: safeUsername, text, imageUrl };
      const res = await axios.post('http://localhost:5000/api/posts', newPost);
      setMessages([res.data, ...messages]);
      setUsername('');
      setText('');
      setImageUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  return React.createElement('div', { className: 'message-board' },
    React.createElement('h2', null, 'Message Board'),

    React.createElement('form', { onSubmit: handleSubmit, className: 'message-form' },
      React.createElement('input', {
        type: 'text',
        placeholder: 'User',
        value: username,
        onChange: (e) => setUsername(e.target.value),
        required: false
      }),
      React.createElement('textarea', {
        placeholder: 'Message',
        value: text,
        onChange: (e) => setText(e.target.value),
        required: true
      }),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Image URL (optional)',
        value: imageUrl,
        onChange: (e) => setImageUrl(e.target.value)
      }),
      React.createElement('button', { type: 'submit' }, 'Post')
    ),

    React.createElement('ul', { className: 'message-list' },
      messages.map((msg) =>
        React.createElement('li', { key: msg._id, className: 'message-item' },
          React.createElement('strong', null, msg.username + ': '),
          msg.text,
          msg.imageUrl && React.createElement('div', { className: 'message-image' },
            React.createElement('img', {
              src: msg.imageUrl,
              alt: 'attached'
            })
          ),
          React.createElement('div', { className: 'message-date' },
            new Date(msg.createdAt).toLocaleString()
          )
        )
      )
    )
  );
}

function isValidImageUrl(url) {
  if (!url) return true; // allow empty (optional field)

  try {
    new URL(url); // throws if invalid URL
  } catch {
    return false;
  }

  // Check for allowed extensions (add 'mp4' or 'gif' if you want)
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp'];
  const extension = url.split('.').pop().toLowerCase();

  return allowedExtensions.includes(extension);
}

export default MessageBoard;
