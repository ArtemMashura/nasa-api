import './App.css';
import { useRef, useState} from 'react'
import axios from 'axios'

function App() {
  const [data, setData] = useState([])
  const ref = useRef(null)

  return (
    <div className="App">
      <input ref={ref} id='name'></input>
      <button onClick={() => {
        var search = ref.current.value
        axios.get(`https://pixabay.com/api/?key=42728892-9cc4f7d0b5fde0edf075cd096&q=${search}&image_type=photo`)
        .then((res) => {
          console.log(res.data.hits)
          setData(res.data.hits);
        })
      }}>Search</button>
      <div>
        {data &&
          data.map((image, index) => (
            <img key={index} src={image.previewURL} alt='' width={100} />
          ))}
      </div>
    </div>
  );
}

export default App;
