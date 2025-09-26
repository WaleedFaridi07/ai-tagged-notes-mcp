FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* .npmrc* ./ 2>/dev/null || true
RUN npm i --omit=dev
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm","start"]
