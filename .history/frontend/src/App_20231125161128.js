import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [bookTitle, setBookTitle] = useState('');
  const [books, setBooks] = useState([]);

  const handleSearch = async () => {
    try {
      // const response = await axios.post('http://127.0.0.1:5000/api/get_books_recommendations', { book_title_precise: bookTitle });
      // const response = await axios.post('http://127.0.0.1:5000/api/get_books_reccomandations', { book_title_precise: bookTitle }, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      console.log("console data: ", response.data)
      setBooks(response.data.books);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error from server:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from the server');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up the request:', error.message);
      }
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
