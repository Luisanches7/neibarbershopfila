import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueueProvider } from './contexts/QueueContext';
import CustomerRegistration from './components/CustomerRegistration';
import QueueDisplay from './components/QueueDisplay';
import AdminPanel from './components/AdminPanel';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';

function App() {
  return (
    <QueueProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<QueueDisplay />} />
              <Route path="/register" element={<CustomerRegistration />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueueProvider>
  );
}

export default App;