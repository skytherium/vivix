import { Routes, Route } from 'react-router-dom';
import Register from '../pages/registration';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Top from "../pages/top";

function App() {
    return (
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/top" element={<Top/>} />
        </Routes>
    );
}

export default App; // Убедитесь, что здесь есть экспорт по умолчанию
