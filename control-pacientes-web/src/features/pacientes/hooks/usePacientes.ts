import { useState, useEffect, useCallback } from 'react';
import { IPaciente, ICrearPaciente, IActualizarPaciente } from '../interfaces/IPaciente';
import { PacienteService } from '../services/PacienteService';

/**
 * Hook personalizado para la gestión de pacientes
 * Proporciona una interfaz fácil de usar para interactuar con el servicio de pacientes
 */
export function usePacientes() {
  const [pacientes, setPacientes] = useState<IPaciente[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const pacienteService = new PacienteService();

  /**
   * Carga todos los pacientes
   */
  const cargarPacientes = useCallback(async () => {
    setCargando(true);
    setError(null);
    
    try {
      const resultado = await pacienteService.obtenerTodos();
      setPacientes(resultado);
    } catch (err) {
      setError('Error al cargar los pacientes');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Obtiene un paciente por su ID
   */
  const obtenerPaciente = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    
    try {
      return await pacienteService.obtenerPorId(id);
    } catch (err) {
      setError(`Error al obtener el paciente con ID ${id}`);
      console.error(err);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Crea un nuevo paciente
   */
  const crearPaciente = useCallback(async (nuevoPaciente: ICrearPaciente) => {
    setCargando(true);
    setError(null);
    
    try {
      const pacienteCreado = await pacienteService.crear(nuevoPaciente);
      setPacientes(prev => [...prev, pacienteCreado]);
      return pacienteCreado;
    } catch (err) {
      setError('Error al crear el paciente');
      console.error(err);
      return null;
    } finally {
      setCargando(false);
    }
  }, [pacientes]);

  /**
   * Actualiza un paciente existente
   */
  const actualizarPaciente = useCallback(async (id: string, cambios: IActualizarPaciente) => {
    setCargando(true);
    setError(null);
    
    try {
      const pacienteActualizado = await pacienteService.actualizar(id, cambios);
      
      if (pacienteActualizado) {
        setPacientes(prev => 
          prev.map(p => p.id === id ? pacienteActualizado : p)
        );
      }
      
      return pacienteActualizado;
    } catch (err) {
      setError(`Error al actualizar el paciente con ID ${id}`);
      console.error(err);
      return null;
    } finally {
      setCargando(false);
    }
  }, [pacientes]);

  /**
   * Elimina un paciente
   */
  const eliminarPaciente = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    
    try {
      const resultado = await pacienteService.eliminar(id);
      
      if (resultado) {
        setPacientes(prev => 
          prev.filter(p => p.id !== id)
        );
      }
      
      return resultado;
    } catch (err) {
      setError(`Error al eliminar el paciente con ID ${id}`);
      console.error(err);
      return false;
    } finally {
      setCargando(false);
    }
  }, [pacientes]);

  // Cargar pacientes al montar el componente
  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  return {
    pacientes,
    cargando,
    error,
    cargarPacientes,
    obtenerPaciente,
    crearPaciente,
    actualizarPaciente,
    eliminarPaciente
  };
} 