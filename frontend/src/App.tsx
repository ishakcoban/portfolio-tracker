import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Asset from "./components/Asset/Asset";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import clsx from "clsx/lite";
import Dashboard from "./pages/Dashboard/Dashboard";
function App() {

  const [diff, setDiff] = useState(12);
  const [value, setValue] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setValue(prev => prev + 35155.19);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Dashboard/>

  
      {/* {
       
          <div className="text-light fs-1 bg-warning asdasd">
            <span className="bg-danger">€</span>
            <NumberFlow
          
   
              format={{
                notation: "standard",

                signDisplay: "never",
                
              }}
              spinTiming={{ duration: 1500, easing: "ease" }}
              value={value}
              
            />
          </div>
      
     
      } */}
      {/*
        <NumberFlowGroup>
          <div
            // style={{ '--number-flow-char-height': '0.85em' }}
            className="flex items-center gap-4 font-semibold text-light memen"
          >
            <NumberFlow
              value={value}
              locales="en-US"
              format={{ style: "currency", currency: "USD" }}
              className="~text-2xl/4xl"
            />
            <NumberFlow
              value={diff}
              locales="en-US"
              format={{
                style: "percent",
                maximumFractionDigits: 2,
                signDisplay: "never",
              }}
              className={clsx(
                "~text-lg/2xl transition-colors duration-300",
                diff < 0 ? "text-red-500" : "text-emerald-500"
              )}
            />
          </div>
        </NumberFlowGroup>*/
      }
      {/* <button
        onClick={() => {
          setValue(value + 35155.19);
          setDiff(diff + 1.7);
        }}
      >
        click
      </button> */}


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
