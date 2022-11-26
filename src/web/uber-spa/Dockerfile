FROM node:slim

WORKDIR /src

COPY . .

RUN npm i

EXPOSE 4200

ENTRYPOINT [ "npm", "run", "start"]