import { ApiClient } from './ApiClient';

/**
 * Tipo para los datos de un doctor
 */
export interface Doctor {
  id: string;
  name: string;
  lastName: string;
  speciality: string;
  licenseNumber: string;
  email: string;
  phone: string;
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  bio?: string;
  photoUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para crear un nuevo doctor
 */
export type CreateDoctorDto = Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para actualizar un doctor existente
 */
export type UpdateDoctorDto = Partial<Omit<Doctor, 'id'>> & { id: string };

/**
 * Servicio para la gestión de doctores
 */
export class DoctorService {
  private apiClient: ApiClient;
  private readonly basePath = '/doctors';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene la lista de todos los doctores
   */
  async getAllDoctors(): Promise<Doctor[]> {
    return this.apiClient.get<Doctor[]>(this.basePath);
  }

  /**
   * Obtiene los doctores por especialidad
   * @param speciality Especialidad médica
   */
  async getDoctorsBySpeciality(speciality: string): Promise<Doctor[]> {
    return this.apiClient.get<Doctor[]>(`${this.basePath}/speciality/${speciality}`);
  }

  /**
   * Obtiene un doctor por su ID
   * @param id ID del doctor a obtener
   */
  async getDoctorById(id: string): Promise<Doctor> {
    return this.apiClient.get<Doctor>(`${this.basePath}/${id}`);
  }

  /**
   * Crea un nuevo doctor
   * @param doctorData Datos del doctor a crear
   */
  async createDoctor(doctorData: CreateDoctorDto): Promise<Doctor> {
    return this.apiClient.post<Doctor>(this.basePath, doctorData);
  }

  /**
   * Actualiza un doctor existente
   * @param id ID del doctor a actualizar
   * @param doctorData Datos del doctor a actualizar
   */
  async updateDoctor(id: string, doctorData: Partial<Omit<Doctor, 'id'>>): Promise<Doctor> {
    return this.apiClient.put<Doctor>(`${this.basePath}/${id}`, doctorData);
  }

  /**
   * Elimina un doctor
   * @param id ID del doctor a eliminar
   */
  async deleteDoctor(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }
} 