import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Invoice } from '../services/facturacionService';

const FacturasList: React.FC = () => {
  const { facturacionService, patientService } = useApi();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [patientMap, setPatientMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all invoices
        const invoicesData = await facturacionService.getAllInvoices();
        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData);
        
        // Fetch patients to display names
        const patients = await patientService.getAllPatients();
        const patientMapping: Record<string, string> = {};
        patients.forEach(patient => {
          patientMapping[patient.id] = `${patient.name} ${patient.lastName}`;
        });
        setPatientMap(patientMapping);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices data:', err);
        setError('Error al cargar las facturas. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facturacionService, patientService]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredInvoices(invoices);
    } else {
      setFilteredInvoices(invoices.filter(invoice => invoice.status === filter));
    }
  }, [filter, invoices]);

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.')) {
      try {
        await facturacionService.deleteInvoice(id);
        // Update the invoices list after deletion
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      } catch (err) {
        console.error('Error deleting invoice:', err);
        setError('Error al eliminar la factura. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusClasses = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'overdue': 'bg-orange-100 text-orange-800'
    };
    
    const statusText = {
      'draft': 'Borrador',
      'pending': 'Pendiente',
      'paid': 'Pagada',
      'cancelled': 'Cancelada',
      'overdue': 'Vencida'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Facturas</h1>
        <Link 
          to="/facturas/nueva"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
        >
          Nueva Factura
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-md ${filter === 'paid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pagadas
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-md ${filter === 'overdue' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Vencidas
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-md ${filter === 'draft' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Borradores
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-md ${filter === 'cancelled' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Canceladas
          </button>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas {filter !== 'all' ? `con estado "${filter}"` : ''}</h3>
          <p className="mt-1 text-sm text-gray-500">Comience creando una nueva factura.</p>
          <div className="mt-6">
            <Link
              to="/facturas/nueva"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nueva Factura
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nº Factura
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patientMap[invoice.patientId] || 'Paciente desconocido'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                      <div className="text-xs text-gray-500">Vence: {formatDate(invoice.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link to={`/facturas/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Ver
                        </Link>
                        <Link to={`/facturas/${invoice.id}/editar`} className="text-blue-600 hover:text-blue-900">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacturasList; 