/**
 * Cliente API para interactuar con el servidor backend
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(baseUrl: string = 'http://localhost:3001/api/v1', token?: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Realiza una petición GET
   * @param endpoint Ruta del endpoint a consultar
   * @returns Promise con los datos obtenidos
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      console.log(`GET Request to: ${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realiza una petición POST
   * @param endpoint Ruta del endpoint a consultar
   * @param data Datos a enviar en la petición
   * @returns Promise con los datos obtenidos
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`POST Request to: ${this.baseUrl}${endpoint}`, data);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realiza una petición PUT
   * @param endpoint Ruta del endpoint a consultar
   * @param data Datos a enviar en la petición
   * @returns Promise con los datos obtenidos
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`PUT Request to: ${this.baseUrl}${endpoint}`, data);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realiza una petición PATCH
   * @param endpoint Ruta del endpoint a consultar
   * @param data Datos a enviar en la petición
   * @returns Promise con los datos obtenidos
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`PATCH Request to: ${this.baseUrl}${endpoint}`, data);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error en PATCH ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE
   * @param endpoint Ruta del endpoint a consultar
   * @returns Promise con los datos obtenidos
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      console.log(`DELETE Request to: ${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers,
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Maneja las respuestas de error de la API
   */
  private async handleErrorResponse(response: Response): Promise<Error> {
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || `Error de servidor ${response.status}`;
    } catch (error) {
      errorMessage = `Error de servidor ${response.status}`;
    }

    const error = new Error(errorMessage);
    (error as any).statusCode = response.status;
    return error;
  }

  /**
   * Actualiza el token de autorización
   */
  setToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Elimina el token de autorización
   */
  removeToken(): void {
    delete this.headers['Authorization'];
  }
} 