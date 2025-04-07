import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Invoice, InvoiceItem } from '../services/facturacionService';

const FacturasForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { facturacionService, patientService, doctorService, appointmentService, treatmentService } = useApi();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>([]);
  const [appointments, setAppointments] = useState<Array<{ id: string; date: string; patientId: string }>>([]);
  const [treatments, setTreatments] = useState<Array<{ id: string; name: string; cost: number; patientId: string }>>([]);
  
  const [formData, setFormData] = useState<{
    patientId: string;
    doctorId: string;
    number: string;
    date: string;
    dueDate: string;
    status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue';
    items: {
      id?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      treatmentId?: string;
      appointmentId?: string;
    }[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes: string;
    paymentMethod: string;
    paymentDate: string;
  }>({
    patientId: '',
    doctorId: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }
    ],
    subtotal: 0,
    taxRate: 16, // Default tax rate in Mexico
    taxAmount: 0,
    total: 0,
    notes: '',
    paymentMethod: '',
    paymentDate: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patients
        const patientsData = await patientService.getAllPatients();
        setPatients(patientsData.map(patient => ({
          id: patient.id,
          name: `${patient.name} ${patient.lastName}`
        })));
        
        // Fetch doctors
        const doctorsData = await doctorService.getAllDoctors();
        setDoctors(doctorsData.map(doctor => ({
          id: doctor.id,
          name: `${doctor.name} ${doctor.lastName}`
        })));
        
        // Fetch appointments
        const appointmentsData = await appointmentService.getAllAppointments();
        setAppointments(appointmentsData);
        
        // Fetch treatments
        const treatmentsData = await treatmentService.getAllTreatments();
        setTreatments(treatmentsData.map(treatment => ({
          id: treatment.id,
          name: treatment.name,
          cost: treatment.price || 0,
          patientId: treatment.patientId
        })));
        
        if (isEditMode && id) {
          const invoiceData = await facturacionService.getInvoiceById(id);
          setFormData({
            patientId: invoiceData.patientId,
            doctorId: invoiceData.doctorId || '',
            number: invoiceData.number,
            date: invoiceData.date.split('T')[0],
            dueDate: invoiceData.dueDate.split('T')[0],
            status: invoiceData.status,
            items: invoiceData.items,
            subtotal: invoiceData.subtotal,
            taxRate: invoiceData.taxRate,
            taxAmount: invoiceData.taxAmount,
            total: invoiceData.total,
            notes: invoiceData.notes || '',
            paymentMethod: invoiceData.paymentMethod || '',
            paymentDate: invoiceData.paymentDate ? invoiceData.paymentDate.split('T')[0] : ''
          });
        } else {
          // Generate invoice number
          const newInvoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
          setFormData(prev => ({ ...prev, number: newInvoiceNumber }));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, patientService, doctorService, appointmentService, treatmentService, facturacionService]);

  // Filter appointments and treatments when patient changes
  useEffect(() => {
    if (formData.patientId) {
      // If patient changed, we need to clear doctor, appointments and treatments related to items
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => ({
          ...item,
          appointmentId: undefined,
          treatmentId: undefined
        }))
      }));
    }
  }, [formData.patientId]);

  // Recalculate totals when items or tax rate changes
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  }, [formData.items, formData.taxRate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const updatedItems = [...formData.items];
    
    if (name === 'quantity' || name === 'unitPrice') {
      const quantity = name === 'quantity' ? parseFloat(value) : updatedItems[index].quantity;
      const unitPrice = name === 'unitPrice' ? parseFloat(value) : updatedItems[index].unitPrice;
      
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: parseFloat(value),
        amount: quantity * unitPrice
      };
    } else if (name === 'treatmentId' && value) {
      const treatment = treatments.find(t => t.id === value);
      if (treatment) {
        updatedItems[index] = {
          ...updatedItems[index],
          treatmentId: value,
          description: `Tratamiento: ${treatment.name}`,
          unitPrice: treatment.cost,
          amount: treatment.cost * updatedItems[index].quantity
        };
      }
    } else if (name === 'appointmentId' && value) {
      const appointment = appointments.find(a => a.id === value);
      if (appointment) {
        updatedItems[index] = {
          ...updatedItems[index],
          appointmentId: value,
          description: `Consulta: ${new Date(appointment.date).toLocaleDateString()}`,
          unitPrice: 500, // Default consultation price
          amount: 500 * updatedItems[index].quantity
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value
      };
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = [...formData.items];
      updatedItems.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const invoiceData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId || undefined,
        number: formData.number,
        date: formData.date,
        dueDate: formData.dueDate,
        status: formData.status,
        items: formData.items,
        subtotal: formData.subtotal,
        taxRate: formData.taxRate,
        taxAmount: formData.taxAmount,
        total: formData.total,
        notes: formData.notes || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        paymentDate: formData.paymentDate || undefined
      };
      
      if (isEditMode && id) {
        await facturacionService.updateInvoice(id, invoiceData);
      } else {
        await facturacionService.createInvoice(invoiceData);
      }
      
      navigate('/facturas');
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Error al guardar la factura. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Editar Factura' : 'Nueva Factura'}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="number">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientId">
                  Paciente *
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar Paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="doctorId">
                  Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccionar Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                  Estado *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="overdue">Vencida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dueDate">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conceptos</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Unitario
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importe
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-2">
                            <input
                              type="text"
                              name="description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, e)}
                              placeholder="Descripción"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {formData.patientId && (
                              <div className="flex space-x-2">
                                <select
                                  name="treatmentId"
                                  value={item.treatmentId || ''}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                  <option value="">Seleccionar Tratamiento</option>
                                  {treatments
                                    .filter(t => t.patientId === formData.patientId)
                                    .map(treatment => (
                                      <option key={treatment.id} value={treatment.id}>{treatment.name}</option>
                                    ))
                                  }
                                </select>
                                <select
                                  name="appointmentId"
                                  value={item.appointmentId || ''}
                                  onChange={(e) => handleItemChange(index, e)}
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                  <option value="">Seleccionar Consulta</option>
                                  {appointments
                                    .filter(a => a.patientId === formData.patientId)
                                    .map(appointment => (
                                      <option key={appointment.id} value={appointment.id}>
                                        {new Date(appointment.date).toLocaleDateString()}
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            min="1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            name="unitPrice"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, e)}
                            min="0"
                            step="0.01"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN'
                            }).format(item.amount)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                            disabled={formData.items.length <= 1}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Agregar Concepto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                  Notas
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Notas o condiciones adicionales de la factura"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="taxRate">
                  Tasa de Impuesto (%) *
                </label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {formData.status === 'paid' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentMethod">
                      Método de Pago
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="paymentDate">
                      Fecha de Pago
                    </label>
                    <input
                      type="date"
                      id="paymentDate"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      }).format(formData.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Impuesto ({formData.taxRate}%):</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN'
                      }).format(formData.taxAmount)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total:</span>
                      <span className="text-base font-bold text-gray-900">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN'
                        }).format(formData.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/facturas')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacturasForm; 