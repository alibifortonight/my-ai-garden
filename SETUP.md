# AI Garden Setup Guide

This guide provides the exact terminal commands to set up and run the AI Garden project.

## Prerequisites

Make sure you have the correct Node.js version installed:

```bash
# Check your Node.js version
node --version

# Should be 24.0.0 or higher
# Node.js 24+ is required for compatibility with latest dependencies
```

If you need to change Node.js versions, use nvm:

```bash
# Install Node.js 24
nvm install 24
nvm use 24

# Verify installation
node --version
```

## Quick Setup (Recommended)

1. **Clone and navigate to the project**
   ```bash
   git clone <your-repo-url>
   cd my-ai-garden
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## Manual Setup

If you prefer to set up manually:

1. **Create environment file**
   ```bash
   cat > .env << 'EOF'
   # Environment variables for local development
   
   # Set to 'true' to disable OPFS support for testing purposes
   # This allows testing the fallback behavior without OPFS
   # Useful for testing on browsers that don't support OPFS or for development
   PUBLIC_DISABLE_OPFS=false
   EOF
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with svelte-check
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Vitest
- `npm run checks` - Run format, lint, and check

## Troubleshooting

### Node.js Version Issues

If you see errors like "Not compatible with your version of node/npm", you need to upgrade to Node.js 24+:

```bash
# Check current version
node --version

# If it's less than 24, upgrade using nvm
nvm install 24
nvm use 24

# Verify the change
node --version
```

### Dependency Issues

If npm install fails, try:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port Already in Use

If port 5173 is already in use:

```bash
# Use a different port
npm run dev -- --port 3000
```

### Model Loading Issues

- Ensure you have a stable internet connection for model downloads
- Model files are large (3-4GB), so first download may take time
- Check browser console for error messages
- Try refreshing the page if model loading fails

## Project Structure

```
my-ai-garden/
├── src/
│   ├── lib/
│   │   ├── components/          # UI components
│   │   │   ├── ChatContainer.svelte
│   │   │   ├── ChatInput.svelte
│   │   │   ├── ChatMessage.svelte
│   │   │   └── ModelSelector.svelte
│   │   ├── stores/              # State management
│   │   │   └── ai.ts
│   │   └── utils/               # Utility functions
│   │       ├── ai.ts
│   │       └── markdown.ts
│   ├── routes/                  # SvelteKit pages
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── app.css                  # Global styles
├── static/                      # Static assets
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── package.json                 # Dependencies and scripts
├── setup.sh                     # Setup script
├── .nvmrc                       # Node.js version specification
├── SETUP.md                     # This file
└── README.md                    # Project documentation
```

## Next Steps

Once the project is running:

1. **Select an AI Model**: Click on a model in the sidebar to load it
2. **Wait for Download**: The model will download to your browser (may take several minutes)
3. **Start Chatting**: Type messages in the chat input once the model is loaded
4. **Explore Features**: Try the markdown rendering, copy messages, etc.

## WebAssembly Integration

The project now uses the actual `@wllama/wllama` package for WebAssembly AI inference:

1. **Real Model Loading**: Models are downloaded from Hugging Face
2. **WebAssembly Processing**: AI inference runs entirely in your browser
3. **OPFS Caching**: Models are cached using Origin Private File System
4. **Privacy First**: No data is sent to external servers

## Browser Requirements

- Modern browser with WebAssembly support
- Chrome, Firefox, Safari, or Edge
- OPFS (Origin Private File System) support for optimal performance
- Stable internet connection for initial model download

---

Happy coding! 🌱 