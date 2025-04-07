# Control de Pacientes Web

Sistema de gestión de pacientes web diseñado siguiendo la arquitectura Screaming.

## Estructura del Proyecto

La estructura del proyecto está organizada por dominios de negocio:

```
/control-pacientes-web
  /src
    /core                  # Lógica central y modelos de dominio
      /domain
        /models            # Entidades y modelos de dominio
        /interfaces        # Interfaces relacionadas con el dominio
      /utils               # Utilidades generales del núcleo
    
    /features              # Características/módulos principales organizados por dominio
      /pacientes           # Todo lo relacionado con la gestión de pacientes
        /components        # Componentes UI específicos de pacientes
        /services          # Servicios de lógica de negocio para pacientes
        /interfaces        # Interfaces y tipos relacionados con pacientes
        /hooks             # Hooks personalizados para la funcionalidad de pacientes
      
      /citas               # Todo lo relacionado con citas médicas
      /historialMedico     # Gestión de historiales médicos
      /doctores            # Gestión de médicos y personal
      /auth                # Autenticación y autorización
      /notificaciones      # Sistema de notificaciones
      /facturacion         # Sistema de facturación
    
    /shared                # Componentes, utilidades y servicios compartidos
      /components          # Componentes UI reutilizables
      /utils               # Utilidades compartidas
      /hooks               # Hooks personalizados compartidos
      /services            # Servicios compartidos
    
    /infrastructure        # Código relacionado con servicios externos e infraestructura
      /api                 # Cliente API y configuración
      /storage             # Almacenamiento (local, cookies, etc.)
      /config              # Configuración de la aplicación
  
  /public                  # Archivos estáticos
  /tests                   # Pruebas
```

## Ventajas de la Arquitectura Screaming

- **Enfoque en el dominio**: La estructura del código refleja claramente el propósito del sistema.
- **Separación de preocupaciones**: Cada característica tiene sus propios componentes, servicios y lógica.
- **Escalabilidad**: Fácil de extender con nuevas características o módulos.
- **Mantenibilidad**: Código organizado y fácil de navegar.
- **Trabajo en equipo**: Facilita que diferentes equipos trabajen en diferentes características simultáneamente.

## Tecnologías

- Frontend: [Tecnología a definir] (React, Vue, Angular, etc.)
- Gestión de Estado: [A definir]
- Estilos: [A definir]
- Testing: [A definir]

## Instalación

```bash
# Clonar el repositorio
git clone [URL_REPOSITORIO]

# Instalar dependencias
cd control-pacientes-web
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

## Licencia

[Tipo de licencia] 