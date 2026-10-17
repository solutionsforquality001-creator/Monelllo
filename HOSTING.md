# Hosting Guide — Monello World

Two versions of this project exist. Pick the one that matches what you need.

---

## Option A — Static HTML (demo / prototype only)

File: `public/monello-world.html` — one self-contained file, no build step, no database.

### 1. Netlify Drop (fastest, ~60 seconds)
1. Go to https://app.netlify.com/drop
2. Rename the file to `index.html` inside a folder called `monello`
3. Drag the folder onto the page
4. You get a live URL like `https://random-name.netlify.app`
5. Site settings → Domain management → add your custom domain

### 2. Cloudflare Pages (free, fast global CDN)
1. Dash → Workers & Pages → Create → Pages → Upload assets
2. Name the project, drag the folder containing `index.html`
3. Add custom domain under Custom domains (Cloudflare proxies DNS + free SSL)

### 3. GitHub Pages (free)
```bash
git init && git add . && git commit -m "site"
gh repo create monello-world --public --source=. --push
# Then: repo Settings → Pages → Deploy from branch → main → / (root)
```

### 4. Shared hosting / cPanel (Namehero, Hostinger, Bluehost…)
1. cPanel → File Manager → `public_html`
2. Upload the file, rename it `index.html`
3. Ensure SSL/TLS Status → Run AutoSSL (free Let's Encrypt)

### 5. Vercel
```bash
npm i -g vercel
vercel --prod
```

---

## Option B — Full Next.js app (real accounts + PostgreSQL)

This is the version in `src/` — real server-side users, investments and transaction rows.

### Hosting
| Host | Command | Notes |
|---|---|---|
| **Vercel** | `vercel --prod` | Easiest. Add `DATABASE_URL` in Project → Settings → Env Vars |
| **Railway** | connect repo | Adds Postgres plugin in one click |
| **Render** | connect repo, build `npm run build`, start `npm start` | Free Postgres 90 days |
| **VPS (Hetzner/DO)** | `npm run build && npm start` behind nginx | Full control, cheapest at scale |

### Managed Postgres
- **Neon** (neon.tech) — free tier, serverless
- **Supabase** — free tier
- **Railway** — ~$5/mo

### Deploy steps
```bash
# 1. Provision Postgres, copy the connection string
# 2. Apply the schema
DATABASE_URL="postgres://..." npx drizzle-kit push

# 3. Deploy
vercel --prod
#    → set DATABASE_URL in the dashboard before first deploy
```

### Custom domain + SSL
1. Buy the domain (Porkbun / Cloudflare Registrar — at-cost pricing)
2. In your host, add the domain, then set the DNS records it shows you
   - Apex: `A` record → host IP, or `ALIAS/ANAME`
   - `www`: `CNAME` → your host target
3. SSL is issued automatically on every host above (Let's Encrypt)

---

## Pre-launch checklist

Before you send real traffic, these must be true — see `COMPLIANCE.md` for detail.

- [ ] Marketing claims verified and evidenced (AUM, member counts, awards, audits)
- [ ] Regulatory position determined and licensed, or claims removed
- [ ] No guaranteed-return language
- [ ] Real risk disclosure, not a one-line footer
- [ ] Wallet addresses are yours and tested on mainnet with a small amount
- [ ] Privacy policy, terms, imprint, and a real legal entity named
- [ ] Functional admin panel so transactions are reconciled by a human
