FROM node:18.20.3-alpine

ARG KAFKA_BROKER

RUN npm install -g @nestjs/cli

WORKDIR /usr/src/app

COPY --from=root package-lock.json ./

COPY --from=root packages/common-tools packages/common-tools

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
