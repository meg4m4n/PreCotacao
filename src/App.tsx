import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import QuotationList from './QuotationList';
import QuotationForm from './QuotationForm';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import { useQuotations } from './hooks/useQuotations';
import { useClients } from './hooks/useClients';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const { quotations, loading: quotationsLoading } = useQuotations();
  const { clients, loading: clientsLoading } = useClients();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (quotationsLoading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Quotation Routes */}
        <Route path="/" element={<QuotationList />} />
        <Route path="/new" element={<QuotationForm clients={clients} />} />
        <Route 
          path="/edit/:id" 
          element={
            <QuotationForm 
              clients={clients}
              quotation={quotations.find(q => q.id === window.location.pathname.split('/')[2])}
            />
          }
        />
        <Route 
          path="/view/:id" 
          element={
            <QuotationForm 
              clients={clients}
              quotation={quotations.find(q => q.id === window.location.pathname.split('/')[2])}
              readOnly
            />
          }
        />

        {/* Client Routes */}
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route 
          path="/clients/edit/:id" 
          element={
            <ClientForm 
              client={clients.find(c => c.id === window.location.pathname.split('/')[3])}
            />
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;