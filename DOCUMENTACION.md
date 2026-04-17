# Baterias del Sur — Documentacion del proyecto

## Que se hizo

El archivo original `index.html` concentraba todo el codigo en un unico archivo de ~2500 lineas (HTML + CSS + JavaScript). Se separo en multiples archivos organizados por responsabilidad.

---

## Estructura de archivos resultante

```
baterias/
├── index.html          ← Solo HTML (estructura y paneles)
├── css/
│   └── styles.css      ← Todo el CSS (variables, layout, componentes)
└── js/
    ├── data.js         ← Base de datos estatica: DB (213 registros), STOCK_DB, USERS, constantes
    ├── utils.js        ← Funciones de uso global: fmt$, badges de servicio/pago, colores por mecanico
    ├── storage.js      ← localStorage: sesion, registros pendientes, ediciones, prestamos
    ├── ventas.js       ← Tabla de ventas, filtros, modal de edicion, KPIs del resumen
    ├── caja.js         ← Resumen de caja por dia o periodo, desglose por metodo de pago y mecanico
    ├── stock.js        ← Tabla de inventario por marca, KPIs de stock
    ├── proveedores.js  ← Comparador de cotizaciones, carga de Excel, modelos mas colocados
    ├── reportes.js     ← Graficos de evolucion, metricas por servicio/pago/mecanico
    ├── rentabilidad.js ← Margen por producto, ganancia por canal, calculadora, graficos
    ├── competencia.js  ← Simulador de impacto de precio en Mercado Libre
    ├── mecanico.js     ← Dashboard del mecanico: registro de servicio, historial del dia
    ├── garantias.js    ← Prestamos de bateria durante garantia: alta, devolucion, listado
    ├── auth.js         ← Login, logout, roles (admin / admin_ventas / mecanico), restricciones
    └── app.js          ← Navegacion entre paneles, grafico de resumen, init de la app
```

## Orden de carga de scripts

El orden importa porque cada archivo depende del anterior:

```
data.js → utils.js → storage.js → [modulos] → auth.js → app.js
```

## Sistema de roles

| Usuario | Rol | Acceso |
|---|---|---|
| admin | admin | Panel completo |
| priscila | admin_ventas | Solo: Ventas, Garantias, Clientes, Logistica, AFIP |
| cristian / tomas / santi / juan | mecanico | Solo dashboard de registro de servicios |

## Persistencia

Todo se guarda en `localStorage` del navegador:
- `bds_session` — sesion activa
- `bds_recs` — registros nuevos enviados por mecanicos (pendientes de revision)
- `bds_edits` — ediciones manuales sobre registros de la DB estatica
- `bds_loans` — prestamos de bateria durante garantia

Los mecanicos registran desde su dispositivo y el admin ve los nuevos registros con un badge rojo en la tab "Ventas".
