import { ApiClient } from '../../../infrastructure/api/ApiClient';

/**
 * Tipo para los datos de una notificación
 */
export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'patient' | 'doctor' | 'admin';
  type: 'appointment' | 'treatment' | 'invoice' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  expiresAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Tipo para crear una nueva notificación
 */
export type CreateNotificationDto = Omit<Notification, 'id' | 'createdAt' | 'read'> & { read?: boolean };

/**
 * Tipo para actualizar una notificación existente
 */
export type UpdateNotificationDto = Partial<Omit<Notification, 'id'>> & { id: string };

/**
 * Servicio para la gestión de notificaciones
 */
export class NotificationService {
  private apiClient: ApiClient;
  private readonly basePath = '/notifications';

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtiene todas las notificaciones
   */
  async getAllNotifications(): Promise<Notification[]> {
    return this.apiClient.get<Notification[]>(this.basePath);
  }

  /**
   * Obtiene las notificaciones del usuario actual
   */
  async getMyNotifications(): Promise<Notification[]> {
    return this.apiClient.get<Notification[]>(`${this.basePath}/my`);
  }

  /**
   * Obtiene las notificaciones no leídas del usuario actual
   */
  async getMyUnreadNotifications(): Promise<Notification[]> {
    return this.apiClient.get<Notification[]>(`${this.basePath}/my/unread`);
  }

  /**
   * Obtiene las notificaciones de un destinatario específico
   * @param recipientId ID del destinatario
   * @param recipientType Tipo de destinatario
   */
  async getNotificationsByRecipient(recipientId: string, recipientType: Notification['recipientType']): Promise<Notification[]> {
    return this.apiClient.get<Notification[]>(`${this.basePath}/recipient/${recipientType}/${recipientId}`);
  }

  /**
   * Obtiene una notificación por su ID
   * @param id ID de la notificación a obtener
   */
  async getNotificationById(id: string): Promise<Notification> {
    return this.apiClient.get<Notification>(`${this.basePath}/${id}`);
  }

  /**
   * Crea una nueva notificación
   * @param notificationData Datos de la notificación a crear
   */
  async createNotification(notificationData: CreateNotificationDto): Promise<Notification> {
    return this.apiClient.post<Notification>(this.basePath, notificationData);
  }

  /**
   * Marca una notificación como leída
   * @param id ID de la notificación
   */
  async markAsRead(id: string): Promise<Notification> {
    return this.apiClient.patch<Notification>(`${this.basePath}/${id}/read`, {
      read: true
    });
  }

  /**
   * Marca una notificación como no leída
   * @param id ID de la notificación
   */
  async markAsUnread(id: string): Promise<Notification> {
    return this.apiClient.patch<Notification>(`${this.basePath}/${id}/unread`, {
      read: false
    });
  }

  /**
   * Marca todas las notificaciones del usuario actual como leídas
   */
  async markAllAsRead(): Promise<void> {
    return this.apiClient.patch<void>(`${this.basePath}/all/read`, {});
  }

  /**
   * Elimina una notificación
   * @param id ID de la notificación a eliminar
   */
  async deleteNotification(id: string): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Elimina todas las notificaciones del usuario actual
   */
  async deleteAllNotifications(): Promise<void> {
    return this.apiClient.delete<void>(`${this.basePath}/all`);
  }
} 