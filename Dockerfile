FROM mcr.microsoft.com/devcontainers/typescript-node:latest AS dev

# Install MongoDB command line tools - though mongo-database-tools not available on arm64
ARG MONGO_TOOLS_VERSION=6.0
RUN . /etc/os-release \
    && curl -sSL "https://www.mongodb.org/static/pgp/server-${MONGO_TOOLS_VERSION}.asc" | gpg --dearmor > /usr/share/keyrings/mongodb-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] http://repo.mongodb.org/apt/debian ${VERSION_CODENAME}/mongodb-org/${MONGO_TOOLS_VERSION} main" | tee /etc/apt/sources.list.d/mongodb-org-${MONGO_TOOLS_VERSION}.list \
    && apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y mongodb-mongosh \
    && if [ "$(dpkg --print-architecture)" = "amd64" ]; then apt-get install -y mongodb-database-tools; fi \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

FROM node:22-bookworm-slim AS builder
ENV NODE_ENV=production
RUN  --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update -y && apt-get install -y openssl && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/* \ 
    && npm install -g pnpm@latest-10
# USER node
WORKDIR /app
COPY . .    
RUN --mount=type=secret,id=DATABASE_URL,env=DATABASE_URL \    
    pnpm install \
    && pnpm run build

FROM node:22-bookworm-slim AS prod
RUN  apt-get update -y && apt-get install -y openssl && apt-get clean -y && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
# USER node
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
ENV PORT=3000
EXPOSE 3000
CMD ["node", "/app/dist/src/index.js"]
