# ADR-035: `main` protegida: la CI es obligatoria en el commit, la PR no

**Estado:** Aceptado
**Fecha:** 2026-10-08

## Contexto

Desde la `0.1.0`, lo que llega a `main` tiene consecuencias fuera del repositorio: cada push despliega el Storybook público y actualiza la PR "Version Packages", y fusionar esa PR publica en npm (ADR-031). Hasta ahora `main` solo estaba protegida contra el push forzado y el borrado. Un commit roto podía entrar con un `git push`.

El repositorio tiene una sola persona con permisos de escritura. El trabajo se hace en una rama de larga duración, `feat/componentes`, y `main` avanza a ese mismo commit cuando la CI está en verde. La historia es lineal y los commits de `main` son los mismos que los de la rama.

GitHub ofrece dos formas de impedir que entre un commit sin comprobar:

- Exigir una pull request, con o sin revisión.
- Exigir que las comprobaciones hayan pasado en el commit que se empuja. Un push directo a `main` se acepta solo si ese commit ya tiene la comprobación en verde, por ejemplo porque se subió antes a otra rama.

## Decisión

`main` se protege con estas reglas, que también se aplican a los administradores:

| Regla | Valor |
|---|---|
| Comprobación obligatoria | `lint → typecheck → test → build`, de GitHub Actions |
| Rama al día antes de fusionar una PR | Sí |
| Historia lineal | Sí |
| Push forzado | No |
| Borrado de la rama | No |
| Pull request obligatoria | No |

La CI se ejecuta en cada push a cualquier rama, no solo en `main` y en las PR. Así el commit ya tiene su resultado cuando se quiere llevar a `main`.

El flujo queda así:

```bash
git push origin feat/componentes        # la CI se ejecuta sola
git push origin feat/componentes:main   # se acepta cuando esa CI está en verde
```

Las PR siguen funcionando igual para Renovate y para "Version Packages": se fusionan cuando su CI pasa.

## Alternativas descartadas

- **Pull request obligatoria con revisión.** Nadie puede aprobar su propia PR, y solo hay una persona. Cada cambio quedaría bloqueado o exigiría saltarse la regla, que es justo lo que la protección quiere evitar.
- **Pull request obligatoria sin revisión.** No añade ninguna comprobación a la que ya da la CI obligatoria, y tiene un coste: con historia lineal GitHub fusiona con squash o rebase, que reescriben los commits. `feat/componentes` dejaría de coincidir con `main` tras cada fusión y habría que rehacerla.
- **Dejarlo como estaba.** Un push directo con la CI en rojo, o sin ejecutar, llegaba a `main` y de ahí al Storybook público y a la siguiente versión.
- **Aplicar las reglas a todos menos a los administradores.** La única persona con acceso es administradora: la regla no se aplicaría a nadie.

## Consecuencias

- Ningún commit entra en `main` sin haber pasado lint, tipos, tests, build y la comprobación de paquetes.
- `main` y la rama de trabajo siguen compartiendo los mismos commits.
- La CI se ejecuta dos veces por commit: en la rama y, al avanzar, en `main`. Son unos tres minutos cada vez en un repositorio público, sin coste.
- La PR "Version Packages" la crea `github-actions[bot]` y GitHub retiene su CI hasta que alguien la aprueba en la propia PR. Antes era un aviso; ahora es condición para fusionar.
- La regla depende del nombre del job de `ci.yml`. Si se renombra, hay que actualizar la protección en el mismo cambio; de lo contrario `main` queda bloqueada.
- En una emergencia con la CI caída, un administrador tiene que desactivar la regla a propósito desde los ajustes del repositorio. No hay atajo.
- Cuando haya una segunda persona con permisos de escritura, toca revisar esta decisión y exigir PR con revisión.
