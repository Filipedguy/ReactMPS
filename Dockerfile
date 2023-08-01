FROM node:latest

WORKDIR /app

ENV PORT=80

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

RUN npm run build

ENV NODE_ENV production

EXPOSE 80

CMD [ "npx", "serve", "build" ]