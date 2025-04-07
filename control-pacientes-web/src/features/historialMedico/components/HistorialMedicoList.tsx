import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { MedicalRecord } from '../services/MedicalRecordService';

const HistorialMedicoList: React.FC = () => {
  const { medicalRecordService, patientService, doctorService } = useApi();
  
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [patientMap, setPatientMap] = useState<Record<string, string>>({});
  const [doctorMap, setDoctorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all medical records
        const recordsData = await medicalRecordService.getAllMedicalRecords();
        setRecords(recordsData);
        setFilteredRecords(recordsData);
        
        // Fetch patients to display names
        const patients = await patientService.getAllPatients();
        const patientMapping: Record<string, string> = {};
        patients.forEach(patient => {
          patientMapping[patient.id] = `${patient.name} ${patient.lastName}`;
        });
        setPatientMap(patientMapping);
        
        // Fetch doctors to display names
        const doctors = await doctorService.getAllDoctors();
        const doctorMapping: Record<string, string> = {};
        doctors.forEach(doctor => {
          doctorMapping[doctor.id] = `${doctor.name} ${doctor.lastName}`;
        });
        setDoctorMap(doctorMapping);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching medical records data:', err);
        setError('Error al cargar los registros médicos. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [medicalRecordService, patientService, doctorService]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter(record => record.type === filter));
    }
  }, [filter, records]);

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro médico? Esta acción no se puede deshacer.')) {
      try {
        await medicalRecordService.deleteMedicalRecord(id);
        // Update the records list after deletion
        setRecords(records.filter(record => record.id !== id));
      } catch (err) {
        console.error('Error deleting medical record:', err);
        setError('Error al eliminar el registro médico. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const getRecordTypeBadge = (type: MedicalRecord['type']) => {
    const typeClasses = {
      'consultation': 'bg-blue-100 text-blue-800',
      'diagnosis': 'bg-green-100 text-green-800',
      'test': 'bg-purple-100 text-purple-800',
      'surgery': 'bg-red-100 text-red-800',
      'prescription': 'bg-yellow-100 text-yellow-800',
      'follow_up': 'bg-indigo-100 text-indigo-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    
    const typeText = {
      'consultation': 'Consulta',
      'diagnosis': 'Diagnóstico',
      'test': 'Prueba',
      'surgery': 'Cirugía',
      'prescription': 'Prescripción',
      'follow_up': 'Seguimiento',
      'other': 'Otro'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClasses[type]}`}>
        {typeText[type]}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-800">Historial Médico</h1>
        <Link 
          to="/historial-medico/nuevo"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
        >
          Nuevo Registro
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('consultation')}
            className={`px-4 py-2 rounded-md ${filter === 'consultation' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Consultas
          </button>
          <button
            onClick={() => setFilter('diagnosis')}
            className={`px-4 py-2 rounded-md ${filter === 'diagnosis' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Diagnósticos
          </button>
          <button
            onClick={() => setFilter('test')}
            className={`px-4 py-2 rounded-md ${filter === 'test' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Pruebas
          </button>
          <button
            onClick={() => setFilter('surgery')}
            className={`px-4 py-2 rounded-md ${filter === 'surgery' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Cirugías
          </button>
          <button
            onClick={() => setFilter('prescription')}
            className={`px-4 py-2 rounded-md ${filter === 'prescription' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Prescripciones
          </button>
          <button
            onClick={() => setFilter('follow_up')}
            className={`px-4 py-2 rounded-md ${filter === 'follow_up' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Seguimientos
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros médicos {filter !== 'all' ? `de tipo "${filter}"` : ''}</h3>
          <p className="mt-1 text-sm text-gray-500">Comience creando un nuevo registro médico.</p>
          <div className="mt-6">
            <Link
              to="/historial-medico/nuevo"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo Registro
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
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(record.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patientMap[record.patientId] || 'Paciente desconocido'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRecordTypeBadge(record.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-normal">
                      <div className="text-sm text-gray-900">{record.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.doctorId ? doctorMap[record.doctorId] : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link to={`/historial-medico/${record.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Ver
                        </Link>
                        <Link to={`/historial-medico/${record.id}/editar`} className="text-blue-600 hover:text-blue-900">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeleteRecord(record.id)}
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

export default HistorialMedicoList; 