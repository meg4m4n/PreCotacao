import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import { Quotation } from './types';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('quotations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('quotations', JSON.stringify(quotations));
  }, [quotations]);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja eliminar esta pré-cotação?')) {
      setQuotations(quotations.filter(q => q.id !== id));
    }
  };

  const handleSave = (quotation: Omit<Quotation, 'id' | 'code' | 'date'>) => {
    const newQuotation: Quotation = {
      ...quotation,
      id: uuidv4(),
      code: generateQuotationCode(),
      date: new Date().toISOString(),
    };
    setQuotations([...quotations, newQuotation]);
  };

  const handleUpdate = (id: string, quotation: Omit<Quotation, 'id' | 'code' | 'date'>) => {
    setQuotations(quotations.map(q => 
      q.id === id 
        ? { ...quotation, id, code: q.code, date: q.date }
        : q
    ));
  };

  const generateQuotationCode = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const sequence = (quotations.length + 1).toString().padStart(3, '0');
    return `PC${year}${month}${sequence}`;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<QuotationList quotations={quotations} onDelete={handleDelete} />} 
        />
        <Route 
          path="/new" 
          element={<QuotationForm onSave={handleSave} />} 
        />
        <Route 
          path="/edit/:id" 
          element={<QuotationForm 
            quotation={quotations.find(q => q.id === window.location.pathname.split('/').pop())}
            onSave={(data) => {
              const id = window.location.pathname.split('/').pop()!;
              handleUpdate(id, data);
            }}
          />} 
        />
        <Route 
          path="/view/:id" 
          element={<QuotationForm 
            quotation={quotations.find(q => q.id === window.location.pathname.split('/').pop())}
            readOnly 
          />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;