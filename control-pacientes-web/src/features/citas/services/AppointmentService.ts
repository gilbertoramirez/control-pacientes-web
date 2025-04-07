import { ApiClient } from './ApiClient';

/**
 * Tipo para los datos de una cita
 */
export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para crear una nueva cita (omite id y fechas de creación/actualización)
 */
export type CreateAppointmentDto = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para actualizar una cita (todos los campos son opcionales excepto el id)
 */
export type UpdateAppointmentDto = Partial<Omit<Appointment, 'id'>> & { id: string };

/**
 * Servicio para la gestión de citas
 */
export class AppointmentService {
  private apiClient: ApiClient;
  private readonly basePath = '/appointments';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene la lista de todas las citas
   */
  async getAllAppointments(): Promise<Appointment[]> {
    return this.apiClient.get<Appointment[]>(this.basePath);
  }

  /**
   * Obtiene las citas de un paciente específico
   * @param patientId ID del paciente
   */
  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return this.apiClient.get<Appointment[]>(`${this.basePath}/patient/${patientId}`);
  }

  /**
   * Obtiene una cita por su ID
   * @param id ID de la cita a obtener
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    return this.apiClient.get<Appointment>(`${this.basePath}/${id}`);
  }

  /**
   * Crea una nueva cita
   * @param appointmentData Datos de la cita a crear
   */
  async createAppointment(appointmentData: CreateAppointmentDto): Promise<Appointment> {
    return this.apiClient.post<Appointment>(this.basePath, appointmentData);
  }

  /**
   * Actualiza una cita existente
   * @param appointmentData Datos de la cita a actualizar
   */
  async updateAppointment(appointmentData: UpdateAppointmentDto): Promise<Appointment> {
    return this.apiClient.put<Appointment>(`${this.basePath}/${appointmentData.id}`, appointmentData);
  }

  /**
   * Elimina una cita
   * @param id ID de la cita a eliminar
   */
  async deleteAppointment(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }
} 