<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Base44 dev environment
- Run: `docker compose -f docker-compose.base44.yml up -d` (Next 14 dev + MySQL 8, port 3000).
- `npm ci` needs `--legacy-peer-deps` (next-auth beta vs nodemailer peer conflict).
- Startup runs `prisma db push` + seed (admin defaults `admin@gofiretech.com` / `GoFireAdmin2024!` unless ADMIN_EMAIL/ADMIN_PASSWORD set).
- SMTP_* secrets are optional (email only).
