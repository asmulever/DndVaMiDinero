# ¿Dónde Va Mi Dinero? 💸📍

**¿Dónde Va Mi Dinero?** es una **calculadora de presupuesto mensual** diseñada para ayudar a personas comunes a **entender en qué se les va el dinero**, analizar hábitos de gasto y tomar mejores decisiones financieras.  
La aplicación incorpora **geolocalización** para enriquecer el análisis de gastos según ubicación (ciudad / país), sin complejidad innecesaria.

---

## 🎯 Objetivo de la aplicación

- Visualizar claramente **ingresos vs gastos**
- Detectar **fugas de dinero**
- Clasificar gastos personales de forma simple
- Analizar gastos considerando **contexto geográfico**
- Ser **liviana, rápida y fácil de usar**

---

## 🧩 Funcionalidades principales

- ✅ Carga manual de ingresos y gastos
- ✅ Clasificación por categorías (comida, transporte, alquiler, ocio, etc.)
- ✅ Cálculo automático de:
  - Total gastado
  - Balance mensual
  - Porcentaje de gasto por categoría
- ✅ Geolocalización automática del usuario (por IP)
- ✅ Visualización del gasto según ciudad / país
- ✅ Interfaz clara orientada a público general
- ✅ Sin necesidad de registro (modo simple)

---

## 🌍 Geolocalización

La aplicación utiliza **geolocalización aproximada por IP** para:

- Identificar país y ciudad del usuario
- Adaptar contexto económico (ej: moneda, hábitos)
- Analizar patrones de gasto por región

> ⚠️ No se almacena información sensible ni coordenadas exactas.  
> La geolocalización es **orientativa**, no invasiva.

---

## 🛠️ Stack tecnológico

- **Backend:** .NET Core / ASP.NET Core
- **Frontend:** Razor / HTML / CSS / JavaScript
- **Geolocalización:** API pública por IP (ej. ip-api / similar)
- **Persistencia:** Opcional (modo demo sin base de datos)
- **Hosting:** Compatible con hosting gratuito ASP.NET

---

## 🚀 Ejecución local

```bash
dotnet restore
dotnet build
dotnet run
