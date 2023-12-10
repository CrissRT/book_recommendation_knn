from flask import Flask, jsonify, request
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins='http://localhost:3000')
# cors = CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Define global variables
user_rating_pivot = None
model_knn = None
rating_with_totalRatingCount = None
combine_book_rating = None

def setup():
    global user_rating_pivot, model_knn, rating_with_totalRatingCount, combine_book_rating
    books_filename = '../data/BX-Books.csv'
    ratings_filename = '../data/BX-Book-Ratings.csv'

    # import csv data into dataframes
    df_books = pd.read_csv(
        books_filename,
        encoding = "ISO-8859-1",
        sep=";",
        header=0,
        names=['isbn', 'title', 'author'],
        usecols=['isbn', 'title', 'author'],
        dtype={'isbn': 'str', 'title': 'str', 'author': 'str'})

    df_ratings = pd.read_csv(
        ratings_filename,
        encoding = "ISO-8859-1",
        sep=";",
        header=0,
        names=['user', 'isbn', 'rating'],
        usecols=['user', 'isbn', 'rating'],
        dtype={'user': 'int32', 'isbn': 'str', 'rating': 'float32'})

    # Filter users with at least 200 ratings
    user_ratings_counts = df_ratings['user'].value_counts()
    df_ratings = df_ratings[df_ratings['user'].isin(user_ratings_counts[user_ratings_counts >= 200].index)]

    # Filter books with at least 100 ratings
    valid_books = df_ratings['rating'].value_counts()
    df_ratings = df_ratings[df_ratings['rating'].isin(valid_books[valid_books >= 100].index)]
    # You now have a DataFrame filtered ratings that contains only the ratings from users with at least 200 ratings and books with at least 100 ratings.

    combine_book_rating = pd.merge(df_ratings, df_books, on='isbn')

    combine_book_rating = combine_book_rating.dropna(axis = 0, subset = ['title'])

    combine_book_rating.head()

    book_ratingCount = (combine_book_rating.
        groupby(by = ['title'])['rating'].
        count().
        reset_index().
        rename(columns = {'rating': 'totalRatingCount'})
        [['title', 'totalRatingCount']]
        )

    rating_with_totalRatingCount = combine_book_rating.merge(book_ratingCount, left_on = 'title', right_on = 'title', how = 'left')

    combine_book_rating = combine_book_rating.drop_duplicates(['user', 'title'])
    user_rating_pivot = combine_book_rating.pivot(index = 'title', columns = 'user', values = 'rating').fillna(0)
    user_rating_matrix = csr_matrix(user_rating_pivot.values)

    model_knn = NearestNeighbors(metric = 'cosine', algorithm = 'brute')
    model_knn.fit(user_rating_matrix)

# send back the results to the frontend of full qualified name of the book
@app.route('/api/get_books_reccomandations', methods=['POST'])
def get_books_reccomandations():
    # data = request.get_json()
    # print("data: " + data + "\n\n")
    # book_title = data.get('book_title', '')
    # return jsonify({"books": _get_recommends(book_title)})
    return jsonify({"book_names": "auf"})

# @app.route('/api/get_books_names', methods=['POST'])
# def get_books_names():
#     data = request.form['book_title']
#     # print(data)
#     # book_title = data.get('book_title', '')
#     # return jsonify({"book_names": _get_right_book_name(book_title)})
#     return jsonify({"book_names": "auf"})
@app.route('/api/get_books_names', methods=['POST'])
def get_books_names():
    data = request.request.args()
    # book_title = data.get('book_title', '')
    return jsonify({"book_names":"auf"})

    

def _get_recommends(target_book_title="", neighbors=6):
    global user_rating_pivot, model_knn, combine_book_rating
    recommended_books = {}

    # Find the index of the specified book title in your dataset
    query_index = user_rating_pivot.index.get_loc(target_book_title)

    # Use the index to find the k-nearest neighbors
    distances, indices = model_knn.kneighbors(user_rating_pivot.iloc[query_index, :].values.reshape(1, -1), n_neighbors=neighbors)

    for i in range(1, len(distances.flatten())):
        recommended_book_title = user_rating_pivot.index[indices.flatten()[i]]
        recommended_book_author = combine_book_rating.loc[combine_book_rating['title'] == recommended_book_title, 'author'].iloc[0]
        recommended_books[recommended_book_title] = recommended_book_author
    return recommended_books
        

def _get_right_book_name(book_title):
    # Define the pattern you want to search for
    global rating_with_totalRatingCount
    pattern = book_title

    # Use str.contains() to search for the pattern in the specified column
    result = rating_with_totalRatingCount['title'].str.contains(pattern, case=False)

    # Extract indexes where the value is True
    true_indexes = result[result].index
    match_books = set()
    # Display the DataFrame rows that match the pattern
    for index in true_indexes:
        match_books.add(rating_with_totalRatingCount['title'][index])
    return list(match_books)[:10]



if __name__ == '__main__':
    setup()
    app.run(debug=True)

