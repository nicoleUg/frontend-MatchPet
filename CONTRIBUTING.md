Contribuir al proyecto
======================

Flujo recomendado:

1. Crear una rama por tarea:

```bash
git switch -c feature/mi-descripcion
```

2. Hacer commits claros y atómicos. Usen mensajes tipo Conventional Commits, por ejemplo:

```
feat: mejorar flujo de registro
fix: corregir validación en presenter
docs: actualizar README
```

3. Subir la rama y abrir un Pull Request:

```bash
git push -u origin feature/mi-descripcion
```

4. Crear PR en GitHub hacia `main`. No mergear hasta que:
- Al menos 1 revisor apruebe.
- CI (lint/build) pase.

5. Mantener la rama actualizada con `main` antes del merge:

```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

Responsabilidades de equipo
- Revisar PRs de forma oportuna.
- Mantener PRs pequeños y con descripción clara.
- Dividir issues en subtareas para balancear la carga.
