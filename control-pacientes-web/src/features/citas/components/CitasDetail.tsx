import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Appointment } from '../../../infrastructure/api/AppointmentService';
import { Patient } from '../../pacientes/services/PatientService';

const CitasDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appointmentService, patientService } = useApi();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointment data
        const appointmentData = await appointmentService.getAppointmentById(id);
        setAppointment(appointmentData);
        
        // Fetch patient data
        const patientData = await patientService.getPatientById(appointmentData.patientId);
        setPatient(patientData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError('Error al cargar los datos de la cita. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, appointmentService, patientService]);

  const handleDeleteAppointment = async () => {
    if (!appointment) return;
    
    if (window.confirm('¿Está seguro de que desea eliminar esta cita? Esta acción no se puede deshacer.')) {
      try {
        await appointmentService.deleteAppointment(appointment.id);
        navigate('/citas');
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Error al eliminar la cita. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
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

  if (!appointment || !patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Información no disponible</p>
          <p>No se pudieron cargar los datos de la cita solicitada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Detalle de la Cita</h1>
          <div className="flex space-x-2">
            <Link 
              to={`/citas/${id}/editar`}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
            >
              Editar
            </Link>
            <button 
              onClick={() => navigate('/citas')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
            >
              Volver
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-200">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-semibold text-gray-700">
                  Cita para {patient.name} {patient.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  {new Date(appointment.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })} a las {appointment.time}
                </p>
              </div>
              <span 
                className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClass(appointment.status)}`}
              >
                {getStatusText(appointment.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Información de la Cita</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha:</label>
                    <p className="text-gray-800">{new Date(appointment.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Hora:</label>
                    <p className="text-gray-800">{appointment.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Motivo:</label>
                    <p className="text-gray-800">{appointment.reason}</p>
                  </div>
                  {appointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Notas adicionales:</label>
                      <p className="text-gray-800 whitespace-pre-line">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Información del Paciente</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre completo:</label>
                    <p className="text-gray-800">{patient.name} {patient.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Documento ID:</label>
                    <p className="text-gray-800">{patient.documentId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Teléfono:</label>
                    <p className="text-gray-800">{patient.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email:</label>
                    <p className="text-gray-800">{patient.email}</p>
                  </div>
                  <div>
                    <Link 
                      to={`/pacientes/${patient.id}`}
                      className="text-blue-500 hover:text-blue-700 font-medium inline-flex items-center"
                    >
                      Ver perfil completo del paciente
                      <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={handleDeleteAppointment}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
              >
                Eliminar Cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitasDetail; 