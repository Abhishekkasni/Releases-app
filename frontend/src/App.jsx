import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReleaseList from "./pages/ReleaseList";
import ReleaseDetail from "./pages/ReleaseDetail";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <div className="cold-start-notice">
          ⚡ First load may take 30–60 seconds — the server spins down after
          inactivity.
        </div>
        <Routes>
          <Route path="/" element={<ReleaseList />} />
          <Route path="/releases/:id" element={<ReleaseDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
