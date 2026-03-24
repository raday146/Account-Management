FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable && yarn install --immutable

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host"]
