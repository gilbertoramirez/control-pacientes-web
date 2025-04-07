import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';

const FacturasDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { facturacionService, patientService, doctorService } = useApi();
  
  interface Invoice {
    id: string;
    patientId: string;
    doctorId?: string;
    number: string;
    date: string;
    dueDate: string;
    paymentDate?: string;
    paymentMethod?: string;
    taxRate: number;
    taxAmount: number;
    notes?: string;
    total: number;
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue';
    items: {
      id?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
      amount: number;
    }[];
    subtotal: number;
  }
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID de factura no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch invoice data
        const invoiceData = await facturacionService.getInvoiceById(id);
        setInvoice(invoiceData);
        
        // Fetch patient data
        const patientData = await patientService.getPatientById(invoiceData.patientId);
        setPatientName(`${patientData.name} ${patientData.lastName}`);
        
        // Fetch doctor data if available
        if (invoiceData.doctorId) {
          const doctorData = await doctorService.getDoctorById(invoiceData.doctorId);
          setDoctorName(`${doctorData.name} ${doctorData.lastName}`);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching invoice data:', err);
        setError('Error al cargar los datos de la factura. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, facturacionService, patientService, doctorService]);

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    
    if (window.confirm('¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.')) {
      try {
        await facturacionService.deleteInvoice(invoice.id);
        navigate('/facturas');
      } catch (err) {
        console.error('Error deleting invoice:', err);
        setError('Error al eliminar la factura. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    
    try {
      await facturacionService.markAsPaid(invoice.id, paymentMethod, paymentDate);
      
      // Refresh invoice data
      const updatedInvoice = await facturacionService.getInvoiceById(invoice.id);
      setInvoice(updatedInvoice);
      
      // Close modal
      setShowPaymentModal(false);
      setError(null);
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError('Error al marcar la factura como pagada. Por favor, inténtelo de nuevo.');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
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

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Atención</p>
          <p>No se encontró la factura solicitada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="print:hidden mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Factura {invoice.number}
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/facturas')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Volver
            </button>
            <button
              onClick={handlePrintInvoice}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
            >
              Imprimir
            </button>
            {invoice.status === 'pending' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
              >
                Marcar como Pagada
              </button>
            )}
            <button
              onClick={() => navigate(`/facturas/${invoice.id}/editar`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
            >
              Editar
            </button>
            <button
              onClick={handleDeleteInvoice}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
            >
              Eliminar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden print:shadow-none">
          <div className="p-6">
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">FACTURA</h2>
                <div className="text-gray-600"># {invoice.number}</div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <div className="text-sm font-medium text-gray-500 mb-1">Estado</div>
                <div>{getStatusBadge(invoice.status)}</div>
              </div>
            </div>

            {/* Invoice Dates and Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Emisión</h3>
                <div className="text-gray-900">{formatDate(invoice.date)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Vencimiento</h3>
                <div className="text-gray-900">{formatDate(invoice.dueDate)}</div>
              </div>
              {invoice.status === 'paid' && invoice.paymentDate && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Pago</h3>
                    <div className="text-gray-900">{formatDate(invoice.paymentDate)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Método de Pago</h3>
                    <div className="text-gray-900">
                      {invoice.paymentMethod === 'cash' && 'Efectivo'}
                      {invoice.paymentMethod === 'credit_card' && 'Tarjeta de Crédito'}
                      {invoice.paymentMethod === 'debit_card' && 'Tarjeta de Débito'}
                      {invoice.paymentMethod === 'bank_transfer' && 'Transferencia Bancaria'}
                      {invoice.paymentMethod === 'check' && 'Cheque'}
                      {!invoice.paymentMethod && 'No especificado'}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Client and Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Paciente</h3>
                <div className="text-gray-900">{patientName}</div>
              </div>
              {doctorName && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Doctor</h3>
                  <div className="text-gray-900">{doctorName}</div>
                </div>
              )}
            </div>

            {/* Invoice Items */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conceptos</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Unitario
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Impuesto ({invoice.taxRate}%):
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.taxAmount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total:</span>
                      <span className="text-base font-bold text-gray-900">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notas</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Marcar como Pagada</h3>
                <div className="mt-2 px-7 py-3">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentMethod">
                      Método de Pago
                    </label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Seleccionar Método de Pago</option>
                      <option value="cash">Efectivo</option>
                      <option value="credit_card">Tarjeta de Crédito</option>
                      <option value="debit_card">Tarjeta de Débito</option>
                      <option value="bank_transfer">Transferencia Bancaria</option>
                      <option value="check">Cheque</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentDate">
                      Fecha de Pago
                    </label>
                    <input
                      type="date"
                      id="paymentDate"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-2">
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={!paymentMethod}
                    className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacturasDetail; 