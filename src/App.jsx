import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Planos from './pages/Planos'
import Assinaturas from './pages/Assinaturas'
import CheckIn from './pages/CheckIn'
import Profissionais from './pages/Profissionais'
import Comissoes from './pages/Comissoes'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <BrowserRouter basename="/clube-assinaturas">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/assinaturas" element={<Assinaturas />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/comissoes" element={<Comissoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
