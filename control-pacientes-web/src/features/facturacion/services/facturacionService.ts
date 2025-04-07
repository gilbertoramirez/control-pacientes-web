import { ApiClient } from '../../../infrastructure/api/ApiClient';

/**
 * Tipo para los datos de una factura
 */
export interface Invoice {
  id: string;
  patientId: string;
  doctorId?: string;
  number: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tipo para un ítem de factura
 */
export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  treatmentId?: string;
  appointmentId?: string;
}

/**
 * Tipo para crear una nueva factura
 */
export type CreateInvoiceDto = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipo para actualizar una factura existente
 */
export type UpdateInvoiceDto = Partial<Omit<Invoice, 'id'>> & { id: string };

/**
 * Servicio para la gestión de facturas
 */
export class FacturacionService {
  private apiClient: ApiClient;
  private readonly basePath = '/invoices';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene la lista de todas las facturas
   */
  async getAllInvoices(): Promise<Invoice[]> {
    return this.apiClient.get<Invoice[]>(this.basePath);
  }

  /**
   * Obtiene las facturas de un paciente específico
   * @param patientId ID del paciente
   */
  async getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
    return this.apiClient.get<Invoice[]>(`${this.basePath}/patient/${patientId}`);
  }

  /**
   * Obtiene facturas por estado
   * @param status Estado de la factura
   */
  async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    return this.apiClient.get<Invoice[]>(`${this.basePath}/status/${status}`);
  }

  /**
   * Obtiene una factura por su ID
   * @param id ID de la factura a obtener
   */
  async getInvoiceById(id: string): Promise<Invoice> {
    return this.apiClient.get<Invoice>(`${this.basePath}/${id}`);
  }

  /**
   * Crea una nueva factura
   * @param invoiceData Datos de la factura a crear
   */
  async createInvoice(invoiceData: CreateInvoiceDto): Promise<Invoice> {
    return this.apiClient.post<Invoice>(this.basePath, invoiceData);
  }

  /**
   * Actualiza una factura existente
   * @param id ID de la factura a actualizar
   * @param invoiceData Datos de la factura a actualizar
   */
  async updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id'>>): Promise<Invoice> {
    return this.apiClient.put<Invoice>(`${this.basePath}/${id}`, invoiceData);
  }

  /**
   * Marca una factura como pagada
   * @param id ID de la factura
   * @param paymentMethod Método de pago
   * @param paymentDate Fecha de pago
   */
  async markAsPaid(id: string, paymentMethod: string, paymentDate: string): Promise<Invoice> {
    return this.apiClient.patch<Invoice>(`${this.basePath}/${id}/pay`, {
      paymentMethod,
      paymentDate,
      status: 'paid'
    });
  }

  /**
   * Cancela una factura
   * @param id ID de la factura a cancelar
   */
  async cancelInvoice(id: string): Promise<Invoice> {
    return this.apiClient.patch<Invoice>(`${this.basePath}/${id}/cancel`, {
      status: 'cancelled'
    });
  }

  /**
   * Elimina una factura
   * @param id ID de la factura a eliminar
   */
  async deleteInvoice(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }
} 