import { Launches } from "./components/Launches/Launches";
import { Landpads } from "./components/Landpads/Landpads";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>SpaceX Data</h1>
      <Launches />
      <hr style={{ margin: '40px 0' }} />
      <Landpads />
    </div>
  );
}

export default App;
