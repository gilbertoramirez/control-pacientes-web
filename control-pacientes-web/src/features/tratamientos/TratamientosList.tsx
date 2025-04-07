import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../infrastructure/api/ApiProvider';
import { Treatment } from '../tratamientos/services/TreatmentService';
import { Patient } from '../pacientes/services/PatientService';

const TratamientosList: React.FC = () => {
  const { treatmentService, patientService } = useApi();
  
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all treatments
        const treatmentsData = await treatmentService.getAllTreatments();
        setTreatments(treatmentsData);
        
        // Fetch all patients and create a lookup map
        const patientsData = await patientService.getAllPatients();
        const patientsMap: Record<string, Patient> = {};
        patientsData.forEach((patient) => {
          patientsMap[patient.id] = patient;
        });
        setPatients(patientsMap);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching treatments data:', err);
        setError('Error al cargar los tratamientos. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [treatmentService, patientService]);

  const handleDeleteTreatment = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      try {
        await treatmentService.deleteTreatment(id);
        // Update the treatments list after deletion
        setTreatments(treatments.filter(treatment => treatment.id !== id));
      } catch (err) {
        console.error('Error deleting treatment:', err);
        setError('Error al eliminar el tratamiento. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'planned':
        return 'Planificado';
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
        <h1 className="text-3xl font-bold text-gray-800">Tratamientos</h1>
        <Link 
          to="/tratamientos/nuevo"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
        >
          Nuevo Tratamiento
        </Link>
      </div>

      {treatments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tratamientos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">Comience creando un nuevo tratamiento para sus pacientes.</p>
          <div className="mt-6">
            <Link
              to="/tratamientos/nuevo"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo Tratamiento
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
                    Paciente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tratamiento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {treatments.map((treatment) => {
                  const patient = patients[treatment.patientId];
                  return (
                    <tr key={treatment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {patient ? (
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {patient.name} {patient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.documentId}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Paciente no disponible</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{treatment.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{treatment.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(treatment.startDate).toLocaleDateString()}
                        </div>
                        {treatment.endDate && (
                          <div className="text-sm text-gray-500">
                            Hasta: {new Date(treatment.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(treatment.status)}`}>
                          {getStatusText(treatment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${treatment.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link to={`/tratamientos/${treatment.id}`} className="text-indigo-600 hover:text-indigo-900">
                            Ver
                          </Link>
                          <Link to={`/tratamientos/${treatment.id}/editar`} className="text-blue-600 hover:text-blue-900">
                            Editar
                          </Link>
                          <button 
                            onClick={() => handleDeleteTreatment(treatment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TratamientosList; 