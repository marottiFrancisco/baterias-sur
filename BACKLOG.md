# Baterias del Sur — Backlog de desarrollo

Funcionalidades pendientes para el desarrollo final. Ordenadas por modulo.

---

## Ventas y cobros

### Descuento verbal de proveedor
Permitir ingresar manualmente un descuento puntual al registrar una venta o una compra, cuando el proveedor lo da de palabra. Deberia quedar registrado con quien lo autorizo y el motivo (ej: "descuento de cierre de mes", "descuento por volumen"). Distinto al descuento permanente por cliente.

### Retencion de tarjeta de credito
Cada metodo de pago con tarjeta deberia tener asociado un porcentaje de descuento que se aplica automaticamente (ej: Credito 1 cuota = -3%, Credito 3 cuotas = -5%, Debito = -1.5%). Al registrar el cobro con tarjeta, el sistema calcula automaticamente cuanto ingresa realmente al negocio vs. lo que se le cobro al cliente. Impacta en los reportes de rentabilidad y caja real.

### Nombre del cliente en cada venta
Revisar el flujo de registro: actualmente el mecanico carga el servicio pero no siempre sabe el nombre del cliente. Opciones a definir:
- El mecanico lo carga opcionalmente
- La administracion (priscila) completa el nombre al revisar los registros pendientes
- Se sugiere el nombre automaticamente si el numero de expediente coincide con un cliente registrado

### Expediente vinculado a aseguradora
Si el numero de expediente sigue un patron conocido (ej: prefijo por compania), el sistema deberia mostrar automaticamente el nombre de la aseguradora asociada. Crear una tabla de aseguradoras con sus prefijos/patrones de expediente. Cuando el mecanico ingresa el numero, aparece el nombre de la aseguradora sugerido.

---

## Caja y contabilidad

### Cajas que impactan o no en la cuenta del negocio
Posibilidad de crear movimientos de caja marcados como "a cuenta del negocio" o "gasto personal del dueno pasado por el negocio". Ejemplo: el dueno compra ruedas para su camioneta pero lo registra en el negocio para aprovechar el IVA. El sistema debe separar ambos tipos en los reportes para no mezclar la rentabilidad real del negocio con gastos personales.

### Gastos del negocio
Modulo completo de egresos:
- **Gastos fijos**: alquiler, sueldos, servicios (luz, gas, internet), seguro. Se cargan una vez y el sistema los proyecta mes a mes automaticamente.
- **Gastos variables**: combustible, herramientas, materiales. Se cargan cuando ocurren.
- **Gastos en cuotas**: si se pago algo en cuotas (ej: equipo nuevo en 12 cuotas), el sistema registra el total y distribuye el impacto mes a mes para proyeccion de flujo de caja.
- **Proyeccion**: vista de los proximos 3-6 meses con gastos fijos comprometidos vs. facturacion esperada.

### Retenciones
Modulo contable para registrar y hacer seguimiento de:
- Retenciones de Ganancias, IVA e Ingresos Brutos que les hacen a ellos como proveedor
- Retenciones que ellos deben hacer a sus proveedores
- Padrones de retenciones (consulta o carga manual)
- Posicion de IVA mensual: debito fiscal (ventas) vs. credito fiscal (compras)
- Resumen para entregar al contador

---

## Mecanicos

### Pantalla de checklist pre-servicio (bloqueante)
Al hacer login el mecanico, antes de poder registrar cualquier servicio, debe aparecer una pantalla que bloquea el acceso y le pide confirmar que tiene todo lo necesario en la camioneta para trabajar. Ejemplo de checklist:
- [ ] Llave de ruedas
- [ ] Cargador / probador de bateria
- [ ] Herramientas basicas (destornilladores, alicates, llaves)
- [ ] EPP (guantes, gafas)
- [ ] Stock de baterias cargado
- [ ] Documentacion del vehiculo al dia

Solo puede continuar al dashboard si marca todos los items. Esto queda registrado con fecha y hora como "inicio de turno confirmado". Si falta algo, puede igualmente avanzar pero queda marcado como "checklist incompleto" (para que el admin lo vea).

---

## Inventario

### Herramientas del negocio
Modulo separado del stock de baterias para llevar registro de herramientas y equipos:
- Herramientas personales de cada mecanico (quien es responsable de cada una)
- Herramientas de la empresa prestadas a los mecanicos
- Estado de cada herramienta (buena, requiere mantenimiento, rota)
- Historial de mantenimiento o reemplazo
- Alerta cuando una herramienta lleva mucho tiempo sin revision

---

## Mejoras tecnicas pendientes

- Migrar de `localStorage` a base de datos real (cuando escale a multiples dispositivos simultaneos)
- Login con hash de contrasena (actualmente en texto plano en `data.js`)
- Exportacion de reportes a PDF o Excel
- Backup automatico de datos
