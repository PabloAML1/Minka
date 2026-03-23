# Minka

Primera versión inicial del proyecto **Minka**. Este repositorio agrupa toda la configuración principal del entorno del proyecto, separándolo en diferentes componentes esenciales.

## ¿Qué es Minka? 🏗️
**Minka** es una aplicación web sencilla e intuitiva, pensada principalmente para su uso desde dispositivos móviles, orientada a los **trabajadores independientes y contratistas del sector de la construcción**. 

Nace en respuesta a la problemática común de la autoconstrucción o construcción informal, donde los presupuestos y el dinero de la obra se manejan "al ojo" o con acuerdos de palabra, provocando que los fondos se mezclen con gastos personales o se agoten a mitad del proyecto.

### Funcionalidades Principales
- **Registro de Obras y Presupuestos**: Permite registrar rápidamente una obra y definir su presupuesto inicial.
- **Control de Gastos**: Anotación ágil de gastos de **materiales** y **mano de obra**.
- **Seguimiento en Tiempo Real**: Cálculo automático que muestra cuánto dinero queda disponible evitando cuentas en papel.
- **Alertas de Límite**: Avisos automáticos cuando el gasto de la obra se está acercando al límite del presupuesto planificado, permitiendo tomar decisiones a tiempo.

**Objetivo**: Darle a los trabajadores de la construcción una herramienta fácil de usar que no requiera conocimientos técnicos, que no les quite mucho tiempo en su día a día y que les dé tranquilidad sobre sus finanzas en cada obra.

---

## Estructura del Repositorio

- **`/front-back`**: Contiene todo el código fuente de la aplicación principal (desarrollada con **Next.js** y **Prisma**). 
- **`docker-compose.yml`**: Configuración de contenedores con Docker para inicializar rápidamente servicios locales (la base de datos MySQL).

## Uso y Ejecución Local

1. Asegúrate de tener **Docker** instalado en tu sistema.
2. En la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`), levanta la base de datos local:
   ```bash
   docker-compose up -d
   ```
3. Luego, ingresa al directorio `front-back` y usa tu gestor de paquetes (como `npm`) para instalar dependencias y empezar el servidor en desarrollo:
   ```bash
   cd front-back
   npm install
   npm run dev
   ```

*(Recuerda configurar tus variables de entorno dentro del archivo `.env` en la carpeta `front-back` antes de iniciar los servicios de Prisma o conectar tu base de datos).*
