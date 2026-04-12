# @repo/kitchen-sink

A starting point for projects with basics out of the box:

- [turborepo](https://turborepo.dev/)
- Eslint with opinionated config
- Typescript config

## Structure

### `pkg/*`

[Internal packages](https://turborepo.dev/docs/core-concepts/internal-packages), intended to be used with the just-in-time strategy where typescript source is used directly.

Shared resources such as eslint and typescript configs live here too.

### `app/*`

[Application packages](https://turborepo.dev/docs/core-concepts/package-types#application-packages) including frontends, deployed backends, react native apps, etc.
