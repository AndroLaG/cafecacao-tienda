import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home         from './pages/Home';
import Auth         from './pages/Auth';
import Checkout     from './pages/Checkout';
import OrdenExitosa from './pages/OrdenExitosa';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/auth"         element={<Auth />} />
        <Route path="/checkout"     element={<Checkout />} />
        <Route path="/orden-exitosa" element={<OrdenExitosa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;