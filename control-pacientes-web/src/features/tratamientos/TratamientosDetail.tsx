import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApi } from '../../infrastructure/api/ApiProvider';
import { Treatment } from '../tratamientos/services/TreatmentService';
import { Patient } from '../pacientes/services/PatientService';

const TratamientosDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { treatmentService, patientService } = useApi();
  
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch treatment data
        const treatmentData = await treatmentService.getTreatmentById(id);
        setTreatment(treatmentData);
        
        // Fetch patient data
        const patientData = await patientService.getPatientById(treatmentData.patientId);
        setPatient(patientData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching treatment data:', err);
        setError('Error al cargar los datos del tratamiento. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, treatmentService, patientService]);

  const handleDeleteTreatment = async () => {
    if (!treatment) return;
    
    if (window.confirm('¿Está seguro de que desea eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      try {
        await treatmentService.deleteTreatment(treatment.id);
        navigate('/tratamientos');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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

  if (!treatment || !patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded shadow-md" role="alert">
          <p className="font-bold">Información no disponible</p>
          <p>No se pudieron cargar los datos del tratamiento solicitado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Detalle del Tratamiento</h1>
          <div className="flex space-x-2">
            <Link 
              to={`/tratamientos/${id}/editar`}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
            >
              Editar
            </Link>
            <button 
              onClick={() => navigate('/tratamientos')}
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
                  {treatment.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Paciente: {patient.name} {patient.lastName}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span 
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClass(treatment.status)}`}
                >
                  {getStatusText(treatment.status)}
                </span>
                {treatment.price !== undefined && (
                  <p className="mt-2 text-md font-semibold text-gray-800">
                    {formatCurrency(treatment.price)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Información del Tratamiento</h3>
                <div className="space-y-3">
                  {treatment.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Descripción:</label>
                      <p className="text-gray-800 whitespace-pre-line">{treatment.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de inicio:</label>
                    <p className="text-gray-800">{new Date(treatment.startDate).toLocaleDateString()}</p>
                  </div>
                  {treatment.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Fecha de finalización:</label>
                      <p className="text-gray-800">{new Date(treatment.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estado:</label>
                    <p className="text-gray-800">{getStatusText(treatment.status)}</p>
                  </div>
                  {treatment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Notas adicionales:</label>
                      <p className="text-gray-800 whitespace-pre-line">{treatment.notes}</p>
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
                onClick={handleDeleteTreatment}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
              >
                Eliminar Tratamiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TratamientosDetail; 