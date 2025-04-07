import { ApiClient } from './ApiClient';

/**
 * Tipo para los datos de un historial médico
 */
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  date: string;
  type: 'consultation' | 'diagnosis' | 'test' | 'surgery' | 'prescription' | 'follow_up' | 'other';
  title: string;
  description: string;
  diagnosis?: string;
  symptoms?: string[];
  prescriptions?: Prescription[];
  testResults?: TestResult[];
  attachments?: Attachment[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para una prescripción médica
 */
export interface Prescription {
  id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  startDate: string;
  endDate?: string;
}

/**
 * Tipo para un resultado de prueba
 */
export interface TestResult {
  id?: string;
  testName: string;
  testDate: string;
  result: string;
  normalRange?: string;
  units?: string;
  comments?: string;
  fileUrl?: string;
}

/**
 * Tipo para un archivo adjunto
 */
export interface Attachment {
  id?: string;
  name: string;
  type: string;
  url: string;
  description?: string;
  uploadDate: string;
}

/**
 * Tipo para crear un nuevo registro médico
 */
export type CreateMedicalRecordDto = Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para actualizar un registro médico existente
 */
export type UpdateMedicalRecordDto = Partial<Omit<MedicalRecord, 'id'>> & { id: string };

/**
 * Servicio para la gestión de historiales médicos
 */
export class MedicalRecordService {
  private apiClient: ApiClient;
  private readonly basePath = '/medical-records';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene todos los registros médicos
   */
  async getAllMedicalRecords(): Promise<MedicalRecord[]> {
    return this.apiClient.get<MedicalRecord[]>(this.basePath);
  }

  /**
   * Obtiene los registros médicos de un paciente específico
   * @param patientId ID del paciente
   */
  async getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    return this.apiClient.get<MedicalRecord[]>(`${this.basePath}/patient/${patientId}`);
  }

  /**
   * Obtiene los registros médicos por tipo
   * @param type Tipo de registro médico
   */
  async getMedicalRecordsByType(type: MedicalRecord['type']): Promise<MedicalRecord[]> {
    return this.apiClient.get<MedicalRecord[]>(`${this.basePath}/type/${type}`);
  }

  /**
   * Obtiene un registro médico por su ID
   * @param id ID del registro médico a obtener
   */
  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    return this.apiClient.get<MedicalRecord>(`${this.basePath}/${id}`);
  }

  /**
   * Crea un nuevo registro médico
   * @param medicalRecordData Datos del registro médico a crear
   */
  async createMedicalRecord(medicalRecordData: CreateMedicalRecordDto): Promise<MedicalRecord> {
    return this.apiClient.post<MedicalRecord>(this.basePath, medicalRecordData);
  }

  /**
   * Actualiza un registro médico existente
   * @param id ID del registro médico a actualizar
   * @param medicalRecordData Datos del registro médico a actualizar
   */
  async updateMedicalRecord(id: string, medicalRecordData: Partial<Omit<MedicalRecord, 'id'>>): Promise<MedicalRecord> {
    return this.apiClient.put<MedicalRecord>(`${this.basePath}/${id}`, medicalRecordData);
  }

  /**
   * Elimina un registro médico
   * @param id ID del registro médico a eliminar
   */
  async deleteMedicalRecord(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Añade un adjunto a un registro médico
   * @param recordId ID del registro médico
   * @param attachment Datos del adjunto a añadir
   */
  async addAttachment(recordId: string, attachment: Omit<Attachment, 'id'>): Promise<MedicalRecord> {
    return this.apiClient.post<MedicalRecord>(`${this.basePath}/${recordId}/attachments`, attachment);
  }

  /**
   * Elimina un adjunto de un registro médico
   * @param recordId ID del registro médico
   * @param attachmentId ID del adjunto a eliminar
   */
  async removeAttachment(recordId: string, attachmentId: string): Promise<MedicalRecord> {
    return this.apiClient.delete<MedicalRecord>(`${this.basePath}/${recordId}/attachments/${attachmentId}`);
  }
} 