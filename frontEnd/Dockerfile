FROM node:18.9.1-alpine3.15

WORKDIR '/app'
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 80
CMD ["npm", "start"]