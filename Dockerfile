FROM node:14-alpine3.14

LABEL author="Department for Environment, Food & Rural Affairs"

ENV NODE_ENV=production
ENV PORT=3000

# Install python
#RUN apk update && apk upgrade && apk add --no-cache \
#  python3 py3-pip bash \
#  && pip3 install --upgrade pip
  
RUN apk update && apk upgrade && apk add --no-cache clamav rsyslog wget clamav-libunrar bash

#RUN touch /tmp/clamd.sock

COPY bin/clamavDockerFiles/conf /etc/clamav
#COPY bin/clamavDockerFiles/start.py /start.py

VOLUME ["/data"]

#CMD /start.py

RUN freshclam
RUN freshclam -d
#RUN clamd

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE $PORT

ENTRYPOINT [ "npm", "start" ]
