import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Asset from "./components/Asset/Asset";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <Navbar/> */}
      <div className="row m-0 p-0">
        <div className="col-3 m-0 p-0 m-2">
          <Asset />
        </div>
        <div className="col-3 m-0 p-0 m-2">
          <Asset />
        </div>
        <div className="col-3 m-0 p-0 m-2">
          <Asset />
        </div>
        <div className="col-3 bg-warning"></div>
      </div>

      {/*
      <div className='bg-danger'>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>*/}
    </>
  );
}

export default App;
