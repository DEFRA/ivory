FROM node:16

LABEL author="Department for Environment, Food & Rural Affairs"

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update && \
  apt-get upgrade -y
  
RUN apt-get install -y bash clamav clamav-base clamav-daemon clamav-freshclam libclamav9

RUN mkdir /var/run/clamav && \
  chown clamav:clamav /var/run/clamav

VOLUME ["/data"]

RUN freshclam

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE $PORT

ENTRYPOINT /bin/sh ./bin/startContainer
