/**
 * Modelo de dominio que representa a un paciente en el sistema
 */
export class Paciente {
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
  
  constructor(
    id: string,
    nombre: string,
    apellidos: string,
    fechaNacimiento: Date,
    genero: 'masculino' | 'femenino' | 'otro',
    numeroIdentificacion: string,
    fechaRegistro = new Date(),
    ultimaActualizacion = new Date(),
    activo = true,
    email?: string,
    telefono?: string,
    direccion?: string,
    grupoSanguineo?: string,
    alergias?: string[],
    historiaClinica?: string,
  ) {
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.fechaNacimiento = fechaNacimiento;
    this.genero = genero;
    this.numeroIdentificacion = numeroIdentificacion;
    this.email = email;
    this.telefono = telefono;
    this.direccion = direccion;
    this.grupoSanguineo = grupoSanguineo;
    this.alergias = alergias;
    this.historiaClinica = historiaClinica;
    this.fechaRegistro = fechaRegistro;
    this.ultimaActualizacion = ultimaActualizacion;
    this.activo = activo;
  }

  /**
   * Obtiene el nombre completo del paciente
   */
  get nombreCompleto(): string {
    return `${this.nombre} ${this.apellidos}`;
  }

  /**
   * Calcula la edad del paciente basado en su fecha de nacimiento
   */
  get edad(): number {
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Actualiza los datos del paciente
   */
  actualizarDatos(
    datos: {
      nombre?: string;
      apellidos?: string;
      fechaNacimiento?: Date;
      genero?: 'masculino' | 'femenino' | 'otro';
      email?: string;
      telefono?: string;
      direccion?: string;
      grupoSanguineo?: string;
      alergias?: string[];
      historiaClinica?: string;
    }
  ): void {
    if (datos.nombre) this.nombre = datos.nombre;
    if (datos.apellidos) this.apellidos = datos.apellidos;
    if (datos.fechaNacimiento) this.fechaNacimiento = datos.fechaNacimiento;
    if (datos.genero) this.genero = datos.genero;
    if (datos.email !== undefined) this.email = datos.email;
    if (datos.telefono !== undefined) this.telefono = datos.telefono;
    if (datos.direccion !== undefined) this.direccion = datos.direccion;
    if (datos.grupoSanguineo !== undefined) this.grupoSanguineo = datos.grupoSanguineo;
    if (datos.alergias !== undefined) this.alergias = datos.alergias;
    if (datos.historiaClinica !== undefined) this.historiaClinica = datos.historiaClinica;
    
    this.ultimaActualizacion = new Date();
  }

  /**
   * Desactiva al paciente en el sistema
   */
  desactivar(): void {
    this.activo = false;
    this.ultimaActualizacion = new Date();
  }

  /**
   * Activa al paciente en el sistema
   */
  activar(): void {
    this.activo = true;
    this.ultimaActualizacion = new Date();
  }

  /**
   * Crea una instancia de Paciente a partir de un objeto plano
   */
  static fromObject(obj: any): Paciente {
    return new Paciente(
      obj.id,
      obj.nombre,
      obj.apellidos,
      new Date(obj.fechaNacimiento),
      obj.genero,
      obj.numeroIdentificacion,
      new Date(obj.fechaRegistro),
      new Date(obj.ultimaActualizacion),
      obj.activo,
      obj.email,
      obj.telefono,
      obj.direccion,
      obj.grupoSanguineo,
      obj.alergias,
      obj.historiaClinica
    );
  }

  /**
   * Convierte la instancia de Paciente a un objeto plano
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      nombre: this.nombre,
      apellidos: this.apellidos,
      fechaNacimiento: this.fechaNacimiento,
      genero: this.genero,
      numeroIdentificacion: this.numeroIdentificacion,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
      grupoSanguineo: this.grupoSanguineo,
      alergias: this.alergias,
      historiaClinica: this.historiaClinica,
      fechaRegistro: this.fechaRegistro,
      ultimaActualizacion: this.ultimaActualizacion,
      activo: this.activo
    };
  }
} 