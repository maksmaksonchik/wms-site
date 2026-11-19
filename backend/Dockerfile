# sharp ставится готовой сборкой под musl со своей libvips (@img/sharp-linuxmusl-*),
# поэтому ни компиляторы, ни системная vips не нужны
FROM node:26-alpine AS build
ENV NODE_ENV=production

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm ci --omit=dev
ENV PATH=/opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY . .
RUN npm run build

FROM node:26-alpine
ENV NODE_ENV=production
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
WORKDIR /opt/app
RUN chown node:node /opt/app
# --chown вместо отдельного RUN chown: иначе слой с /opt/app дублируется в образе
COPY --chown=node:node --from=build /opt/app ./
ENV PATH=/opt/node_modules/.bin:$PATH

USER node
CMD ["npm", "run", "start"]
