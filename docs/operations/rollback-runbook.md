# Runbook de rollback e incidentes

## Principio

El rollback de aplicación debe ser independiente de un rollback destructivo de base de datos. Todas las migraciones de lanzamiento usan expand/contract: primero se agregan estructuras compatibles, luego se migra el uso y la eliminación queda para otro despliegue con evidencia de que ningún consumidor depende de ellas.

## Rollback de aplicación

1. Declarar incidente y congelar nuevos despliegues.
2. Identificar el último deployment Vercel sano y su commit.
3. Promover ese deployment desde Vercel o revertir el commit mediante PR; no ejecutar `git reset` ni editar producción manualmente.
4. Mantener las migraciones aditivas aplicadas.
5. Ejecutar el smoke mínimo y observar errores durante 30 minutos.
6. Documentar línea temporal, impacto y causa; abrir acciones correctivas antes de reintentar.

## Contención por dominio

- **Pagos/webhook:** detener campañas, conservar todos los eventos recibidos, no aprobar manualmente Mercado Pago y reconciliar con la API del proveedor. Nunca degradar un pago aprobado.
- **Publicación:** deshabilitar temporalmente nuevos checkouts o publicaciones desde configuración operativa si existe; no cambiar masivamente estados sin consulta y respaldo.
- **Storage:** detener uploads si hay contenido inseguro o cuotas rotas; conservar objetos para investigación y evitar borrados masivos.
- **Autorización/PII:** revocar el secreto comprometido, restringir la ruta afectada, preservar auditoría mínima y activar el proceso legal de incidentes.
- **Base de datos:** ante corrupción, detener escrituras y seguir el runbook de restauración; no aplicar SQL correctivo improvisado.

## Criterios de resolución

El servicio vuelve a estado normal sólo cuando el recorrido afectado pasa, las métricas regresan a su línea base y el responsable confirma que no quedan pagos o datos inconsistentes. Un postmortem sin culpables debe incluir causa raíz, detección, impacto, recuperación y acciones con dueño y fecha.
