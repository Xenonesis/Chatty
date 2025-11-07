# Deployment Guide - AI Chat Portal

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 12+
- Git

## Backend Deployment

### 1. Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE chatportal_db;
CREATE USER chatportal_user WITH PASSWORD 'secure_password_here';
ALTER ROLE chatportal_user SET client_encoding TO 'utf8';
ALTER ROLE chatportal_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE chatportal_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE chatportal_db TO chatportal_user;
\q
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic --noinput

# Run development server
python manage.py runserver
```

### 3. Configure AI Provider

Choose one of the following:

#### Option A: LM Studio (Recommended for Local/Privacy)
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a model (e.g., Llama 2, Mistral)
3. Start the local server in LM Studio
4. Configure in `.env`:
```env
AI_PROVIDER=lmstudio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
AI_MODEL=local-model
```

#### Option B: OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
AI_MODEL=gpt-4
```

#### Option C: Anthropic Claude
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_api_key_here
AI_MODEL=claude-3-opus-20240229
```

#### Option D: Google Gemini
```env
AI_PROVIDER=google
GOOGLE_API_KEY=your_api_key_here
AI_MODEL=gemini-pro
```

## Frontend Deployment

### 1. Setup Frontend

```bash
# From project root
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with backend API URL

# Run development server
npm run dev
```

### 2. Build for Production

```bash
npm run build
npm run start
```

## Production Deployment

### Backend (Django)

#### Using Gunicorn + Nginx

1. Install Gunicorn:
```bash
pip install gunicorn
```

2. Create systemd service (`/etc/systemd/system/chatportal.service`):
```ini
[Unit]
Description=AI Chat Portal Django
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/gunicorn --workers 3 --bind unix:/run/chatportal.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/backend/media/;
    }

    location / {
        proxy_pass http://unix:/run/chatportal.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Start services:
```bash
sudo systemctl start chatportal
sudo systemctl enable chatportal
sudo systemctl restart nginx
```

### Frontend (Next.js)

#### Using Vercel (Easiest)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`
4. Deploy

#### Using Node.js Server
1. Build the application:
```bash
npm run build
```

2. Create PM2 ecosystem file (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'chatportal-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

3. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Docker Deployment (Alternative)

### Backend Dockerfile
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: chatportal_db
      POSTGRES_USER: chatportal_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DB_HOST: db
    depends_on:
      - db

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring & Maintenance

### Backend Logs
```bash
# View Django logs
sudo journalctl -u chatportal -f

# View Gunicorn logs
sudo tail -f /var/log/gunicorn/error.log
```

### Frontend Logs
```bash
# View PM2 logs
pm2 logs chatportal-frontend
```

### Database Backup
```bash
# Backup
pg_dump -U chatportal_user chatportal_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U chatportal_user chatportal_db < backup_20240101.sql
```

## Security Checklist

- [ ] Set `DEBUG=False` in Django settings
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall (UFW/iptables)
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Monitor logs for security issues

## Troubleshooting

### Backend Issues
- Check Django logs: `python manage.py runserver` (development)
- Verify database connection: `python manage.py dbshell`
- Test migrations: `python manage.py showmigrations`

### Frontend Issues
- Clear Next.js cache: `rm -rf .next`
- Check API connectivity: `curl http://localhost:8000/api/conversations/`
- Verify environment variables

### Database Issues
- Check PostgreSQL status: `sudo systemctl status postgresql`
- View connections: `SELECT * FROM pg_stat_activity;`
