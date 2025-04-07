import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ApiProvider } from './infrastructure/api/ApiProvider';
import PatientList from './features/pacientes/components/PacientesList';
import FormularioPaciente from './features/pacientes/components/FormularioPaciente';
import PatientDetail from './features/pacientes/components/PatientDetail';

const App: React.FC = () => {
  return (
    <ApiProvider>
      <Router>
        <div className="min-vh-100 bg-light">
          {/* Header / Navbar */}
          <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
              <Link to="/" className="navbar-brand">
                Control de Pacientes
              </Link>
              <button 
                className="navbar-toggler" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav" 
                aria-controls="navbarNav" 
                aria-expanded="false" 
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link 
                      to="/pacientes" 
                      className="nav-link"
                    >
                      Pacientes
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/citas" 
                      className="nav-link"
                    >
                      Citas
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/tratamientos" 
                      className="nav-link"
                    >
                      Tratamientos
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="py-4">
            <Routes>
              {/* Página de inicio */}
              <Route path="/" element={
                <div className="container">
                  <div className="text-center py-5">
                    <h1 className="display-4 mb-3">
                      Sistema de Control de Pacientes
                    </h1>
                    <p className="lead mb-4">
                      Gestione fácilmente pacientes, citas y tratamientos médicos.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Link 
                        to="/pacientes" 
                        className="btn btn-primary btn-lg"
                      >
                        Ver Pacientes
                      </Link>
                      <Link 
                        to="/pacientes/nuevo" 
                        className="btn btn-success btn-lg"
                      >
                        Nuevo Paciente
                      </Link>
                    </div>
                  </div>
                  
                  {/* Características del sistema */}
                  <div className="row mt-5 g-4">
                    <div className="col-md-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h2 className="card-title h5 mb-3">Gestión de Pacientes</h2>
                          <p className="card-text text-muted">
                            Registre y mantenga actualizada la información de sus pacientes.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h2 className="card-title h5 mb-3">Control de Citas</h2>
                          <p className="card-text text-muted">
                            Programe y administre citas médicas de manera eficiente.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h2 className="card-title h5 mb-3">Seguimiento de Tratamientos</h2>
                          <p className="card-text text-muted">
                            Mantenga un registro detallado de los tratamientos médicos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              } />
              
              {/* Rutas de Pacientes */}
              <Route path="/pacientes" element={<PatientList />} />
              <Route path="/pacientes/nuevo" element={<FormularioPaciente onSubmit={() => {}} onCancel={() => {}} />} />
              <Route path="/pacientes/:id" element={<PatientDetail />} />
              <Route path="/pacientes/:id/editar" element={<FormularioPaciente onSubmit={() => {}} onCancel={() => {}} />} />
              
              {/* Rutas de Citas (se pueden implementar más tarde) */}
              <Route path="/citas" element={<div className="container py-4">Lista de Citas (En construcción)</div>} />
              
              {/* Rutas de Tratamientos (se pueden implementar más tarde) */}
              <Route path="/tratamientos" element={<div className="container py-4">Lista de Tratamientos (En construcción)</div>} />
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="container text-center py-5">
                  <h1 className="display-4 mb-3">404 - Página no encontrada</h1>
                  <p className="lead mb-4">
                    Lo sentimos, la página que estás buscando no existe.
                  </p>
                  <Link 
                    to="/" 
                    className="btn btn-primary"
                  >
                    Volver al inicio
                  </Link>
                </div>
              } />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-dark text-white py-4 mt-auto">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6 mb-3 mb-md-0">
                  <p className="mb-0">&copy; {new Date().getFullYear()} Control de Pacientes. Todos los derechos reservados.</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <a href="#" className="text-white text-decoration-none me-3">Términos</a>
                  <a href="#" className="text-white text-decoration-none me-3">Privacidad</a>
                  <a href="#" className="text-white text-decoration-none">Contacto</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ApiProvider>
  );
};

export default App; 