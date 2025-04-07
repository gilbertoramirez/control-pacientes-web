import { useState, useEffect } from 'react';
import { ICrearPaciente, IActualizarPaciente, IPaciente } from '../interfaces/IPaciente';

interface FormularioPacienteProps {
  paciente?: IPaciente;
  onSubmit: (datos: ICrearPaciente | IActualizarPaciente) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente de formulario para crear o editar pacientes
 */
const FormularioPaciente: React.FC<FormularioPacienteProps> = ({
  paciente,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const esEdicion = !!paciente;
  
  const [formData, setFormData] = useState<ICrearPaciente>({
    nombre: '',
    apellidos: '',
    fechaNacimiento: new Date(),
    genero: 'masculino',
    numeroIdentificacion: '',
    email: '',
    telefono: '',
    direccion: '',
    grupoSanguineo: '',
    alergias: []
  });

  // Cargar datos del paciente si estamos en modo edición
  useEffect(() => {
    if (paciente) {
      setFormData({
        nombre: paciente.nombre,
        apellidos: paciente.apellidos,
        fechaNacimiento: paciente.fechaNacimiento,
        genero: paciente.genero,
        numeroIdentificacion: paciente.numeroIdentificacion,
        email: paciente.email || '',
        telefono: paciente.telefono || '',
        direccion: paciente.direccion || '',
        grupoSanguineo: paciente.grupoSanguineo || '',
        alergias: paciente.alergias || []
      });
    }
  }, [paciente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        fechaNacimiento: date
      }));
    }
  };

  const handleAlergiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const alergias = value.split(',').map(item => item.trim()).filter(Boolean);
    
    setFormData(prev => ({
      ...prev,
      alergias
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-4">
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="nombre" className="form-label">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="apellidos" className="form-label">Apellidos *</label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento *</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento instanceof Date ? formData.fechaNacimiento.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              required
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="genero" className="form-label">Género *</label>
            <select
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-select"
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <div className="form-group mb-3">
            <label htmlFor="numeroIdentificacion" className="form-label">Número de Identificación *</label>
            <input
              type="text"
              id="numeroIdentificacion"
              name="numeroIdentificacion"
              value={formData.numeroIdentificacion}
              onChange={handleChange}
              required
              disabled={isLoading || esEdicion}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="telefono" className="form-label">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <div className="form-group mb-3">
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="grupoSanguineo" className="form-label">Grupo Sanguíneo</label>
            <input
              type="text"
              id="grupoSanguineo"
              name="grupoSanguineo"
              value={formData.grupoSanguineo}
              onChange={handleChange}
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label htmlFor="alergias" className="form-label">Alergias (separadas por comas)</label>
            <input
              type="text"
              id="alergias"
              name="alergias"
              value={formData.alergias ? formData.alergias.join(', ') : ''}
              onChange={handleAlergiaChange}
              disabled={isLoading}
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default FormularioPaciente; 