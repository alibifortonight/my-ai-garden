#!/bin/bash

# AI Garden Setup Script
echo "🌱 Setting up AI Garden..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "❌ Node.js 24+ is required. Current version: $(node --version)"
    echo "You can use nvm to manage Node.js versions:"
    echo "  nvm install 24"
    echo "  nvm use 24"
    exit 1
fi

echo "✅ Node.js version check passed: $(node --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Environment variables for local development

# Set to 'true' to disable OPFS support for testing purposes
# This allows testing the fallback behavior without OPFS
# Useful for testing on browsers that don't support OPFS or for development
PUBLIC_DISABLE_OPFS=false
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    echo ""
    echo "🎉 Setup complete! You can now start the development server:"
    echo "   npm run dev"
    echo ""
    echo "📖 For more information, see the README.md file"
    echo ""
    echo "🔧 Available commands:"
    echo "   npm run dev      - Start development server"
    echo "   npm run build    - Build for production"
    echo "   npm run preview  - Preview production build"
    echo "   npm run check    - Type check"
    echo "   npm run lint     - Lint code"
    echo "   npm run format   - Format code"
else
    echo "❌ Failed to install dependencies"
    echo "Please check your Node.js version and try again"
    exit 1
fi 