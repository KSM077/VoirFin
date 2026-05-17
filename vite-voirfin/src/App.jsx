import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth/AuthContainer';
import Dashboard from './pages/Dashboard/Dashboard';
import Navbar from './components/Navbar/Navbar';
import BudgetManage from './pages/BudgetManage/BudgetManage';
import Reports from './pages/Reports/Reports';

function App() {
  return (
    <Dashboard></Dashboard>
  );
}

export default App;