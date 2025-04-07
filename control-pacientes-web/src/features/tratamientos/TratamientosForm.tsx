import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../infrastructure/api/ApiProvider';
import { Treatment } from '../tratamientos/services/TreatmentService';
import { Patient } from '../pacientes/services/PatientService';

const TratamientosForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { treatmentService, patientService } = useApi();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    patientId: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    price: number;
    notes: string;
  }>({
    patientId: '',
    name: '',
    description: '',
    status: 'planned',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    price: 0,
    notes: '',
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all patients
        const patientsData = await patientService.getAllPatients();
        setPatients(patientsData);
        
        // If in edit mode, fetch treatment data
        if (isEditMode && id) {
          const treatmentData = await treatmentService.getTreatmentById(id);
          setFormData({
            patientId: treatmentData.patientId,
            name: treatmentData.name,
            description: treatmentData.description || '',
            status: treatmentData.status,
            startDate: new Date(treatmentData.startDate).toISOString().split('T')[0],
            endDate: treatmentData.endDate ? new Date(treatmentData.endDate).toISOString().split('T')[0] : '',
            price: treatmentData.price || 0,
            notes: treatmentData.notes || '',
          });
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
  }, [id, isEditMode, treatmentService, patientService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const treatmentData: Partial<Treatment> = {
        patientId: formData.patientId,
        name: formData.name,
        description: formData.description,
        status: formData.status as "planned" | "active" | "completed" | "cancelled" | undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        price: formData.price,
        notes: formData.notes,
      };
      
      if (isEditMode && id) {
        await treatmentService.updateTreatment(id, treatmentData);
      } else {
        await treatmentService.createTreatment(treatmentData);
      }
      
      navigate('/tratamientos');
    } catch (err) {
      console.error('Error saving treatment:', err);
      setError('Error al guardar el tratamiento. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  if (loading && !isEditMode) {
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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
          </h1>
          <button 
            onClick={() => navigate('/tratamientos')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
          >
            Cancelar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente *
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccione un paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} {patient.lastName} - {patient.documentId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Tratamiento *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="planned">Planificado</option>
                  <option value="active">Activo</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (USD)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  disabled={loading}
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/tratamientos')}
                disabled={loading}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

export default TratamientosForm; 