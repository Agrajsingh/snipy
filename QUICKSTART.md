# Quick Start Guide - Mini Slack Clone

## 🚀 5-Minute Setup

### Prerequisites

- Node.js v16+ installed
- MongoDB running (locally or Atlas)
- pnpm installed (`npm install -g pnpm`)

### Steps

**1. Navigate to project:**

```bash
cd C:\Users\HP\.gemini\antigravity\scratch\mini-slack-clone
```

**2. Setup environment files** (already created with defaults):

- `server/.env` → Update `MONGO_URI` if needed
- `client/.env` → Already configured for localhost

**3. Install & Start Backend:**

```bash
cd server
pnpm install  # if not done
pnpm dev
```

✅ Server should start on http://localhost:5000

**4. Install & Start Frontend** (new terminal):

```bash
cd client
pnpm install  # if not done
pnpm dev
```

✅ App should open on http://localhost:5173

**5. Test the Application:**

1. Register a user
2. Create a channel
3. Start chatting!

## 🔧 MongoDB Setup Options

### Option A: Local MongoDB

```bash
mongod
```

### Option B: MongoDB Atlas (Cloud)

1. Create free cluster at https://mongodb.com/atlas
2. Get connection string
3. Update `server/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-slack
```

## 🧪 Testing with Multiple Users

**Method 1: Different Browsers**

- Chrome (User A)
- Firefox (User B)
- Edge (User C)

**Method 2: Incognito Windows**

- Open multiple incognito/private windows in same browser

**Method 3: Browser Profiles**

- Create separate browser profiles

## 📋 Quick Test Checklist

1. ✅ Register 2 users
2. ✅ Both users create/join same channel
3. ✅ Send messages from both users
4. ✅ Verify instant delivery
5. ✅ Check online status
6. ✅ Test typing indicators
7. ✅ Logout/Login (verify session persists)
8. ✅ Refresh page (verify messages remain)

## 🐞 Common Issues

### Port Already in Use

```bash
# Change PORT in server/.env
PORT=5001

# Change port in client/.env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### MongoDB Connection Failed

- Ensure MongoDB is running (`mongod`)
- Check `MONGO_URI` in `server/.env`
- For Atlas: Check network access whitelist

### TailwindCSS Not Working

```bash
cd client
pnpm install
```

### Socket.io Connection Issues

- Check CORS settings in `server/index.js`
- Verify `VITE_SOCKET_URL` in `client/.env`

## 📦 Production Deployment

### Backend (Render/Railway/Heroku)

1. Push to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)

1. Push to GitHub
2. Connect repository
3. Build command: `pnpm build`
4. Publish directory: `dist`
5. Set environment variables

### Environment Variables for Production

**Backend:**

- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random string
- `CLIENT_URL` - Your frontend URL (e.g., https://yourapp.vercel.app)

**Frontend:**

- `VITE_API_URL` - Your backend API URL
- `VITE_SOCKET_URL` - Your backend WebSocket URL

## 🎯 Next Steps

1. Customize channel creation (add privacy options)
2. Add user profiles/avatars
3. Implement message deletion
4. Add file upload capability
5. Deploy to production
6. Invite friends to test!

---

**Need help?** Check the main [README.md](../README.md) or [walkthrough.md](walkthrough.md)
