#!/bin/bash

echo "🚀 Installing enhanced backend dependencies for real-time collaboration..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Install production dependencies
npm install uuid@^9.0.0 redis@^4.6.5 ioredis@^5.3.2 node-cron@^3.0.3 compression@^1.7.4 helmet@^7.1.0 express-rate-limit@^7.1.5 winston@^3.11.0

# Install development dependencies
npm install --save-dev @types/uuid@^9.0.7 @types/compression@^1.7.5 @types/node-cron@^3.0.11

echo "✅ Dependencies installed successfully!"
echo "📦 Enhanced real-time backend ready for:"
echo "   • WebRTC signaling server"
echo "   • Real-time chat with persistence"
echo "   • Live presence & activity tracking"
echo "   • Performance monitoring"
echo "   • Live collaboration features"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure environment variables"
echo "   2. Set up Redis for session management (optional)"
echo "   3. Run: npm run dev"
echo ""
echo "🌟 Real-time collaboration backend is ready to go!"