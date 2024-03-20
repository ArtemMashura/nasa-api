import './App.css';
import { useEffect, useRef, useState} from 'react'
import axios from 'axios'
let didInit = false

function App() {
  const [chosenFilter, setChosenFilter] = useState([])
  const [data, setData] = useState([])
  const [authors, setAuthors] = useState([])
  const ref = useRef(null)
  
  useEffect(() => {
    async function fetchBooks(bookmarks){
      let books = []
      // for (const element of bookmarks) { // Альтернатива тому что внизу, но медленее потому что это читает по очереди, а то что внизу читает в паралели
      //   const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${element}`)
      //   console.log(response.data)
      //   books.push(response.data)
      // } 
      await Promise.all(bookmarks.map(async (element) => {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${element}`)
        console.log(response.data)
        books.push(response.data)
      }))
      
      console.log(books)
      setData(books)
      return books
    }

    if (!didInit) {
      didInit = true
      var bookmarks = JSON.parse(localStorage.getItem("Bookmarks"))
      if (bookmarks === null){
        return
      }

      fetchBooks(bookmarks)

    }
    
  }, [data])
  
 
  const search = (req) => {
    if (search === "") {
      return
    }
    axios.get(`${req}`)
    .then((res) => {
      console.log(res.data.items)
      setData(res.data.items);
    })
  }
  
  const bookmarkBook = (id) => {
    var bookmarks = JSON.parse(localStorage.getItem("Bookmarks"))
    if (bookmarks === null){
      bookmarks = []
    }
    
    console.log(bookmarks)
    var indexOfBookmark = bookmarks.indexOf(id)
    if (indexOfBookmark === -1) {
      bookmarks.push(id)
      console.log("Bookmark added")
    }
    else {
      bookmarks.splice(indexOfBookmark, 1)
      console.log("Bookmark removed")
    }
    localStorage.setItem("Bookmarks", JSON.stringify(bookmarks))

  }

  return (
    
    <div className="App">
      <input ref={ref} id='name'></input>
      <button onClick={() => {
        setChosenFilter("relevancy")
        search(`https://www.googleapis.com/books/v1/volumes?q=${ref.current.value}`)
      }}>Search</button>

      <div className='booksContainer'>

        <button disabled={chosenFilter=== "newest"} onClick={() => {
          setChosenFilter("newest")
          search(`https://www.googleapis.com/books/v1/volumes?q=${ref.current.value}&orderBy=newest`)
        }}>Самое новое</button>

        <button disabled={chosenFilter=== "oldest"} onClick={() => {  // в апи из опций только по релевантности (дефолтная опция) и самое новое, поэтому такой ужас внизу
          setChosenFilter("oldest")
          var search = ref.current.value
          axios.get(`https://www.googleapis.com/books/v1/volumes?q=${search}`)
          .then((res) => {
            var maxItems = res.data.totalItems
            axios.get(`https://www.googleapis.com/books/v1/volumes?q=${search}&orderBy=newest&startIndex=${maxItems - 10}`)
            .then((res) => {
              setData(res.data.items);
            })
          })
        }}>Самое старое</button>

        <button disabled={chosenFilter=== "relevancy"} onClick={() => {
          setChosenFilter("relevancy")
          search(`https://www.googleapis.com/books/v1/volumes?q=${ref.current.value}`)
        }}>Самое популярное</button>

      
        <div className='books'>
          {data &&
            data.map((book, index) => (
              <div key={index} className='book'>
                <div className='header'>
                  <div>
                    <div>{book.volumeInfo.title}</div>
                    <div className='author' onClick={() => {
                      axios.get(`https://www.googleapis.com/books/v1/volumes?q=${book.volumeInfo.authors}`)
                      .then((res) => {
                        console.log(res.data.items)
                        setAuthors(res.data.items);
                      })
                    }}>{book.volumeInfo.authors}</div>
                    <div>{book.volumeInfo.publishedDate}</div>
                  </div>
                  <img className='bookmark' alt='' onClick={() => bookmarkBook(book.id)} src='https://static.vecteezy.com/system/resources/thumbnails/005/200/965/small/bookmark-black-color-icon-vector.jpg'></img>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className='booksContainer'>
        <div className='books'>
          {authors &&
            authors.map((book, index) => (
              <div key={index} className='book'>
                <div className='header'>
                  <div>
                    <div>{book.volumeInfo.title}</div>
                    <div className='author'>{book.volumeInfo.authors}</div>
                    <div>{book.volumeInfo.publishedDate}</div>
                  </div>
                  <img className='bookmark' alt='' onClick={() => bookmarkBook(book.id)} src='https://static.vecteezy.com/system/resources/thumbnails/005/200/965/small/bookmark-black-color-icon-vector.jpg'></img>
                </div>
              </div>
            ))}
        </div>
      </div>
      
    </div>
  );
}

export default App;
