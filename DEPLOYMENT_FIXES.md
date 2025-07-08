# Deployment Fixes Guide

## Issues Fixed

### 1. Client-side Icon Import Issues
**Problem**: Components were importing icons using relative paths that don't work in Next.js
```
import magnifyingGlassIcon from "../../public/icons/Magnifying_glass.png";
```

**Solution**: Updated all components to use Next.js Image component with direct paths
```jsx
<Image src="/icons/Magnifying_glass.png" alt="Search" width={24} height={24} />
```

**Files Updated**:
- `client/app/login/page.js` - Removed icon imports, simplified component props
- `client/components/LoginForm/LoginForm.jsx` - Updated to use direct icon paths
- `client/components/RegisterForm/RegisterForm.jsx` - Updated to use direct icon paths

### 2. Missing Dependencies
**Problem**: `react-markdown` dependency was in package.json but not installed

**Solution**: Ran `npm install` in client directory to install all dependencies

### 3. Server-side Native Module Issue
**Problem**: `better-sqlite3` native module compiled for wrong architecture causing "invalid ELF header" error

**Solution**: 
1. Updated `Dockerfile.server` to use Alpine Linux with build dependencies
2. Added postinstall script to rebuild better-sqlite3 for target platform

**Dockerfile Changes**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev

COPY server/package*.json ./
RUN npm install

COPY server/ .

EXPOSE 4000

CMD ["node", "server.js"]
```

**Package.json Changes**:
```json
{
  "scripts": {
    "postinstall": "npm rebuild better-sqlite3"
  }
}
```

## Deployment Steps

1. **Client Build**: The client now builds successfully with all icon imports fixed
2. **Server Build**: The server Dockerfile now includes necessary build dependencies for native modules
3. **Database**: The better-sqlite3 module will be rebuilt for the target platform during deployment

## Testing

- Client build: `cd client && npm run build` ✅
- All icon imports now use proper Next.js Image component paths
- Server Dockerfile includes Alpine build dependencies for native modules

## Notes

- The `react-markdown` dependency was already in package.json but needed to be installed
- Icon imports were the main blocking issue for client deployment
- Server deployment issue was due to architecture mismatch with better-sqlite3 native module 