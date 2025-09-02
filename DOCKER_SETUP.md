# Cat Tracker - Docker Setup Guide

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

Your app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Database: localhost:5432

### 2. Making Changes and Redeploying

When you make code changes:

```bash
# Stop the containers
docker-compose down

# Rebuild and restart
docker-compose up --build

# Or for specific service only
docker-compose up --build frontend
docker-compose up --build backend
```

### 3. Database Management

```bash
# View database logs
docker-compose logs postgres

# Access PostgreSQL CLI
docker exec -it cat_tracker_db psql -U catuser -d cat_tracker

# Backup database
docker exec cat_tracker_db pg_dump -U catuser cat_tracker > backup.sql

# Restore database
docker exec -i cat_tracker_db psql -U catuser cat_tracker < backup.sql
```

## Deployment Options

### Option 1: Deploy to VPS (DigitalOcean, Linode, AWS EC2)

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone your repository
4. Run `docker-compose up -d`

### Option 2: Deploy Locally with Port Forwarding

1. Run locally: `docker-compose up -d`
2. Use ngrok for public access: `ngrok http 3000`
3. Share the ngrok URL

### Option 3: Deploy to Cloud Container Services

**Google Cloud Run:**
```bash
# Build and push to Google Container Registry
docker build -t gcr.io/YOUR_PROJECT/cat-tracker .
docker push gcr.io/YOUR_PROJECT/cat-tracker
# Deploy via Cloud Console
```

**AWS ECS or Azure Container Instances:**
Similar process - build, push to registry, deploy

## Environment Variables

Create a `.env` file in the root:

```env
# Frontend
VITE_API_URL=http://localhost:3001/api

# Backend (create .env in /backend)
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=cat_tracker
DB_USER=catuser
DB_PASSWORD=catpass123  # Change in production!
```

## Data Persistence

Your data is stored in a Docker volume (`postgres_data`). This survives container restarts but not `docker-compose down -v`.

To ensure data persistence:
1. Regular backups (see Database Management)
2. Use cloud-managed databases in production
3. Mount volume to host directory for local development

## Troubleshooting

```bash
# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Clean rebuild
docker-compose down
docker system prune -a
docker-compose up --build

# Check container status
docker ps
```

## Production Considerations

1. **Security**: Change default passwords in docker-compose.yml
2. **SSL**: Use reverse proxy (nginx/traefik) with Let's Encrypt
3. **Monitoring**: Add health checks and logging
4. **Backup**: Automated database backups
5. **Scaling**: Use Docker Swarm or Kubernetes for multi-container scaling