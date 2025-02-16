import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useAdmin } from './hooks/useAdmin';
import { AuthForm } from './components/AuthForm';
import { AdminPanel } from './components/AdminPanel';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';

function App() {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuotationList />} />
        <Route path="/new" element={<QuotationForm />} />
        <Route path="/edit/:id" element={<QuotationForm />} />
        <Route path="/view/:id" element={<QuotationForm readOnly />} />
        {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App