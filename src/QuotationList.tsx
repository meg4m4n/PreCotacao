import React from 'react';
import { Plus, FileText, Pencil, Trash2, LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuotations } from './hooks/useQuotations';
import { useAuth } from './hooks/useAuth';
import { useAdmin } from './hooks/useAdmin';

export default function QuotationList() {
  const { quotations, loading, deleteQuotation } = useQuotations();
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja eliminar esta pré-cotação?')) {
      try {
        await deleteQuotation(id);
      } catch (error) {
        console.error('Error deleting quotation:', error);
        alert('Erro ao eliminar a pré-cotação');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Lomartex, Lda</h1>
            <h2 className="text-xl text-gray-600">Gestão de Pré-Cotações</h2>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Users size={16} />
                Manage Users
              </Link>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <Link
            to="/new"
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus size={16} /> Nova Pré-Cotação
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nossa Ref.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ref. Cliente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quotation.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quotation.date).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.client.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.client.ourRef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quotation.client.clientRef}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/view/${quotation.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver"
                      >
                        <FileText size={16} />
                      </Link>
                      <Link
                        to={`/edit/${quotation.id}`}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(quotation.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma pré-cotação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}