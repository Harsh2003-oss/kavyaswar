import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import CreatePoem from './components/Poem/CreatePoem';
import EditPoem from './components/Poem/EditPoem';
import ViewPoem from './components/Poem/ViewPoem';
import Slideshow from './components/Slideshow/Slideshow';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-poem" element={<CreatePoem />} />
            <Route path="/edit-poem/:id" element={<EditPoem />} />
            <Route path="/poem/:id" element={<ViewPoem />} />
            <Route path="/slideshow/:id" element={<Slideshow />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;