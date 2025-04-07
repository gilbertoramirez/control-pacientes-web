import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Patient } from '../services/PatientService';

const PacientesList: React.FC = () => {
  const { patientService } = useApi();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all patients
        const patientsData = await patientService.getAllPatients();
        setPatients(patientsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching patients data:', err);
        setError('Error al cargar los pacientes. Por favor, inténtelo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientService]);

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer. Se eliminarán también todas las citas y tratamientos asociados a este paciente.')) {
      try {
        await patientService.deletePatient(id);
        // Update the patients list after deletion
        setPatients(patients.filter(patient => patient.id !== id));
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Error al eliminar el paciente. Por favor, inténtelo de nuevo.');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Pacientes</h1>
        <Link 
          to="/pacientes/nuevo"
          className="btn btn-primary"
        >
          Nuevo Paciente
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="card text-center p-5">
          <div className="mb-3">
            <i className="bi bi-people fs-1 text-secondary"></i>
          </div>
          <h3 className="h5">No hay pacientes registrados</h3>
          <p className="text-muted mb-4">Comience registrando un nuevo paciente en el sistema.</p>
          <div>
            <Link
              to="/pacientes/nuevo"
              className="btn btn-primary"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Nuevo Paciente
            </Link>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Documento ID</th>
                  <th scope="col">Contacto</th>
                  <th scope="col">Fecha Nacimiento</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div>
                        <span className="fw-medium">{patient.name} {patient.lastName}</span>
                      </div>
                    </td>
                    <td>
                      <span>{patient.documentId}</span>
                    </td>
                    <td>
                      <div>{patient.phone}</div>
                      <small className="text-muted">{patient.email}</small>
                    </td>
                    <td>
                      {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'No disponible'}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/pacientes/${patient.id}`} className="btn btn-sm btn-outline-primary">
                          Ver
                        </Link>
                        <Link to={`/pacientes/${patient.id}/editar`} className="btn btn-sm btn-outline-secondary">
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDeletePatient(patient.id)}
                          className="btn btn-sm btn-outline-danger"
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

export default PacientesList; 