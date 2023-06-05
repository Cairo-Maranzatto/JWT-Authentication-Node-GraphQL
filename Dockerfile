FROM node:12

LABEL maintainer="Maranzatto <suporte@maranzatto.com>"

RUN mkdir -p /usr/src/app

WORKDIR  /usr/src/app

RUN npm i -g pm2 babel-cli

COPY package.json /usr/src/app

RUN npm i

COPY . /usr/src/app

CMD npm run prod
