# Frontend Dockerfile - Multi-stage build for React app with static serving
# This creates a production-ready React build served by Nginx

# Stage 1: Build React Application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ .

RUN npm ci

# Build the React application
RUN npm run build

EXPOSE 4173

# Vite preview has built-in health
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4173 || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

## Stage 2: Serve with Nginx
#FROM nginx:alpine
#
## Copy built React app to Nginx serve directory
#COPY --from=build /app/dist /usr/share/nginx/html
#
## Copy custom Nginx configuration
#COPY frontend/nginx.conf /etc/nginx/nginx.conf
#
## Expose port 80
#EXPOSE 80
#
## Health check
#HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#  CMD curl -f http://localhost:80/ || exit 1
#
## Start Nginx
#CMD ["nginx", "-g", "daemon off;"]
