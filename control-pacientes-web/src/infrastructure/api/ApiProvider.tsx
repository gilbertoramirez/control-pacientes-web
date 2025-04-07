import React, { createContext, useContext, ReactNode } from 'react';
import { ApiClient } from './ApiClient';
import { PatientService } from '../../features/pacientes/services/PatientService';
import { AppointmentService } from '../../features/citas/services/AppointmentService';
import { TreatmentService } from '../../features/tratamientos/services/TreatmentService';
import { DoctorService } from '../../features/doctores/services/DoctorService';
import { MedicalRecordService } from '../../features/historialMedico/services/MedicalRecordService';
import { NotificationService } from '../../features/notificaciones/services/NotificationService';
import { FacturacionService } from '../../features/facturacion/services/facturacionService';

// Definir la forma del contexto de la API
interface ApiContextValue {
  apiClient: ApiClient;
  patientService: PatientService;
  appointmentService: AppointmentService;
  treatmentService: TreatmentService;
  doctorService: DoctorService;
  medicalRecordService: MedicalRecordService;
  notificationService: NotificationService;
  facturacionService: FacturacionService;
}

// Crear el contexto
const ApiContext = createContext<ApiContextValue | undefined>(undefined);

// Props para el proveedor
interface ApiProviderProps {
  children: ReactNode;
  baseURL?: string;
}

// Componente proveedor
export const ApiProvider: React.FC<ApiProviderProps> = ({ 
  children, 
  baseURL = 'http://localhost:3001/api/v1' 
}) => {
  // Crear el cliente de la API
  const apiClient = new ApiClient(baseURL);

  // Crear instancias de los servicios
  const facturacionService = new FacturacionService(apiClient);
  const patientService = new PatientService(apiClient);
  const appointmentService = new AppointmentService(apiClient);
  const treatmentService = new TreatmentService(apiClient);
  const doctorService = new DoctorService(apiClient);
  const medicalRecordService = new MedicalRecordService(apiClient);
  const notificationService = new NotificationService(apiClient);

  // Valor del contexto
  const contextValue: ApiContextValue = {
    facturacionService,
    apiClient,
    patientService,
    appointmentService,
    treatmentService,
    doctorService,
    medicalRecordService,
    notificationService,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useApi = (): ApiContextValue => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi debe ser usado dentro de un ApiProvider');
  }
  return context;
}; 