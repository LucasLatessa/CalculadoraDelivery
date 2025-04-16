import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Logs from "./components/logs";
import Home from "./components/home";

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default Main;
