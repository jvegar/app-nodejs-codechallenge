FROM node:18.20.3-alpine

ARG KAFKA_BROKER

WORKDIR /usr/src/app

COPY --from=root package-lock.json ./

COPY --from=root packages/common-tools packages/common-tools

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
