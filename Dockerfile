FROM node:16-alpine

# Install dependencies
RUN apk add \
git \
build-base \
g++

# Copy files
COPY . /

# Build Node modules
RUN yarn install

ENTRYPOINT ["node", "index.js"]
