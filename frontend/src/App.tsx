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
      setValue((prev) => prev + 35155.19);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <Navbar />
      <Dashboard />
    </>
  );
}

export default App;
