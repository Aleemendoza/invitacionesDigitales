# ADR: Single Event URL and guest identification

An event has one human-readable public URL. Guest identity is established inside that event through `open`, `name_lookup`, or `name_and_code` access. This keeps sharing, QR codes, lifecycle content and template rendering simple while preserving personalized links for controlled communications and check-in.

The universal link never contains a guest identifier or PIN. Guest sessions are separate from host authentication and scoped to one event and group.
