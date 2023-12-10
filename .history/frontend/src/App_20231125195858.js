import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [bookTitle, setBookTitle] = useState('');
  const [authors, setAuthor] = useState([]);
  const [books, setBooks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/get_books_reccomandations', { book_title_precise: bookTitle });
      const arr_authors = [];
      const arr_books = [];
      for (const key in response.data.books_returned) {
        if (response.data.books_returned.hasOwnProperty(key)) {
          const value = response.data.books_returned[key];
          arr_books.push(key);
          arr_authors.push(value);
        }
      }

      setBooks(arr_books);
      setAuthor(arr_authors);
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleInput = (value) => {
    setBookTitle(value);
    if (bookTitle === "") return;
    // handleInputRequest();
  };

  const handleInputRequest = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/get_books_names', { books_title: bookTitle });
      const titles = response.data.books_titles;
      setSuggestions(titles);
    } catch (error) {
      handleRequestError(error);
    }
  };

  useEffect(() => {
    if (bookTitle === "")
      setSuggestions([]);
    handleInputRequest();
  }, [bookTitle]);
  

  const handleRequestError = (error) => {
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
  };

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
