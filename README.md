# AMessages - Real-time Messaging Application

A modern, real-time messaging application built with Next.js, Node.js, and Socket.IO, featuring media playback, theme customization, and group chat functionality.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Media Integration**: Music player, radio stations, and piano widget
- **Theme System**: Multiple customizable themes with smooth transitions
- **Group Chats**: Support for group conversations
- **User Management**: Authentication, user profiles, and search
- **Responsive Design**: Modern UI that works on all devices
- **Performance Optimized**: React.memo, lazy loading, and efficient state management

## 🏗️ Architecture

### Frontend (Client)
- **Framework**: Next.js 14 with App Router
- **State Management**: React Context API with custom hooks
- **Styling**: CSS Modules and custom CSS
- **Real-time**: Socket.IO client
- **Performance**: React.memo, useMemo, useCallback, lazy loading

### Backend (Server)
- **Runtime**: Node.js with Express
- **Database**: SQLite with file-based storage
- **Authentication**: JWT tokens
- **Real-time**: Socket.IO server
- **Testing**: Jest with integration tests

### Services
- **AuthService**: Authentication and user management
- **ChatService**: Message and conversation handling
- **MediaService**: Music and media file management
- **SocketService**: Real-time communication

## 📁 Project Structure

```
AMessages/
├── client/                 # Frontend application
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── context/          # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   └── styles/           # CSS files
├── server/               # Backend application
│   ├── controllers/      # Route controllers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── tests/           # Test files
├── docker-compose.yml    # Docker orchestration
├── Dockerfile.client     # Frontend Dockerfile
└── Dockerfile.server     # Backend Dockerfile
```

## 📖 User Guide

For detailed user instructions in English and Croatian, see [USER_GUIDE.md](./USER_GUIDE.md)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AMessages
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment setup**
   ```bash
   # Client environment
   cd client
   cp env.example .env.local
   # Edit .env.local with your configuration
   
   # Server environment
   cd ../server
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start backend (from server directory)
   npm run dev
   
   # Start frontend (from client directory, in new terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access services**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 📊 Monitoring

The application includes monitoring with:
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Sentry**: Error tracking (configure in client)

## 🔧 Development Guidelines

### Code Organization
- Use custom hooks for reusable logic
- Implement contexts for global state
- Keep components small and focused
- Use TypeScript for better type safety (recommended)

### Performance
- Use React.memo for expensive components
- Implement lazy loading for large components
- Debounce user input events
- Optimize re-renders with useMemo and useCallback

### State Management
- Use React Context for global state
- Keep local state minimal
- Implement proper error boundaries
- Handle loading states gracefully

## 🚀 Deployment

### Production Build
```bash
# Client
cd client
npm run build
npm start

# Server
cd server
npm run build
npm start
```

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `JWT_SECRET`: JWT signing secret
- `SENTRY_DSN`: Sentry error tracking (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for examples 