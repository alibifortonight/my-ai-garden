# AI Garden 🌱

A modern SvelteKit application that runs AI models in your browser using WebAssembly. Built with Svelte 5, TypeScript, and Tailwind CSS.

## Features

- 🤖 **Browser-based AI**: Run AI models entirely in your browser using WebAssembly
- 🔒 **Privacy First**: No data sent to external servers
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🌙 **Dark Mode**: Built-in dark mode support
- 📝 **Markdown Support**: Rich message rendering with syntax highlighting
- ⚡ **Fast**: Built with Svelte 5 for optimal performance

## Tech Stack

- **Framework**: SvelteKit 2.0 with Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: @wllama/wllama (WebAssembly-based AI inference)
- **Icons**: Lucide Svelte
- **Markdown**: markdown-it with syntax highlighting

## Prerequisites

- **Node.js**: 24.0.0 or higher
- npm or yarn

> **Note**: This project requires Node.js 24+ for compatibility with the latest SvelteKit and Wllama dependencies.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-ai-garden
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## Manual Setup

If you prefer to set up manually:

1. **Check Node.js version**
   ```bash
   node --version  # Should be 24.0.0 or higher
   ```

2. **Create environment file**
   ```bash
   cat > .env << 'EOF'
   # Environment variables for local development
   
   # Set to 'true' to disable OPFS support for testing purposes
   # This allows testing the fallback behavior without OPFS
   # Useful for testing on browsers that don't support OPFS or for development
   PUBLIC_DISABLE_OPFS=false
   EOF
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment variables for local development

# Set to 'true' to disable OPFS support for testing purposes
# This allows testing the fallback behavior without OPFS
# Useful for testing on browsers that don't support OPFS or for development
PUBLIC_DISABLE_OPFS=false
```

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
└── README.md                    # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with svelte-check
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Vitest
- `npm run checks` - Run format, lint, and check

## AI Models

The application supports various AI models that can be loaded and run in the browser:

- **Llama 2 7B Chat**: A 7 billion parameter chat model optimized for dialogue
- **Mistral 7B Instruct**: A 7 billion parameter instruction-tuned model

Models are downloaded from Hugging Face and run locally using WebAssembly.

## WebAssembly Integration

This project uses the `@wllama/wllama` package for WebAssembly-based AI inference. The integration includes:

- Model downloading with progress tracking
- WebAssembly module initialization using Wllama
- Text generation with configurable parameters
- Memory management and cleanup
- Origin Private File System (OPFS) support for model caching

## How It Works

1. **Model Selection**: Choose an AI model from the sidebar
2. **Model Download**: The model is downloaded to your browser (may take several minutes on first load)
3. **WebAssembly Initialization**: The model is loaded into WebAssembly using Wllama
4. **Chat Interface**: Start chatting with the AI model entirely in your browser
5. **Privacy**: No data is sent to external servers - everything runs locally

## Troubleshooting

### Node.js Version Issues

If you see errors about Node.js version compatibility:

```bash
# Check current version
node --version

# Install Node.js 24+ using nvm
nvm install 24
nvm use 24
```

### Model Loading Issues

- Ensure you have a stable internet connection for the initial model download
- Model files are large (3-4GB), so the first download may take time
- Check browser console for any error messages

### Browser Compatibility

- Modern browsers with WebAssembly support required
- Chrome, Firefox, Safari, and Edge are supported
- OPFS (Origin Private File System) is used for model caching

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The web framework
- [Tailwind CSS](https://tailwindcss.com/) - The CSS framework
- [@wllama/wllama](https://wllama.ai/) - WebAssembly AI inference
- [Lucide](https://lucide.dev/) - Beautiful icons
- [markdown-it](https://markdown-it.github.io/) - Markdown parser

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/your-username/ai-garden/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

Built with ❤️ using Svelte 5 and WebAssembly
