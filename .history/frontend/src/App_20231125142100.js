import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [bookTitle, setBookTitle] = useState('');
  const [books, setBooks] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/get_books_recommendations', { book_title: bookTitle });
      console.log()
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching book info:', error);
    }
  };

  return (
    <div>
      <h1>Book Search</h1>
      <label>Book Title: </label>
      <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
      <button onClick={handleSearch}>Search</button>

      <h2>Matching Books:</h2>
      <ul>
        {books.map((book, index) => (
          <li key={index}>{book}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
