# ADR-036: Todo cambio llega a `main` por pull request

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

ADR-035 protegió `main` exigiendo la CI en verde en el commit que entra, pero sin pull request. El responsable del proyecto prefiere que todo cambio pase por una PR: deja un registro por cambio, con su diff, su CI y su conversación, y es el mismo camino que ya siguen Renovate y "Version Packages".

Los dos costes por los que ADR-035 descartó la PR siguen siendo ciertos, así que esta decisión tiene que resolverlos:

- Con una sola persona con permisos de escritura, una revisión obligatoria no se puede cumplir: nadie aprueba su propia PR.
- Squash y rebase reescriben los commits. La rama de trabajo de larga duración, `feat/componentes`, dejaría de coincidir con `main` tras cada fusión.

## Decisión

`main` se protege con estas reglas, que también se aplican a los administradores:

| Regla | Valor |
|---|---|
| Pull request obligatoria | Sí |
| Aprobaciones necesarias | 0 |
| Comprobación obligatoria | `lint → typecheck → test → build`, de GitHub Actions |
| Rama al día antes de fusionar | Sí |
| Forma de fusionar | Solo merge commit |
| Historia lineal | No |
| Push forzado | No |
| Borrado de la rama | No |

Las PR se fusionan con **merge commit**, y el repositorio no ofrece squash ni rebase. Los commits de la rama llegan a `main` tal cual, y después la rama de trabajo avanza hasta `main` con un fast-forward.

El commit de fusión lleva el título y la descripción de la PR, así que `git log --first-parent main` es la lista de cambios.

La CI vuelve a ejecutarse en las PR y en `main`, no en cada push a cualquier rama: la comprobación obligatoria la aporta la PR.

El borrado automático de la rama al fusionar sigue desactivado, porque la rama de trabajo es de larga duración.

El flujo queda así:

```bash
git push origin feat/componentes
gh pr create --base main --fill    # o desde la web de GitHub
gh pr merge --merge                # cuando la CI está en verde
git pull --ff-only origin main     # la rama vuelve a coincidir con main
```

## Alternativas descartadas

- **Mantener ADR-035: CI obligatoria sin PR.** Da la misma garantía técnica, pero no deja el registro por cambio que se quiere.
- **Squash con historia lineal.** Deja un commit por PR, pero reescribe los commits. Con una rama de larga duración obliga a rehacerla tras cada fusión; si se olvida, la siguiente PR arrastra commits ya fusionados y conflictos. Es la opción adecuada si algún día se trabaja con ramas cortas, una por cambio.
- **Exigir una aprobación.** Con una sola persona, cada PR quedaría bloqueada.
- **Aplicar las reglas a todos menos a los administradores.** La única persona con acceso es administradora: la regla no se aplicaría a nadie.

## Consecuencias

- Nada entra en `main` sin una PR con la CI en verde. Un push directo se rechaza, también el de un administrador.
- `main` deja de ser lineal: cada PR añade un commit de fusión.
- Tras fusionar hay que avanzar la rama de trabajo con `git pull --ff-only origin main`. Si no se hace, la siguiente PR pide ponerse al día y el botón "Update branch" lo resuelve.
- La PR "Version Packages" la crea `github-actions[bot]` y GitHub retiene su CI hasta que alguien la aprueba en la propia PR. Es condición para fusionarla.
- La regla depende del nombre del job de `ci.yml`. Si se renombra, hay que actualizar la protección en el mismo cambio; de lo contrario `main` queda bloqueada.
- En una emergencia con la CI caída, un administrador tiene que desactivar la regla a propósito desde los ajustes del repositorio. No hay atajo.
- Cuando haya una segunda persona con permisos de escritura, basta subir las aprobaciones necesarias de 0 a 1.
