import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth/AuthContainer';
import Dashboard from './pages/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import BudgetManage from './pages/BudgetManage/BudgetManage';
import Reports from './pages/Reports/Reports';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import { useBanks } from './context/BankContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useBanks();

  if (loading) return <LoadingScreen message="Verificando sesión..." />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path='/login' element={<Auth />} />
      <Route element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/budgetmanage' element={<BudgetManage />} />
        <Route path='/reports' element={<Reports />}/>
      </Route>
    </Routes>
  );
}

export default App;