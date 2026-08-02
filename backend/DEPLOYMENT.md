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
- `FRONTEND_REVALIDATION_URL`
- `FRONTEND_REVALIDATION_SECRET`
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
7. Verify `/health/ready`, `/api/home`, `/api/projects`, `/api/blogs`, `/api/contact`, `/api/seo/global`, and `/api/seo/resolve?path=/`.
8. Configure the same `SEO_REVALIDATION_SECRET` in the frontend runtime and set `FRONTEND_REVALIDATION_URL` to the frontend `/api/revalidate-seo` endpoint.
9. Verify the public frontend serves `/sitemap.xml` and `/robots.txt`.

## SEO Revalidation

After a successful CMS SEO, settings, or contact update, the backend sends a signed request to the frontend `/api/revalidate-seo` endpoint. The endpoint invalidates the affected Next.js paths and layout cache so the next request renders fresh CMS metadata without a frontend redeploy.

If the frontend is unavailable, the CMS write remains successful and the backend logs the failed notification. A later deployment or manual cache refresh remains the recovery path.

## Reverse Proxy

Use `deploy/nginx/portfolio-backend.conf` as the baseline Nginx reverse proxy and add TLS termination with Certbot or your preferred certificate manager.
