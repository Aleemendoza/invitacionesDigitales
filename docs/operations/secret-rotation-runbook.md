# Runbook de rotación de secretos

## Inventario mínimo

| Secreto | Ámbito | Rotación |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Sólo servidor | Al sospechar exposición y según política |
| `GUEST_ACCESS_TOKEN_SECRET` | Sólo servidor, exclusivo | Programada y ante exposición |
| `MERCADOPAGO_ACCESS_TOKEN` | Sólo servidor | Según proveedor y ante exposición |
| `MERCADOPAGO_WEBHOOK_SECRET` | Sólo servidor | Según proveedor y ante exposición |
| `MERCADOPAGO_USER_ID` | Sólo servidor, identifica la cuenta receptora | Al cambiar de cuenta |
| claves públicas Supabase/analítica | Cliente | Cuando cambie el proyecto o proveedor |

Nunca reutilizar `SUPABASE_SERVICE_ROLE_KEY` como secreto de sesiones. Mantener valores diferentes por entorno y almacenarlos en el gestor de Vercel/GitHub, no en archivos versionados, logs, tickets o mensajería.

## Procedimiento

1. Declarar responsable, entornos y ventana; identificar consumidores sin copiar el valor.
2. Crear la nueva credencial en el proveedor.
3. Si el proveedor permite solapamiento, desplegar primero el nuevo valor, verificar y revocar el anterior. Si no, usar una ventana coordinada de mínimo impacto.
4. Redeployar las funciones/aplicación que capturen variables al arranque.
5. Ejecutar health y smoke del dominio afectado.
6. Revocar el valor anterior y comprobar que ya no autentica.
7. Registrar sólo identificador de credencial, fecha, responsable y resultado.

Rotar inmediatamente ante aparición en Git, logs, artefactos, capturas o sistemas no autorizados. Además, revisar accesos, alcance temporal y necesidad de notificación; borrar el texto visible no invalida una credencial filtrada.
