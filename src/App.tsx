import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuotationList />} />
        <Route path="/new" element={<QuotationForm />} />
        <Route path="/edit/:id" element={<QuotationForm />} />
        <Route path="/view/:id" element={<QuotationForm readOnly />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;