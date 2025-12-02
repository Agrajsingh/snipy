# Deployment Guide - Mini Slack Clone

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] MongoDB connection string ready (Atlas recommended)
- [ ] GitHub repository created
- [ ] Environment variables documented
- [ ] Build tested locally (`pnpm build`)

## 🚀 Deployment Options

### Backend Deployment

#### Option 1: Render (Recommended - Free Tier Available)

**Steps:**

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: mini-slack-backend
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`
6. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_strong_secret_here
   CLIENT_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   PORT=5000
   ```
7. Click "Create Web Service"

**Notes:**

- Free tier includes 750 hours/month
- Auto-deploys on git push
- Provides HTTPS automatically

#### Option 2: Railway

**Steps:**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `server`
5. Add environment variables (same as above)
6. Deploy

**Notes:**

- $5 free credit/month
- Very fast deployments
- Easy database provisioning

#### Option 3: Heroku

**Steps:**

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create mini-slack-backend`
4. Set buildpacks:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```
5. Configure environment variables:
   ```bash
   heroku config:set MONGO_URI=mongodb+srv://...
   heroku config:set JWT_SECRET=your_secret
   heroku config:set CLIENT_URL=https://your-frontend.vercel.app
   ```
6. Deploy:
   ```bash
   git subtree push --prefix server heroku main
   ```

---

### Frontend Deployment

#### Option 1: Vercel (Recommended)

**Steps:**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
6. Click "Deploy"

**Notes:**

- Free tier unlimited
- Auto-deploys on git push
- Global CDN
- HTTPS automatic

#### Option 2: Netlify

**Steps:**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select repository
4. Configure:
   - **Base directory**: `client`
   - **Build command**: `pnpm build`
   - **Publish directory**: `client/dist`
5. Add environment variables (same as above)
6. Deploy

#### Option 3: GitHub Pages (Static Only)

**Steps:**

1. Update `vite.config.js`:
   ```javascript
   export default defineConfig({
     base: "/mini-slack-clone/",
     plugins: [react()],
   });
   ```
2. Build:
   ```bash
   cd client
   pnpm build
   ```
3. Deploy:
   ```bash
   pnpm add -D gh-pages
   ```
4. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
5. Run: `pnpm deploy`

---

### Database Deployment

#### MongoDB Atlas (Recommended)

**Steps:**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (M0 Free tier)
4. Create database user:
   - Username: admin
   - Password: (generate strong password)
5. Network Access:
   - Add IP: 0.0.0.0/0 (allow all - for serverless)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
7. Use in backend environment:
   ```
   MONGO_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/mini-slack?retryWrites=true&w=majority
   ```

---

## 🔐 Environment Variables Summary

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-slack
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

---

## ⚙️ Production Optimizations

### Backend

**1. Add compression:**

```bash
cd server
pnpm add compression
```

In `index.js`:

```javascript
import compression from "compression";
app.use(compression());
```

**2. Add rate limiting:**

```bash
pnpm add express-rate-limit
```

In `index.js`:

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

**3. Add helmet for security:**

```bash
pnpm add helmet
```

In `index.js`:

```javascript
import helmet from "helmet";
app.use(helmet());
```

### Frontend

**1. Code splitting:**
Already done with React Router

**2. Image optimization:**
Use WebP format for avatars/images

**3. Enable gzip:**
Already handled by Vercel/Netlify

---

## 🧪 Testing Production Build Locally

### Backend

```bash
cd server
NODE_ENV=production pnpm start
```

### Frontend

```bash
cd client
pnpm build
pnpm preview
```

Visit `http://localhost:4173` to test production build

---

## 🔍 Monitoring & Debugging

### Check Backend Logs

**Render:**

- Dashboard → Your Service → Logs tab

**Railway:**

- Project → Service → Deployments → View Logs

**Heroku:**

```bash
heroku logs --tail
```

### Check Frontend Errors

- Vercel: Dashboard → Project → Deployments → Function Logs
- Netlify: Dashboard → Site → Deploy log

### Common Production Issues

**1. CORS Errors**

- Verify `CLIENT_URL` in backend matches frontend URL
- Check CORS configuration in `server/index.js`

**2. WebSocket Connection Failed**

- Ensure deployment platform supports WebSockets
- Render: Works out of the box
- Heroku: Supports WebSockets
- Vercel: Serverless functions don't support persistent connections

**3. Database Connection Timeout**

- Check MongoDB Atlas network access
- Verify connection string format
- Ensure cluster is not paused

**4. Environment Variables Not Loading**

- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)

---

## 📊 Scaling Considerations

### For High Traffic

**1. Redis for Socket.io (Multiple Servers):**

```bash
pnpm add @socket.io/redis-adapter redis
```

```javascript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

**2. CDN for Static Assets:**

- Already handled by Vercel/Netlify

**3. Database Indexing:**
Already implemented in Message model

**4. Load Balancing:**

- Render/Railway handle this automatically
- Heroku: Use multiple dynos

---

## 🎯 Post-Deployment Checklist

- [ ] Backend URL accessible
- [ ] Frontend URL accessible
- [ ] Register new user works
- [ ] Login works
- [ ] Create channel works
- [ ] Send message works (real-time)
- [ ] Online status updates
- [ ] Typing indicators work
- [ ] Logout works
- [ ] Session persists on refresh
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Database queries efficient
- [ ] No console errors

---

## 📝 Custom Domain (Optional)

### Vercel

1. Add domain in project settings
2. Configure DNS with your registrar

### Render

1. Settings → Custom Domain
2. Add domain
3. Update DNS records

---

## 🔄 CI/CD (Already Configured)

Both Vercel and Render auto-deploy on git push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Deployment starts automatically!

---

## 📞 Support Resources

- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Render**: [docs.render.com](https://docs.render.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Socket.io**: [socket.io/docs](https://socket.io/docs)

---

**Congratulations! Your Mini Slack Clone is now live! 🎉**

Share the URL with friends and start chatting in real-time!
