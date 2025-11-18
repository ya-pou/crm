# Étape 1 : Builder l'application
FROM node:18 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Étape 2 : Exécuter l'application
FROM node:18

WORKDIR /usr/src/app

COPY --from=build /usr/src/app ./

EXPOSE 3000

CMD ["npm", "run", "start:dev"]