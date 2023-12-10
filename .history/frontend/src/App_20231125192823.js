import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [bookTitle, setBookTitle] = useState('');
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/get_books_reccomandations', { book_title_precise: bookTitle });
      const arrAuthors = [];
      const arrBooks = [];
      for (const key in response.data.books_returned) {
        if (response.data.books_returned.hasOwnProperty(key)) {
          const value = response.data.books_returned[key];
          arrBooks.push(key);
          arrAuthors.push(value);
        }
      }

      setBooks(arrBooks);
      setAuthors(arrAuthors);
      console.log("books returned", arrBooks);

    } catch (error) {
      handleError(error);
    }
  };

  const handleInput = (value) => {
    setBookTitle(value);
    if (value === "") {
      setSuggestions([]);
      return;
    }
    handleInputRequest();
  };

  const handleInputRequest = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/get_books_names', { books_title: bookTitle });
      const titles = response.data.books_titles;
      setSuggestions(titles);

    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      console.error('Error from server:', error.response.data);
    } else if (error.request) {
      console.error('No response received from the server');
    } else {
      console.error('Error setting up the request:', error.message);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => handleInputRequest(), 300); // Debounce the API call
    return () => clearTimeout(timeoutId);
  }, [bookTitle]);

  return (
    <div>
      <h1>Book Search</h1>
      <label>Book Title: </label>
      <input type="text" value={bookTitle} onChange={(e) => handleInput(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
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
