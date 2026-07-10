FROM node:24.12.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src
COPY .env ./.env

EXPOSE 8080
CMD ["npm", "start"]