# Ivory Project

![Build Status](https://github.com/DEFRA/ivory/workflows/CI/badge.svg?branch=develop)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_ivory&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=DEFRA_ivory)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_ivory&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_ivory)
[![security](https://hakiri.io/github/DEFRA/waste-carriers-front-office/main.svg)](https://hakiri.io/github/DEFRA/waste-carriers-front-office/main)
[![Licence](https://img.shields.io/badge/Licence-OGLv3-blue.svg)](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3)

Digital service to support the Ivory Act.

# Environment variables

The default values will be used if the environment variables are missing or commented out.

| name                       | description                | required | default         |               valid                | notes |
| -------------------------- | -------------------------- | :------: | --------------- | :--------------------------------: | ----- |
| NODE_ENV                   | Node environment           |    no    |                 |    development,test,production     |       |
| PORT                       | Port number                |    no    | 3000            |                                    |       |
| SERVICE_NAME               | Name of the service        |    no    |                 |          Any text string           |       |
| COOKIE_VALIDATION_PASSWORD | Cookie encoding password   |   yes    |                 |          Any text string           |       |
| REDIS_HOST                 | Redis server IP address    |    no    | 127.0.0.1       |                                    |       |
| REDIS_PORT                 | Redis port number          |    no    | 6379            |                                    |       |
| REDIS_PASSWORD             | Redis password             |    no    |                 |                                    |       |
| SERVICE_API_ENABLED        | Enable/disable ivory API   |    no    | false           |             true,false             |       |
| SERVICE_API_HOST           | Ivory API IP address       |    no    | 127.0.0.1       |                                    |       |
| SERVICE_API_PORT           | Ivory API port number      |    no    | 3010            |                                    |       |
| ADDRESS_LOOKUP_ENABLED     | Enable/disable address API |    no    | false           |             true,false             |       |
| ADDRESS_LOOKUP_URL         | Address lookup URL         |    no    | http://some-url |                                    |       |
| ADDRESS_LOOKUP_PASSPHRASE  | Address lookup passphrase  |    no    |                 |                                    |       |
| ADDRESS_LOOKUP_PFX_CERT    | Address lookup certificate |    no    |                 | PFX file location or Base64 string |       |

# Prerequisites

Node v14.x

Redis

# Running the application

First install the dependencies & build the application using:

`$ npm install`

Currently this will just build the `govuk-frontend` sass and create a default .env file if one doesn't already exist. But may be extended to include other build tasks as needed (e.g. client-side js using browserify or webpack etc.)

If installing on a Windows machine you may encounter an error when running `$ npm install` relating to your OS not being able to run the Bash scripts which are part of the installation. Should you have this problem first ensure that you have installed [Git for Windows](https://gitforwindows.org/). Then run the command `$ npm config set script-shell %userprofile%\cmder\vendor\git-for-windows\bin\bash` followed by `$ npm install`.

Now the application is ready to run:

`$ npm start` or `$ node index.js`

### Converting the Address Lookup PFX certificate to a Base64 string

In some instances you may not be able to use a PFX certificate file with your environment. In these cases it is possible to use the script at `/bin/scripts/convertCert.js` to convert your PFX certificate into a Base64 string that can be added to the Environment Variable `ADDRESS_LOOKUP_PFX_CERT` instead of the location of the certificate itself.

### To run the application in Docker

`$ npm run docker` or `$ npm run docker:build` followed by `$ npm run docker:run`

## Project structure

Here's the default structure for your project files.

- **bin** (build tasks)
- **client** (client js/sass code)
- **server**
  - **plugins**
  - **public** (This folder is publicly served)
    - **static** (Put all static assets in here)
    - **build** (This contains the build output files (js/css etc.) and is not checked-in)
  - **routes**
  - **services**
  - **views**
  - config.js
  - index.js (Exports a function that creates a server)
- **test**
- README.md
- index.js (startup server)

## Config

The configuration file for the server is found at `server/config.js`.
This is where to put any config and all config should be read from the environment.
The final config object should be validated using joi and the application should not start otherwise.

A table of environment variables should be maintained in this README.

## Plugins

hapi has a powerful plugin system and all server code should be loaded in a plugin.

Plugins live in the `server/plugins` directory.

## Logging

The [good](https://github.com/hapijs/good) and [good-console](https://github.com/hapijs/good-console) plugins are included and configured in `server/plugins/logging`

The logging plugin is only registered in when `NODE_ENV=development`.

Error logging for production should use errbit.

## Views

The [vison](https://github.com/hapijs/vision) plugin is used for template rendering support.

The template engine used in nunjucks inline with the GDS Design System with support for view caching, layouts, partials and helpers.

## Static files

The [Inert](https://github.com/hapijs/inert) plugin is used for static file and directory handling in hapi.js.
Put all static assets in `server/public/static`.

Any build output should write to `server/public/build`. This path is in the `.gitignore` and is therefore not checked into source control.

## Routes

Incoming requests are handled by the server via routes.
Each route describes an HTTP endpoint with a path, method, and other properties.

Routes are found in the `server/routes` directory and loaded using the `server/plugins/router.js` plugin.

Hapi supports registering routes individually or in a batch.
Each route file can therefore export a single route object or an array of route objects.

A single route looks like this:

```js
{
  method: 'GET',
  path: '/hello-world',
  options: {
    handler: (request, h) => {
      return 'hello world'
    }
  }
}
```

There are lots of [route options](http://hapijs.com/api#route-options), here's the documentation on [hapi routes](http://hapijs.com/tutorials/routing)

## Tasks

Build tasks are created using simple shell scripts or node.js programs.
The default ones are found in the `bin` directory.

The task runner is simply `npm` using `npm-scripts`.

The predefined tasks are:

- `npm start` (Runs the application)
- `npm run build` (Runs all build sub-tasks)
- `npm run build:css` (Builds the client-side sass)
- `npm run docker` (Runs all Docker sub-tasks)
- `npm run docker:build` (Builds the application in a Docker container)
- `npm run docker:run` (Runs the application in the Docker container)
- `npm run lint` (Runs the lint task using standard.js)
- `npm run unit-test` (Runs the `lab` tests in the `/test` folder)
- `npm test` (Runs the `lint` task then the `unit-tests`)

## Testing

[lab](https://github.com/hapijs/lab) and [code](https://github.com/hapijs/code) are used for unit testing.

See the `/test` folder for more information.

## Linting

[standard.js](http://standardjs.com/) is used to lint both the server-side and client-side javascript code.

It's defined as a build task and can be run using `npm run lint`.
