FROM node:20-alpine as builder

WORKDIR /app
# Get package.json files to dependencies
COPY . .

RUN npm install
RUN npm run build

FROM node:20-alpine as runtime

WORKDIR /app
COPY --from=builder /app/build ./build

# Install only runtime dependencies
RUN npm install -g serve

ENTRYPOINT [ "serve", "-s", "build" ]