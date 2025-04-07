/**
 * Interfaz que define la estructura de un paciente en el sistema
 */
export interface IPaciente {
  id: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date;
  genero: 'masculino' | 'femenino' | 'otro';
  numeroIdentificacion: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  grupoSanguineo?: string;
  alergias?: string[];
  historiaClinica?: string;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  activo: boolean;
}

/**
 * Interfaz para crear un nuevo paciente (algunos campos son opcionales)
 */
export interface ICrearPaciente {
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date;
  genero: 'masculino' | 'femenino' | 'otro';
  numeroIdentificacion: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  grupoSanguineo?: string;
  alergias?: string[];
}

/**
 * Interfaz para actualizar un paciente existente (todos los campos son opcionales)
 */
export interface IActualizarPaciente {
  nombre?: string;
  apellidos?: string;
  fechaNacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'otro';
  numeroIdentificacion?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  grupoSanguineo?: string;
  alergias?: string[];
  activo?: boolean;
} 