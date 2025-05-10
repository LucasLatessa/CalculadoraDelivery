import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Logs from "./components/logs";
import Login from "./components/login";
import SignUp from "./components/signUp";
import Home from "./components/home";
import Calculadora from "./components/calculadora";
import PriceSettingsModal from "./components/PriceSettingsModal";

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculator" element={<Calculadora />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/precios" element={<PriceSettingsModal />} />
      </Routes>
    </Router>
  );
}

export default Main;
