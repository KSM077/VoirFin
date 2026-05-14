import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth/AuthContainer';
import Dashboard from './pages/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import BudgetManage from './pages/BudgetManage/BudgetManage';
import Reports from './pages/Reports/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path='/login' element={<Auth />} />
      <Route element={<Navbar />}>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/budgetmanage' element={<BudgetManage />} />
        <Route path='/reports' element={<Reports />}/>
      </Route>
    </Routes>
  );
}

export default App;