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

## Checklist final de release (CI/CD + Netlify + smoke test)

### 1) CI en GitHub Actions

El workflow existente en .github/workflows/ci.yml ya valida:

- npm run lint
- npm run typecheck
- npm run test
- npm run build

Antes de release, confirma que el ultimo commit en main tenga CI en estado exitoso.

### 2) Variables de entorno en Netlify

Configura estas variables para Production y Preview:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_PAYMENT_PROVIDER
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID_PRO_MONTHLY
- STRIPE_PRICE_ID_PRO_YEARLY
- STRIPE_PRICE_ID_PREMIUM_MONTHLY
- STRIPE_PRICE_ID_PREMIUM_YEARLY
- MERCADOPAGO_ACCESS_TOKEN
- MERCADOPAGO_CURRENCY_ID
- MERCADOPAGO_PRICE_PRO_MONTHLY
- MERCADOPAGO_PRICE_PRO_YEARLY
- MERCADOPAGO_PRICE_PREMIUM_MONTHLY
- MERCADOPAGO_PRICE_PREMIUM_YEARLY

### 3) Smoke test de preview

Con el deploy de Preview listo, valida como minimo:

1. Landing carga sin errores visuales ni de consola.
2. Registro y login funcionan correctamente.
3. Dashboard carga progreso, retos y objetivos.
4. Rutas de practica (Grammar, Reading, Vocabulary, Writing) renderizan y permiten interaccion basica.
5. Flujo de pricing inicia checkout con el proveedor activo.
6. Endpoints API responden sin error 5xx:
	- /api/stripe/checkout
	- /api/stripe/webhook
	- /api/mercadopago/checkout
	- /api/mercadopago/webhook

### 4) Smoke test de produccion

Repite el mismo checklist en dominio productivo y valida:

- NEXT_PUBLIC_APP_URL apuntando al dominio final.
- Webhooks de Stripe/MercadoPago configurados con URLs de produccion.

### 5) Cierre de release

1. Crear tag de release en main.
2. Publicar notas de release con fecha y cambios principales.
3. Monitorear errores de runtime durante las primeras 24 horas.

## Proximo paso recomendado

Agregar pruebas automatizadas para hooks criticos como limite diario, suscripcion y progreso de metas.

## Activar cobro real con Stripe

1. Define estas variables de entorno en tu hosting (ej. Vercel):
	- NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
	- STRIPE_SECRET_KEY
	- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
	- STRIPE_WEBHOOK_SECRET
	- STRIPE_PRICE_ID_PRO_MONTHLY
	- STRIPE_PRICE_ID_PRO_YEARLY
	- STRIPE_PRICE_ID_PREMIUM_MONTHLY
	- STRIPE_PRICE_ID_PREMIUM_YEARLY
	- NEXT_PUBLIC_APP_URL
2. Ejecuta validacion automatica:
	- npm run verify:stripe
3. Si la validacion pasa, publica/redeploya.
4. Configura webhook en Stripe:
	- URL: https://tu-dominio.com/api/stripe/webhook
	- Eventos minimos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
5. Haz una compra real de bajo monto para confirmar end-to-end.
