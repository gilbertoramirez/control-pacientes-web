import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../../infrastructure/api/ApiProvider';
import { Patient } from '../services/PatientService';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patientService } = useApi();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const patientData = await patientService.getPatientById(id);
        setPatient(patientData);
        setError(null);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Error al cargar los datos del paciente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, patientService]);

  const handleDeletePatient = async () => {
    if (!id) return;
    
    const confirmDelete = window.confirm(
      '¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer.'
    );
    
    if (confirmDelete) {
      try {
        await patientService.deletePatient(id);
        navigate('/pacientes');
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Error al eliminar el paciente.');
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
          <hr />
          <div>
            <Link to="/pacientes" className="alert-link">
              Volver a la lista de pacientes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">No encontrado</h4>
          <p>El paciente no existe o ha sido eliminado.</p>
          <hr />
          <div>
            <Link to="/pacientes" className="alert-link">
              Volver a la lista de pacientes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow mx-auto" style={{ maxWidth: '800px' }}>
        <div className="card-header bg-primary text-white p-3">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0">Detalles del Paciente</h1>
            <div>
              <Link
                to={`/pacientes/${id}/editar`}
                className="btn btn-light btn-sm me-2"
              >
                <i className="bi bi-pencil me-1"></i> Editar
              </Link>
              <button
                onClick={handleDeletePatient}
                className="btn btn-danger btn-sm"
              >
                <i className="bi bi-trash me-1"></i> Eliminar
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <h2 className="h5 mb-3 pb-2 border-bottom">Información Personal</h2>
              <div className="mb-4">
                <div className="mb-3">
                  <p className="text-muted small mb-1">Nombre completo</p>
                  <p className="fs-5">{patient.name} {patient.lastName}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted small mb-1">Documento de identidad</p>
                  <p className="fs-5">{patient.documentId}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted small mb-1">Género</p>
                  <p className="fs-5">{patient.gender}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted small mb-1">Fecha de nacimiento</p>
                  <p className="fs-5">{new Date(patient.birthDate).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted small mb-1">Edad</p>
                  <p className="fs-5">
                    {Math.floor(
                      (new Date().getTime() - new Date(patient.birthDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25)
                    )} años
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <h2 className="h5 mb-3 pb-2 border-bottom">Información de Contacto</h2>
              <div className="mb-4">
                <div className="mb-3">
                  <p className="text-muted small mb-1">Teléfono</p>
                  <p className="fs-5">{patient.phone}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted small mb-1">Correo electrónico</p>
                  <p className="fs-5">{patient.email || 'No especificado'}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted small mb-1">Dirección</p>
                  <p className="fs-5">{patient.address || 'No especificada'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-top d-flex justify-content-between">
            <Link
              to="/pacientes"
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-1"></i> Volver a la lista
            </Link>
            <div>
              <Link
                to={`/citas/nuevo?pacienteId=${id}`}
                className="btn btn-success me-2"
              >
                <i className="bi bi-calendar-plus me-1"></i> Nueva Cita
              </Link>
              <Link
                to={`/tratamientos/nuevo?pacienteId=${id}`}
                className="btn btn-primary"
              >
                <i className="bi bi-clipboard-plus me-1"></i> Nuevo Tratamiento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail; 