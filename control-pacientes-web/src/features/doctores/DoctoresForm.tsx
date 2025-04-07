import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../infrastructure/api/ApiProvider';
import { Doctor } from '../../infrastructure/api/DoctorService';

const DoctoresForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { doctorService } = useApi();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    lastName: string;
    speciality: string;
    licenseNumber: string;
    email: string;
    phone: string;
    bio: string;
    photoUrl: string;
    active: boolean;
    availability: {
      monday: string[];
      tuesday: string[];
      wednesday: string[];
      thursday: string[];
      friday: string[];
      saturday: string[];
      sunday: string[];
    };
  }>({
    name: '',
    lastName: '',
    speciality: '',
    licenseNumber: '',
    email: '',
    phone: '',
    bio: '',
    photoUrl: '',
    active: true,
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchDoctorData = async () => {
        try {
          setLoading(true);
          const doctorData = await doctorService.getDoctorById(id);
          setFormData({
            name: doctorData.name,
            lastName: doctorData.lastName,
            speciality: doctorData.speciality,
            licenseNumber: doctorData.licenseNumber,
            email: doctorData.email,
            phone: doctorData.phone,
            bio: doctorData.bio || '',
            photoUrl: doctorData.photoUrl || '',
            active: doctorData.active,
            availability: {
              monday: doctorData.availability?.monday || [],
              tuesday: doctorData.availability?.tuesday || [],
              wednesday: doctorData.availability?.wednesday || [],
              thursday: doctorData.availability?.thursday || [],
              friday: doctorData.availability?.friday || [],
              saturday: doctorData.availability?.saturday || [],
              sunday: doctorData.availability?.sunday || []
            }
          });
          setError(null);
        } catch (err) {
          console.error('Error fetching doctor data:', err);
          setError('Error al cargar los datos del doctor. Por favor, inténtelo de nuevo.');
        } finally {
          setLoading(false);
        }
      };

      fetchDoctorData();
    }
  }, [id, isEditMode, doctorService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData(prevState => ({
        ...prevState,
        [name]: checkboxInput.checked
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleAvailabilityChange = (day: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const timeSlots = e.target.value.split(',').map(slot => slot.trim()).filter(Boolean);
    
    setFormData(prevState => ({
      ...prevState,
      availability: {
        ...prevState.availability,
        [day]: timeSlots
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const doctorData = {
        name: formData.name,
        lastName: formData.lastName,
        speciality: formData.speciality,
        licenseNumber: formData.licenseNumber,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio || undefined,
        photoUrl: formData.photoUrl || undefined,
        active: formData.active,
        availability: {
          monday: formData.availability.monday.length > 0 ? formData.availability.monday : undefined,
          tuesday: formData.availability.tuesday.length > 0 ? formData.availability.tuesday : undefined,
          wednesday: formData.availability.wednesday.length > 0 ? formData.availability.wednesday : undefined,
          thursday: formData.availability.thursday.length > 0 ? formData.availability.thursday : undefined,
          friday: formData.availability.friday.length > 0 ? formData.availability.friday : undefined,
          saturday: formData.availability.saturday.length > 0 ? formData.availability.saturday : undefined,
          sunday: formData.availability.sunday.length > 0 ? formData.availability.sunday : undefined
        }
      };
      
      if (isEditMode && id) {
        await doctorService.updateDoctor(id, doctorData);
      } else {
        await doctorService.createDoctor(doctorData);
      }
      
      navigate('/doctores');
    } catch (err) {
      console.error('Error saving doctor:', err);
      setError('Error al guardar los datos del doctor. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Editar Doctor' : 'Nuevo Doctor'}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Nombre *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                  Apellidos *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="speciality">
                  Especialidad *
                </label>
                <input
                  type="text"
                  id="speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="licenseNumber">
                  Número de Licencia *
                </label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">
                  Biografía
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="photoUrl">
                  URL de Foto
                </label>
                <input
                  type="url"
                  id="photoUrl"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="active" className="font-medium text-gray-700">Activo</label>
                  <p className="text-gray-500">Indica si el doctor está actualmente disponible para consultas</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Disponibilidad</h3>
              <p className="text-sm text-gray-500 mb-4">
                Ingrese los horarios disponibles para cada día separados por comas (ej. 09:00-10:00, 14:00-15:00)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="monday">
                    Lunes
                  </label>
                  <input
                    type="text"
                    id="monday"
                    value={formData.availability.monday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('monday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tuesday">
                    Martes
                  </label>
                  <input
                    type="text"
                    id="tuesday"
                    value={formData.availability.tuesday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('tuesday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="wednesday">
                    Miércoles
                  </label>
                  <input
                    type="text"
                    id="wednesday"
                    value={formData.availability.wednesday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('wednesday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="thursday">
                    Jueves
                  </label>
                  <input
                    type="text"
                    id="thursday"
                    value={formData.availability.thursday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('thursday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="friday">
                    Viernes
                  </label>
                  <input
                    type="text"
                    id="friday"
                    value={formData.availability.friday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('friday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="saturday">
                    Sábado
                  </label>
                  <input
                    type="text"
                    id="saturday"
                    value={formData.availability.saturday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('saturday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sunday">
                    Domingo
                  </label>
                  <input
                    type="text"
                    id="sunday"
                    value={formData.availability.sunday.join(', ')}
                    onChange={(e) => handleAvailabilityChange('sunday', e)}
                    placeholder="ej. 09:00-10:00, 14:00-15:00"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/doctores')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctoresForm; 