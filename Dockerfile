# Étape 1 : Builder l'application
FROM node:24.11.1 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Étape 2 : Exécuter l'application
FROM node:24.11.1

WORKDIR /app

COPY --from=build /app ./

EXPOSE 3000

CMD ["npm", "run", "start:dev"]