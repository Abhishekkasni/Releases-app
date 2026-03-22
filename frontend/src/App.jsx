import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ReleaseList from './pages/ReleaseList'
import ReleaseDetail from './pages/ReleaseDetail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<ReleaseList />} />
          <Route path="/releases/:id" element={<ReleaseDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}