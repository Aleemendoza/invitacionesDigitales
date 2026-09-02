# Documentación de Papeleta

Última revisión: 1 de septiembre de 2026.

Este directorio es la fuente de verdad compartida para producto, negocio,
ingeniería y operación. Describe el código actual y marca como pendiente aquello
que depende de infraestructura, credenciales, decisiones legales o trabajo aún
no implementado.

## Lectura recomendada

1. [Contexto y modelo de negocio](business-context.md)
2. [Producto, planes y reglas comerciales](product-model.md)
3. [Arquitectura del sistema](architecture.md)
4. [Datos, autorización y seguridad](data-security.md)
5. [APIs y flujos críticos](api-flows.md)
6. [Guía de ingeniería](engineering-guide.md)
7. [Pipeline, entornos y despliegue](pipeline.md)
8. [Preparación para producción](production-readiness.md)
9. [Glosario compartido](glossary.md)

## Decisiones y operación

- [ADR-001: un solo link público por evento](ADR-001-single-event-link.md)
- [Despliegue](operations/deployment-runbook.md)
- [Rollback e incidentes](operations/rollback-runbook.md)
- [Observabilidad](operations/observability-runbook.md)
- [Backups y restauración](operations/backup-restore-runbook.md)
- [Rotación de secretos](operations/secret-rotation-runbook.md)

## Convenciones de estado

| Estado | Significado |
| --- | --- |
| Implementado | Existe en el repositorio y tiene validación proporcional. |
| Configuración externa | El código existe, pero falta configurar o comprobar un proveedor. |
| Pendiente | Todavía requiere implementación o una decisión. |
| Gate | Debe estar resuelto antes de canary o producción. |

Ante una contradicción, el orden de autoridad es: comportamiento probado del
código, migraciones versionadas, ADR vigente, esta documentación y material
histórico. Toda diferencia relevante debe resolverse actualizando código y docs
en el mismo pull request.
