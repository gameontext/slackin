FROM node:6.9-slim

MAINTAINER Erin Schnabel <schnabel@us.ibm.com> (@ebullientworks)

ADD . /srv/www
WORKDIR /srv/www

RUN npm install -d --unsafe-perm --production

EXPOSE 3000

CMD ./bin/slackin --coc "$SLACK_COC" --channels "$SLACK_CHANNELS" --port 3000 "$SLACK_SUBDOMAIN" "$SLACK_API_TOKEN"
