# Runbook de observabilidad

## Señales obligatorias

- Tasa y latencia p95 de respuestas, separadas por ruta y código.
- Fallos de checkout, webhook, reconciliación y publicación.
- Fallos y cuota de Storage, respuestas 429 y lockouts.
- Core Web Vitals p75 y fallos por paso del funnel.
- Estado y duración de backups, restore drills y jobs programados.

Los logs de servidor son JSON y deben incluir `event`, `level`, `timestamp` y, cuando exista, correlation ID. No enviar PII, cookies, códigos, respuestas, datos bancarios ni secretos. Los identificadores técnicos deben ser opacos.

## Alertas iniciales

- 5xx > 2% durante 5 minutos: crítica.
- Webhook o checkout con 5 fallos en 5 minutos: crítica.
- Pago pendiente fuera de la ventana de reconciliación: alta.
- Publicación fallida tras pago aprobado: crítica e inmediata.
- Storage 5xx o cuota > 80%: alta.
- Backup ausente/fallido: crítica.

Antes del canary, conectar estas señales al proveedor elegido, definir canal primario y escalamiento, y disparar una alerta sintética de cada severidad. Sin credenciales configuradas, la presencia del logger no equivale a monitoreo operativo completo.
