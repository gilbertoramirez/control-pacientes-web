import { ApiClient } from '../../../infrastructure/api/ApiClient';

/**
 * Tipo para los datos de un paciente
 */
export interface Patient {
  id: string;
  name: string;
  lastName: string;
  documentId: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para crear un nuevo paciente (omite id y fechas de creación/actualización)
 */
export type CreatePatientDto = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para actualizar un paciente (todos los campos son opcionales excepto el id)
 */
export type UpdatePatientDto = Partial<Omit<Patient, 'id'>> & { id: string };

/**
 * Servicio para la gestión de pacientes
 */
export class PatientService {
  private apiClient: ApiClient;
  private readonly basePath = '/patients';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene la lista de todos los pacientes
   */
  async getAllPatients(): Promise<Patient[]> {
    return this.apiClient.get<Patient[]>(this.basePath);
  }

  /**
   * Obtiene un paciente por su ID
   * @param id ID del paciente a obtener
   */
  async getPatientById(id: string): Promise<Patient> {
    return this.apiClient.get<Patient>(`${this.basePath}/${id}`);
  }

  /**
   * Crea un nuevo paciente
   * @param patientData Datos del paciente a crear
   */
  async createPatient(patientData: CreatePatientDto): Promise<Patient> {
    return this.apiClient.post<Patient>(this.basePath, patientData);
  }

  /**
   * Actualiza un paciente existente
   * @param patientData Datos del paciente a actualizar
   */
  async updatePatient(patientData: UpdatePatientDto): Promise<Patient> {
    return this.apiClient.put<Patient>(`${this.basePath}/${patientData.id}`, patientData);
  }

  /**
   * Elimina un paciente
   * @param id ID del paciente a eliminar
   */
  async deletePatient(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }
} 