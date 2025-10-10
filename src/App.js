
import Login from './pages/Auth';
import Docs from './pages/Docs';
import Footer from './component/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import About from './pages/about';
import Navbar from './component/Navbar';
function App() {
  return (
    
    <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
    <Footer />

    </BrowserRouter>
  );
}

export default App;