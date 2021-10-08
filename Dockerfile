FROM node:14

LABEL author="Department for Environment, Food & Rural Affairs"

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends clamav clamav-daemon \
  && freshclam

WORKDIR /app

COPY . .
RUN freshclam -d
RUN npm install
RUN npm run build

EXPOSE $PORT

ENTRYPOINT [ "npm", "start" ]
