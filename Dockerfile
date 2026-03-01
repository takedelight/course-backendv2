FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY . .


RUN npm run build

EXPOSE 5000

CMD ["sh", "-c", "npx ts-node -r tsconfig-paths/register src/seed.ts && npm run start:prod"]