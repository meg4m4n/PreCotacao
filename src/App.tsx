import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import { useQuotations } from './hooks/useQuotations';

function App() {
  const { quotations, loading } = useQuotations();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuotationList />} />
        <Route path="/new" element={<QuotationForm />} />
        <Route 
          path="/edit/:id" 
          element={<QuotationForm />} 
        />
        <Route 
          path="/view/:id" 
          element={<QuotationForm readOnly />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;