# MET Practice App

Aplicacion web para practicar el Michigan English Test (MET) con ejercicios interactivos y seguimiento de progreso.

## Tech Stack

- Next.js 13 (App Router)
- React 18 + TypeScript
- Tailwind CSS + componentes UI en components/ui
- Supabase (auth + base de datos)

## Requisitos

- Node.js 18+
- npm
- Variables de entorno para Supabase

## Variables de entorno

Crea un archivo .env local con:

NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

Tambien puedes copiar .env.example como base para configurar preview y produccion.

## Scripts

- npm run dev: inicia el servidor de desarrollo
- npm run build: compila para produccion
- npm run start: levanta el build de produccion
- npm run lint: ejecuta lint con reglas de Next.js
- npm run typecheck: valida tipos con TypeScript

## Estructura principal

- app: rutas y paginas con App Router
- components: componentes compartidos y UI
- hooks: logica reutilizable de negocio
- contexts: estado global (auth)
- lib/supabase: cliente y tipos relacionados
- supabase/migration: migraciones SQL

## Estado actual

- El limite diario para usuarios free esta aplicado en Grammar, Reading y Vocabulary.
- El proyecto compila y pasa typecheck.

## Checklist para publicar

1. Ejecutar migraciones de Supabase en orden cronologico, incluyendo la de seguridad y RLS.
2. Configurar variables de entorno en el proveedor de despliegue (Netlify).
3. Verificar que CI pase en main: lint, typecheck, test y build.
4. Probar flujo completo en preview: registro, login, practica y dashboard.
5. Publicar a produccion.

## Proximo paso recomendado

Agregar pruebas automatizadas para hooks criticos como limite diario, suscripcion y progreso de metas.
