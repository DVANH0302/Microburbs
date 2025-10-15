# fe/Dockerfile (multi-stage: build then serve with nginx)
FROM node:18-alpine AS builder
WORKDIR /app

# Allow injecting API URL at build time (create-react-app reads REACT_APP_* env vars)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package manifests first for layer caching
COPY package.json package-lock.json* ./

# If package-lock.json exists use npm ci for reproducible installs, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy the rest of the source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
