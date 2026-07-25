# Backend Deployment Runbook

## Required Environment

- `NODE_ENV=production`
- `PORT=4000`
- `API_BASE_URL`
- `PUBLIC_SITE_ORIGIN`
- `CMS_ORIGIN`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`
- `REDIS_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `SUPER_ADMIN_NAME`

## First Deploy Sequence

1. Provision MongoDB Atlas, Redis, Cloudinary, and server environment variables.
2. Run `npm ci`.
3. Run `npm run build`.
4. Run `npm run seed:admin`.
5. Run `npm run seed:content`.
6. Start with `pm2 start ecosystem.config.cjs`.
7. Verify `/health/ready`, `/api/home`, `/api/projects`, `/api/blogs`, and `/api/contact`.

## Reverse Proxy

Use `deploy/nginx/portfolio-backend.conf` as the baseline Nginx reverse proxy and add TLS termination with Certbot or your preferred certificate manager.
