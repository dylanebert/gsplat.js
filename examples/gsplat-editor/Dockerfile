FROM node:alpine

WORKDIR /app
COPY editor/package.json package.json
RUN npm install

COPY editor/ /app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]