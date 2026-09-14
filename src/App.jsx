import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home           from './pages/Home';
import Auth           from './pages/Auth';
import Checkout       from './pages/Checkout';
import OrdenExitosa   from './pages/OrdenExitosa';
import MisPedidos     from './pages/MisPedidos';
import Admin          from './pages/Admin';
import Perfil         from './pages/Perfil';
import Terminos       from './pages/Terminos';
import Reclamaciones  from './pages/Reclamaciones';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Home />}          />
        <Route path="/auth"           element={<Auth />}          />
        <Route path="/checkout"       element={<Checkout />}      />
        <Route path="/orden-exitosa"  element={<OrdenExitosa />}  />
        <Route path="/mis-pedidos"    element={<MisPedidos />}    />
        <Route path="/admin"          element={<Admin />}         />
        <Route path="/perfil"         element={<Perfil />}        />
        <Route path="/terminos"       element={<Terminos />}      />
        <Route path="/reclamaciones"  element={<Reclamaciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;