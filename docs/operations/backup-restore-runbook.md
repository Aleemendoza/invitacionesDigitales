# Runbook de backup y restauración

## Objetivos

- RPO inicial: máximo 24 horas.
- RTO inicial: máximo 4 horas.
- La base de datos y Storage se protegen por mecanismos separados.

Estos objetivos son gates, no garantías automáticas. Antes del canary se debe comprobar en el plan contratado de Supabase la retención real de backups/PITR y documentar responsable, región y ventana.

## Base de datos

1. Habilitar backups administrados y PITR cuando el plan lo permita.
2. Revisar diariamente el estado y alertar por backup ausente o fallido.
3. Antes de una migración de riesgo, generar un respaldo verificable según las herramientas soportadas por Supabase.
4. No guardar dumps con PII en equipos personales ni en el repositorio. Cifrarlos, restringir acceso y aplicar retención.

## Storage

1. Inventariar buckets, políticas, volumen y checksum/metadata de objetos.
2. Exportar de forma programada a un destino cifrado con cuenta y retención independientes.
3. Conservar el mapeo entre filas y rutas de Storage para poder validar referencias tras restaurar.
4. Probar archivos representativos de cada bucket; un backup de DB no demuestra que las fotos estén recuperables.

## Restore drill aislado

1. Crear un proyecto temporal aislado, nunca sobre staging o producción.
2. Restaurar el backup seleccionado y, por separado, los objetos de Storage.
3. Aplicar sólo migraciones posteriores necesarias y ejecutar verificaciones de integridad, conteos, RLS/grants y referencias a objetos.
4. Ejecutar smoke con identidades de prueba: owner, usuario ajeno, admin y público.
5. Medir pérdida temporal de datos y duración total contra RPO/RTO.
6. Eliminar el entorno temporal mediante el procedimiento autorizado y registrar fecha, backup, resultado y hallazgos.

Realizar el drill antes del canary, luego al menos trimestralmente y después de cambios importantes en esquema, buckets o proveedor.
