FROM node:20.9.0
WORKDIR /usr/src/app
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3010
CMD ["npm","run","start:prod"]




