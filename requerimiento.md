# DndVaMiDinero — Plan de desarrollo y requerimientos (MVP) para Somee.com (plan gratuito)

## 0. Resumen ejecutivo
**Objetivo:** publicar una herramienta web liviana (una sola pantalla principal) que permita al usuario cargar ingresos y gastos mensuales por categorías, obtener un **diagnóstico** (Sano/Ajustado/Crítico), recomendaciones simples y un CTA hacia recursos externos (afiliación futura).  
**Restricciones clave:** hosting gratuito Somee con **publicidad forzada**, recursos limitados y necesidad de **frontend liviano**.

---

## 1. Alcance y límites

### 1.1 Alcance (incluido)
- Página principal con:
  - Formulario de ingresos y gastos por categorías.
  - Cálculo en tiempo real (client-side).
  - Resumen total: gastos, balance, % por categoría.
  - Diagnóstico automático con reglas simples.
  - Recomendaciones accionables (texto corto).
  - CTA externo (link configurable).
- Página legal mínima:
  - “Privacidad” (sin almacenamiento de datos personales).
  - “Disclaimer” (no asesoramiento financiero).
- Layout responsive (mobile-first).
- Sin dependencias pesadas (no frameworks SPA, sin bundlers).

### 1.2 Fuera de alcance (NO incluido)
- Registro/login de usuarios.
- Persistencia en base de datos (MS SQL NO se usa en MVP).
- Historial de presupuestos por usuario.
- Panel admin, CMS, carga de contenidos.
- Internacionalización completa por país (solo selector de moneda + formato).
- Integraciones con bancos, scraping, APIs externas.
- Publicidad programática (AdSense) o gestión avanzada de anuncios.
- PWA, notificaciones push, offline mode.

---

## 2. Público objetivo y propuesta de valor
- **Público:** usuarios generalistas LATAM (no técnicos) que buscan “calculadora presupuesto mensual”, “en qué se va mi dinero”, “cómo organizar gastos”.
- **Valor:** en 30 segundos, ver situación real y “fugas” de gasto con recomendaciones claras.

---

## 3. Arquitectura técnica (liviana y compatible con Somee)

### 3.1 Opción recomendada (MVP)
- **App web estática + hosting ASP.NET Core mínimo**
  - `ASP.NET Core` (Minimal hosting) solo para servir archivos estáticos y páginas.
  - Cálculos 100% en **JavaScript** en el navegador.
- Ventajas: ultra simple, bajo consumo, despliegue fácil en IIS/Somee.

### 3.2 Tecnologías
- Backend: **ASP.NET Core 8** (o 7 si el plan lo requiere).
- Frontend: HTML5 + CSS3 + JavaScript (ES6).
- Sin frameworks JS (React/Vue/Angular fuera de alcance).
- Fuentes: Google Fonts (1 familia) o system font fallback.
- Analytics: opcional y liviano (si se decide; por defecto no incluir).

### 3.3 Estructura de carpetas sugerida
/wwwroot
/assets
/css
styles.css
/js
app.js
/img
logo.svg (opcional)
index.html
privacy.html
disclaimer.html
Program.cs
appsettings.json (mínimo)

markdown
Copiar código

---

## 4. Requerimientos funcionales (FR)

### FR-001 — Formulario de entrada
- Campos:
  - Moneda: selector (ARS, MXN, COP, CLP, PEN, UYU, USD) + símbolo.
  - Ingresos mensuales (number, requerido, >= 0).
  - Categorías de gasto (number, >= 0):
    - Vivienda (alquiler/hipoteca)
    - Servicios (luz/agua/gas/internet)
    - Comida
    - Transporte
    - Deudas (cuotas/tarjetas/préstamos)
    - Salud
    - Educación
    - Ocio
    - Otros
- UX:
  - Inputs con separador de miles visual (no obligatorio a nivel parsing).
  - Botón “Limpiar” y “Cargar ejemplo” (demo).

### FR-002 — Cálculo y resumen
- Cálculos:
  - `totalGastos = suma(categorías)`
  - `balance = ingresos - totalGastos`
  - `%PorCategoria = categoria / ingresos * 100` (si ingresos > 0)
- Mostrar:
  - Total gastos
  - Balance mensual
  - Barra o lista con % por categoría (sin gráficos pesados; usar barras CSS).
  - Indicador “Ahorro estimado” si balance > 0 (balance como ahorro).

### FR-003 — Diagnóstico automático (reglas)
- Salida: badge + texto corto + lista de alertas (máx. 5).
- Reglas base (sobre ingresos):
  - Vivienda > 35% ⇒ alerta “Vivienda alta”.
  - Deudas > 30% ⇒ alerta “Deuda alta”.
  - Comida > 25% ⇒ alerta “Comida alta”.
  - Servicios > 15% ⇒ alerta “Servicios altos”.
  - Balance < 0 ⇒ estado “Crítico”.
  - Balance entre 0% y 10% ⇒ estado “Ajustado”.
  - Balance >= 10% ⇒ estado “Sano”.
- Si ingresos = 0:
  - deshabilitar % y diagnóstico (mostrar mensaje “Ingresos 0: no se puede diagnosticar”).

### FR-004 — Recomendaciones accionables
- Generar 2–4 sugerencias basadas en alertas:
  - Ej.: “Revisá servicios recurrentes”, “Priorizar pago de deuda”, “Tope semanal de ocio”.
- No usar lenguaje de asesoramiento financiero (“deberías invertir en X” está prohibido).

### FR-005 — CTA externo configurable
- Bloque final: “Siguiente paso” + botón.
- URL configurable por constante en `app.js`:
  - `const CTA_URL = "https://..."`.
- Tracking opcional por evento (si se implementa analytics).

### FR-006 — Páginas legales mínimas
- `privacy.html`: declarar:
  - no se recopilan datos personales,
  - no se almacenan presupuestos (todo en el navegador),
  - cookies (solo si aplica).
- `disclaimer.html`:
  - herramienta educativa,
  - no asesoramiento financiero,
  - usuario responsable de decisiones.

---

## 5. Requerimientos no funcionales (NFR)

### NFR-001 — Performance
- Peso objetivo de página principal (sin ads del hosting):
  - HTML < 30 KB
  - CSS < 50 KB
  - JS < 80 KB
  - Total assets propios < 200 KB
- Sin imágenes pesadas (máx. 1 SVG o PNG < 30 KB).

### NFR-002 — Responsividad
- Soporte mínimo:
  - Mobile 360px
  - Tablet 768px
  - Desktop 1366px+
- Mobile-first.

### NFR-003 — Accesibilidad básica
- Contraste AA aproximado.
- Labels correctos en inputs.
- Navegable con teclado.

### NFR-004 — Compatibilidad
- Últimas 2 versiones de Chrome/Edge/Firefox.
- Sin features experimentales.

### NFR-005 — Seguridad
- No hay auth ni backend de datos → superficie mínima.
- Sanitización básica (números).
- No loggear información ingresada.

---

## 6. Diseño UI/UX (estilos, colores, tipografía)

### 6.1 Principios visuales
- Estética “clean fintech” para aumentar confianza.
- Jerarquía fuerte: título → formulario → resultados → diagnóstico → CTA.
- Animaciones mínimas (transiciones CSS cortas) para retención.

### 6.2 Paleta de colores (explícita)
**Fondo principal:** `#0B1220` (azul noche)  
**Paneles/cards:** `#121A2B`  
**Bordes suaves:** `#22304A`  
**Texto principal:** `#E6EAF2`  
**Texto secundario:** `#A9B4CC`  
**Color acento primario:** `#5B8CFF` (botones/links)  
**Acento secundario:** `#22C55E` (estado sano)  
**Advertencia:** `#F59E0B` (ajustado)  
**Crítico:** `#EF4444` (crítico)  

### 6.3 Tipografía
- Opción A (recomendada): `Inter` (Google Fonts) con fallback:
  - `font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;`
- Tamaños:
  - H1: 28–34px (según viewport)
  - H2: 18–20px
  - Body: 14–16px
  - Labels: 13–14px

### 6.4 Componentes visuales
- **Header** (sticky opcional, no obligatorio):
  - Logo textual “DndVaMiDinero”
  - Links: “Privacidad”, “Disclaimer”
- **Card**:
  - border 1px `#22304A`
  - radius 16px
  - sombra suave: `0 10px 30px rgba(0,0,0,0.25)`
- **Inputs**:
  - background `#0F1729`, border `#22304A`, focus `#5B8CFF`
- **Botón primario**:
  - bg `#5B8CFF`, hover `#4879F5`, texto blanco
- **Badges de estado**:
  - Sano: fondo `rgba(34,197,94,0.15)` + texto `#22C55E`
  - Ajustado: fondo `rgba(245,158,11,0.15)` + texto `#F59E0B`
  - Crítico: fondo `rgba(239,68,68,0.15)` + texto `#EF4444`

### 6.5 Animaciones (mínimas)
- Transición cards: `transform 120ms ease`, `box-shadow 120ms ease`
- Mostrar resultados con fade-in: `opacity 160ms ease` (sin librerías)

---

## 7. Pantallas y layout

### 7.1 Página principal (index)
Secciones en orden:
1. Hero: título + subtítulo + 1 frase de confianza (“No guardamos tus datos”).
2. Formulario (card):
   - moneda + ingresos
   - categorías de gasto (grid 1 col mobile, 2 col desktop)
   - botones: “Limpiar”, “Cargar ejemplo”
3. Resultados (card):
   - total gastos, balance, ahorro
   - barras por categoría (CSS)
4. Diagnóstico (card):
   - badge de estado
   - lista de alertas
   - recomendaciones
5. CTA (card):
   - texto breve
   - botón externo

### 7.2 Privacidad / Disclaimer
- Plantilla simple con card central.
- Links de vuelta.

---

## 8. Reglas de contenido (copy) — límites
- No prometer “ganancias”, “inversiones”, “retornos”.
- No dar asesoramiento individualizado.
- Recomendaciones genéricas y prudentes.

---

## 9. Configuración y parametrización
En `app.js` definir constantes:
- `DEFAULT_CURRENCY = "USD"`
- `CTA_URL = "https://example.com"`
- `CTA_TEXT = "Ver recursos recomendados"`
- Umbrales de diagnóstico (porcentaje) centralizados:
  - `TH_HOUSING = 0.35`, `TH_DEBT = 0.30`, etc.

---

## 10. Plan de desarrollo (tareas)

### Fase 1 — Base (0.1)
- Crear proyecto ASP.NET Core minimal.
- Servir `wwwroot` estático.
- Crear HTML base + layout responsive + variables CSS.

### Fase 2 — Lógica (0.2)
- Implementar cálculo: totales, porcentajes, balance.
- Implementar diagnóstico con reglas.
- Render resultados y estados.

### Fase 3 — UX (0.3)
- Validaciones input.
- “Cargar ejemplo” y “Limpiar”.
- Animaciones mínimas y accesibilidad básica.

### Fase 4 — Legal + deploy (1.0)
- Páginas privacy/disclaimer.
- Ajustes SEO mínimos (title/description).
- Deploy Somee.

---

## 11. SEO mínimo (sin contenido extra)
- `<title>`: `DndVaMiDinero | Calculadora de presupuesto mensual`
- `<meta name="description">`: `Calculá tus gastos mensuales, detectá fugas y obtené un diagnóstico simple en segundos.`
- H1 único + H2 subtítulo.
- OpenGraph básico (opcional).

---

## 12. Criterios de aceptación (Definition of Done)
- La página carga en < 2s en conexión media (sin considerar ads del hosting).
- Cálculos correctos con inputs típicos (0, grandes, vacíos).
- Diagnóstico:
  - cambia correctamente entre Sano/Ajustado/Crítico.
  - muestra alertas coherentes.
- Responsive validado en 360px y 1366px.
- No hay llamadas a backend ni almacenamiento de datos personales.
- CTA externo configurable por constante.
- Publicado y accesible en Somee.

---

## 13. Riesgos y mitigaciones
- **Ads forzadas** reducen conversión:
  - Mitigar con layout limpio, CTA visible, performance alta.
- **SEO limitado por single-page**:
  - Mitigar con copy fuerte + long-tail en title/headers.
- **Expectativa de “guardar datos”**:
  - Mitigar con mensaje claro “no guardamos tus datos”.

---

## 14. Entregables
- Código fuente proyecto ASP.NET Core (Minimal).
- Archivos estáticos `index.html`, `privacy.html`, `disclaimer.html`.
- `styles.css` con paleta y componentes.
- `app.js` con lógica y configuración.
- Documento breve de deploy Somee (pasos).