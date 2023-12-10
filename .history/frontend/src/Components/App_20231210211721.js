import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../../public/logo.svg';


function App() {
  const [bookTitle, setBookTitle] = useState('');
  const [authors, setAuthor] = useState([]);
  const [books, setBooks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [timer, setTimer] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/get_books_reccomandations', { book_title_precise: bookTitle });
      const arr_authors = [];
      const arr_books = [];
      for (const key in response.data.books_recomendded) {
        if (response.data.books_recomendded.hasOwnProperty(key)) {
          const value = response.data.books_recomendded[key];
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

  const _handleInputRequest = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/get_books_names', { book_title: bookTitle });
      const titles = response.data.books_titles;
      return titles;
    } catch (error) {
      handleRequestError(error);
    }
  };

  const handleChange = () => {
    // Clear the previous timer
    clearTimeout(timer);
    // Set a new timer for 300 milliseconds
    setTimer(
      setTimeout(() => {
        // Send the request to the backend with the latest input value
        _handleInputRequest().then(titles => setSuggestions(titles));
      }, 300)
    );
  };

  useEffect(() => {
    handleChange();
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
    <>
      <img src={logo} aria-hidden />
      <h1>Book Search</h1>
      <input type="text" id="customInput" class="custom-input text-color-black" onChange={(e) => setBookTitle(e.target.value)} placeholder="Book Title" />
      <button type="button" class="search-button" onClick={handleSearch}>Go</button>
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
    </>
  );
}

export default App;
