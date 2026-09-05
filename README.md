# @repo/kitchen-sink

A starting point for projects with basics out of the box:

- [turborepo](https://turborepo.dev/)
- Oxlint with opinionated, type-aware rules and Oxfmt for formatting
- Typescript config

## Structure

### `pkg/*`

[Internal packages](https://turborepo.dev/docs/core-concepts/internal-packages), intended to be used with the just-in-time strategy where typescript source is used directly.

The shared TypeScript config lives here too

### `app/*`

[Application packages](https://turborepo.dev/docs/core-concepts/package-types#application-packages) including frontends, deployed backends, react native apps, etc.

`@repo/appbase` is the starter application template.
