# Ivory root project

Digital service to support the Ivory Act.

## Development Team

This module was developed by the Ivory team as part of a digital transformation project at [DEFRA](https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs), a department of the UK government

# Prerequisites

Node v10+
Docker v18+

# Installing the project

```bash
git clone https://github.com/DEFRA/ivory.git
```

This will clone the [ivory-services](https://github.com/DEFRA/ivory-services), [defra-hapi-utils](https://github.com/DEFRA/defra-hapi-utils), [ivory-front-office](https://github.com/DEFRA/ivory-front-office) and [ivory-back-office](https://github.com/DEFRA/ivory-back-office) applications and perform an npm install

# Building and running the applications using docker

```bash
/bin/bash initialise.sh
docker-compose up --build
```

This will get or generate the required images and then create the containers

## Project structure

Here's the default structure for your project files.

* **[ivory-services](https://github.com/DEFRA/ivory-services)** (created withinin npm install)
* **[defra-hapi-utils](https://github.com/DEFRA/defra-hapi-utils)** (created withinin npm install)
* **[ivory-front-office](https://github.com/DEFRA/ivory-front-office)** ((created withinin npm install))
* **[ivory-back-office](https://github.com/DEFRA/ivory-back-office)** ((created withinin npm install))
* **temp**
* LICENCE
* README.md
* docker-compose.yml (will build the docker containers and run them)

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

