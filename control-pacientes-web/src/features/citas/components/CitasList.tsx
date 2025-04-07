import React, { useEffect, useState } from 'react';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Appointment } from '../../../infrastructure/api/AppointmentService';
import { Link } from 'react-router-dom';
import { Patient } from '../../pacientes/services/PatientService';

const CitasList: React.FC = () => {
  const { appointmentService, patientService } = useApi();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Cargar todas las citas
        const appointmentsData = await appointmentService.getAllAppointments();
        setAppointments(appointmentsData);

        // Cargar todos los pacientes para mostrar sus nombres
        const patientsData = await patientService.getAllPatients();
        const patientsMap: Record<string, Patient> = {};
        patientsData.forEach(patient => {
          patientsMap[patient.id] = patient;
        });
        setPatients(patientsMap);

        setError(null);
      } catch (err) {
        console.error('Error fetching appointments data:', err);
        setError('Error al cargar las citas. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentService, patientService]);

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta cita? Esta acción no se puede deshacer.')) {
      try {
        await appointmentService.deleteAppointment(id);
        setAppointments(appointments.filter(appointment => appointment.id !== id));
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Error al eliminar la cita. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Citas Médicas</h1>
        <Link 
          to="/citas/nueva" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
        >
          Nueva Cita
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No hay citas registradas. Comience creando una nueva cita.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
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
                {appointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {patients[appointment.patientId] ? 
                            `${patients[appointment.patientId].name} ${patients[appointment.patientId].lastName}` : 
                            'Paciente no encontrado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {appointment.reason}
                      </div>
                      {appointment.notes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {appointment.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/citas/${appointment.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <Link 
                          to={`/citas/${appointment.id}/editar`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.id)}
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

export default CitasList; 