# SISCON-ENOSA Frontend

Aplicación administrativa para el TPS académico **SISCON-ENOSA**: Sistema TPS de Control de Consumo Eléctrico.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Axios con JWT
- Chart.js / react-chartjs-2

## Ejecutar

```bash
npm install
npm run dev
```

Crear `.env` si la API no corre en `http://localhost:3000`:

```env
VITE_API_URL=http://localhost:3000
```

## Rutas principales

- `/login`
- `/dashboard`
- `/zonas`, `/zonas/nueva`
- `/suministros`, `/suministros/nuevo`
- `/medidores`, `/medidores/nuevo`
- `/lecturas`, `/lecturas/nueva`
- `/importar`
- `/reportes`
- `/incidencias`

El dashboard consume endpoints resumidos del backend; NO carga datasets completos.
