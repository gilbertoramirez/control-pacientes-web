import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../../../infrastructure/api/AppointmentService';
import { Patient } from '../../pacientes/services/PatientService';

interface CitasFormProps {
  isEditMode?: boolean;
  patientId?: string;
}

const CitasForm: React.FC<CitasFormProps> = ({ isEditMode = false, patientId: propPatientId }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { appointmentService, patientService } = useApi();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentDto>({
    patientId: propPatientId || '',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patients for the dropdown
        const patientsData = await patientService.getAllPatients();
        setPatients(patientsData);
        
        // If we're in edit mode, fetch the appointment details
        if (isEditMode && id) {
          const appointmentData = await appointmentService.getAppointmentById(id);
          setFormData({
            patientId: appointmentData.patientId,
            date: appointmentData.date.split('T')[0], // Format date for input
            time: appointmentData.time,
            reason: appointmentData.reason,
            status: appointmentData.status,
            notes: appointmentData.notes || ''
          });
        } else if (propPatientId) {
          // If a patientId is provided as a prop (coming from patient detail page)
          setFormData(prevData => ({
            ...prevData,
            patientId: propPatientId
          }));
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
  }, [id, isEditMode, appointmentService, patientService, propPatientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode && id) {
        const updateData: UpdateAppointmentDto = {
          id,
          ...formData
        };
        await appointmentService.updateAppointment(updateData);
        navigate(`/citas/${id}`);
      } else {
        const newAppointment = await appointmentService.createAppointment(formData);
        navigate(`/citas/${newAppointment.id}`);
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Error al guardar la cita. Por favor, inténtelo de nuevo.');
      setLoading(false);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.name} ${patient.lastName}` : 'Paciente no encontrado';
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Editar Cita' : 'Nueva Cita'}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientId">
                  Paciente
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  disabled={!!propPatientId}
                >
                  <option value="">Seleccionar paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} {patient.lastName} - {patient.documentId}
                    </option>
                  ))}
                </select>
                {propPatientId && (
                  <p className="mt-1 text-sm text-gray-500">
                    Paciente seleccionado: {getPatientName(propPatientId)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                  Fecha
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
                  Hora
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
                  Motivo de la cita
                </label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="scheduled">Programada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              )}

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                  Notas adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(propPatientId ? `/pacientes/${propPatientId}` : '/citas')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CitasForm; 