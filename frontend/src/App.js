import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Logs from "./components/logs";
import Home from "./components/home";
import Recorrido from "./components/recorrido";

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recorrido" element={<Recorrido />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default Main;
