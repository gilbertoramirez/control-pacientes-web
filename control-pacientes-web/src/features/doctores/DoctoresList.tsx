import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../infrastructure/api/ApiProvider';
import { Doctor } from '../../infrastructure/api/DoctorService';

const DoctoresList: React.FC = () => {
  const { doctorService } = useApi();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all doctors
        const doctorsData = await doctorService.getAllDoctors();
        setDoctors(doctorsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching doctors data:', err);
        setError('Error al cargar los doctores. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorService]);

  const handleDeleteDoctor = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este doctor? Esta acción no se puede deshacer.')) {
      try {
        await doctorService.deleteDoctor(id);
        // Update the doctors list after deletion
        setDoctors(doctors.filter(doctor => doctor.id !== id));
      } catch (err) {
        console.error('Error deleting doctor:', err);
        setError('Error al eliminar el doctor. Por favor, inténtelo de nuevo.');
      }
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active 
      ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span>
      : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactivo</span>;
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
        <h1 className="text-3xl font-bold text-gray-800">Doctores</h1>
        <Link 
          to="/doctores/nuevo"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-200"
        >
          Nuevo Doctor
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay doctores registrados</h3>
          <p className="mt-1 text-sm text-gray-500">Comience registrando un nuevo doctor en el sistema.</p>
          <div className="mt-6">
            <Link
              to="/doctores/nuevo"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nuevo Doctor
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
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
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
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {doctor.photoUrl ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={doctor.photoUrl} alt={`${doctor.name} ${doctor.lastName}`} />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.name} {doctor.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lic. #{doctor.licenseNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.speciality}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.phone}</div>
                      <div className="text-sm text-gray-500">{doctor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doctor.active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link to={`/doctores/${doctor.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Ver
                        </Link>
                        <Link to={`/doctores/${doctor.id}/editar`} className="text-blue-600 hover:text-blue-900">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeleteDoctor(doctor.id)}
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

export default DoctoresList; 