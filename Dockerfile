FROM node:12
WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm install --production
COPY . /app/

ENV NODE_ENV production

COPY wait-for-it.sh .
CMD npm start