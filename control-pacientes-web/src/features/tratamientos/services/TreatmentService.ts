import { ApiClient } from '../../../infrastructure/api/ApiClient';

/**
 * Tipo para los datos de un tratamiento
 */
export interface Treatment {
  id: string;
  patientId: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled' | 'planned';
  notes?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para crear un nuevo tratamiento (omite id y fechas de creación/actualización)
 */
export type CreateTreatmentDto = Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para actualizar un tratamiento (todos los campos son opcionales excepto el id)
 */
export type UpdateTreatmentDto = Partial<Omit<Treatment, 'id'>> & { id: string };

/**
 * Servicio para la gestión de tratamientos
 */
export class TreatmentService {
  private apiClient: ApiClient;
  private readonly basePath = '/treatments';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene la lista de todos los tratamientos
   */
  async getAllTreatments(): Promise<Treatment[]> {
    return this.apiClient.get<Treatment[]>(this.basePath);
  }

  /**
   * Obtiene los tratamientos de un paciente específico
   * @param patientId ID del paciente
   */
  async getTreatmentsByPatient(patientId: string): Promise<Treatment[]> {
    return this.apiClient.get<Treatment[]>(`${this.basePath}/patient/${patientId}`);
  }

  /**
   * Obtiene un tratamiento por su ID
   * @param id ID del tratamiento a obtener
   */
  async getTreatmentById(id: string): Promise<Treatment> {
    return this.apiClient.get<Treatment>(`${this.basePath}/${id}`);
  }

  /**
   * Crea un nuevo tratamiento
   * @param treatmentData Datos del tratamiento a crear
   */
  async createTreatment(treatmentData: CreateTreatmentDto): Promise<Treatment> {
    return this.apiClient.post<Treatment>(this.basePath, treatmentData);
  }

  /**
   * Actualiza un tratamiento existente
   * @param id ID del tratamiento a actualizar
   * @param treatmentData Datos del tratamiento a actualizar
   */
  async updateTreatment(id: string, treatmentData: Partial<Omit<Treatment, 'id'>>): Promise<Treatment> {
    return this.apiClient.put<Treatment>(`${this.basePath}/${id}`, treatmentData);
  }

  /**
   * Elimina un tratamiento
   * @param id ID del tratamiento a eliminar
   */
  async deleteTreatment(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }
} 