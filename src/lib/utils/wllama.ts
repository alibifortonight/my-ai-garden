import { Wllama } from '@wllama/wllama';
import type { WllamaChatMessage } from '@wllama/wllama';

// Types for our model management
export interface ModelInfo {
	id: string;
	name: string;
	description: string;
	modelUrl: string;
	parameters: number;
	contextLength: number;
	size: number;
	license: string;
	author: string;
}

export interface DownloadProgress {
	loaded: number;
	total: number;
	percentage: number;
	status: 'downloading' | 'processing' | 'complete' | 'error';
}

export interface ModelState {
	model: ModelInfo;
	instance: Wllama | null;
	isLoaded: boolean;
	isLoading: boolean;
	progress: DownloadProgress | null;
	error: string | null;
}

// Popular small models that work well in browsers
export const AVAILABLE_MODELS: ModelInfo[] = [
	{
		id: 'gemma-2b-it-q4_k_m',
		name: 'Gemma 2B Instruct (Q4)',
		description: 'Google\'s Gemma 2B instruction-tuned model, quantized for efficiency',
		modelUrl: 'https://huggingface.co/TheBloke/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf',
		parameters: 2000000000,
		contextLength: 8192,
		size: 1400000000, // ~1.4GB
		license: 'Gemma License',
		author: 'Google'
	},
	{
		id: 'phi-3-mini-4k-instruct-q4_k_m',
		name: 'Phi-3 Mini 4K Instruct (Q4)',
		description: 'Microsoft\'s Phi-3 Mini model, optimized for instruction following',
		modelUrl: 'https://huggingface.co/TheBloke/phi-3-mini-4k-instruct-GGUF/resolve/main/phi-3-mini-4k-instruct-q4_k_m.gguf',
		parameters: 3800000000,
		contextLength: 4096,
		size: 2200000000, // ~2.2GB
		license: 'MIT',
		author: 'Microsoft'
	},
	{
		id: 'tinyllama-1.1b-chat-v1.0-q4_k_m',
		name: 'TinyLlama 1.1B Chat (Q4)',
		description: 'A small, efficient chat model based on Llama architecture',
		modelUrl: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
		parameters: 1100000000,
		contextLength: 2048,
		size: 700000000, // ~700MB
		license: 'Apache 2.0',
		author: 'TinyLlama Team'
	},
	{
		id: 'qwen2.5-0.5b-instruct-q4_k_m',
		name: 'Qwen2.5 0.5B Instruct (Q4)',
		description: 'Alibaba\'s ultra-compact Qwen2.5 model for fast inference',
		modelUrl: 'https://huggingface.co/TheBloke/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
		parameters: 500000000,
		contextLength: 32768,
		size: 300000000, // ~300MB
		license: 'Qwen License',
		author: 'Alibaba'
	}
];

// OPFS (Origin Private File System) utilities
class OPFSManager {
	private static instance: OPFSManager;
	private root: FileSystemDirectoryHandle | null = null;

	static getInstance(): OPFSManager {
		if (!OPFSManager.instance) {
			OPFSManager.instance = new OPFSManager();
		}
		return OPFSManager.instance;
	}

	async initialize(): Promise<boolean> {
		try {
			if (!('showDirectoryPicker' in window)) {
				console.warn('OPFS not supported in this browser');
				return false;
			}

			this.root = await navigator.storage.getDirectory();
			console.log('OPFS initialized successfully');
			return true;
		} catch (error) {
			console.error('Failed to initialize OPFS:', error);
			return false;
		}
	}

	async saveModel(modelId: string, data: ArrayBuffer): Promise<void> {
		if (!this.root) {
			throw new Error('OPFS not initialized');
		}

		try {
			const modelsDir = await this.root.getDirectoryHandle('models', { create: true });
			const fileHandle = await modelsDir.getFileHandle(`${modelId}.gguf`, { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(data);
			await writable.close();
			console.log(`Model ${modelId} saved to OPFS`);
		} catch (error) {
			console.error('Failed to save model to OPFS:', error);
			throw error;
		}
	}

	async loadModel(modelId: string): Promise<ArrayBuffer | null> {
		if (!this.root) {
			return null;
		}

		try {
			const modelsDir = await this.root.getDirectoryHandle('models');
			const fileHandle = await modelsDir.getFileHandle(`${modelId}.gguf`);
			const file = await fileHandle.getFile();
			return await file.arrayBuffer();
		} catch (error) {
			console.log(`Model ${modelId} not found in OPFS`);
			return null;
		}
	}

	async hasModel(modelId: string): Promise<boolean> {
		if (!this.root) {
			return false;
		}

		try {
			const modelsDir = await this.root.getDirectoryHandle('models');
			await modelsDir.getFileHandle(`${modelId}.gguf`);
			return true;
		} catch {
			return false;
		}
	}

	async deleteModel(modelId: string): Promise<void> {
		if (!this.root) {
			return;
		}

		try {
			const modelsDir = await this.root.getDirectoryHandle('models');
			await modelsDir.removeEntry(`${modelId}.gguf`);
			console.log(`Model ${modelId} deleted from OPFS`);
		} catch (error) {
			console.error('Failed to delete model from OPFS:', error);
		}
	}

	async listModels(): Promise<string[]> {
		if (!this.root) {
			return [];
		}

		try {
			const modelsDir = await this.root.getDirectoryHandle('models');
			const models: string[] = [];
			for await (const entry of modelsDir.values()) {
				if (entry.kind === 'file' && entry.name.endsWith('.gguf')) {
					models.push(entry.name.replace('.gguf', ''));
				}
			}
			return models;
		} catch {
			return [];
		}
	}
}

// Main Wllama manager class
export class WllamaManager {
	private static instance: WllamaManager;
	private opfs: OPFSManager;
	private currentModel: ModelState | null = null;
	private abortController: AbortController | null = null;

	private constructor() {
		this.opfs = OPFSManager.getInstance();
	}

	static getInstance(): WllamaManager {
		if (!WllamaManager.instance) {
			WllamaManager.instance = new WllamaManager();
		}
		return WllamaManager.instance;
	}

	async initialize(): Promise<void> {
		await this.opfs.initialize();
	}

	async downloadModel(
		model: ModelInfo,
		onProgress?: (progress: DownloadProgress) => void
	): Promise<ArrayBuffer> {
		// Check if model is already cached
		const cached = await this.opfs.loadModel(model.id);
		if (cached) {
			console.log(`Model ${model.id} found in cache`);
			onProgress?.({
				loaded: cached.byteLength,
				total: cached.byteLength,
				percentage: 100,
				status: 'complete'
			});
			return cached;
		}

		// Download the model
		console.log(`Downloading model ${model.id} from ${model.modelUrl}`);
		
		this.abortController = new AbortController();
		
		try {
			const response = await fetch(model.modelUrl, {
				signal: this.abortController.signal
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const contentLength = response.headers.get('content-length');
			const total = contentLength ? parseInt(contentLength, 10) : 0;

			if (!response.body) {
				throw new Error('No response body');
			}

			const reader = response.body.getReader();
			const chunks: Uint8Array[] = [];
			let loaded = 0;

			while (true) {
				const { done, value } = await reader.read();
				
				if (done) break;
				
				chunks.push(value);
				loaded += value.length;

				onProgress?.({
					loaded,
					total,
					percentage: total > 0 ? (loaded / total) * 100 : 0,
					status: 'downloading'
				});
			}

			// Combine chunks into ArrayBuffer
			const arrayBuffer = new ArrayBuffer(loaded);
			const uint8Array = new Uint8Array(arrayBuffer);
			let offset = 0;

			for (const chunk of chunks) {
				uint8Array.set(chunk, offset);
				offset += chunk.length;
			}

			// Cache the model
			try {
				await this.opfs.saveModel(model.id, arrayBuffer);
			} catch (error) {
				console.warn('Failed to cache model, but download completed:', error);
			}

			onProgress?.({
				loaded,
				total,
				percentage: 100,
				status: 'complete'
			});

			return arrayBuffer;
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error('Download cancelled');
			}
			throw error;
		}
	}

	async loadModel(
		model: ModelInfo,
		onProgress?: (progress: DownloadProgress) => void
	): Promise<Wllama> {
		// Cleanup previous model
		await this.cleanup();

		// Update state
		this.currentModel = {
			model,
			instance: null,
			isLoaded: false,
			isLoading: true,
			progress: { loaded: 0, total: 0, percentage: 0, status: 'downloading' },
			error: null
		};

		try {
			// Download model if not cached
			const modelBuffer = await this.downloadModel(model, (progress) => {
				this.currentModel!.progress = progress;
				onProgress?.(progress);
			});

			// Initialize Wllama
			onProgress?.({ loaded: 0, total: 0, percentage: 0, status: 'processing' });

			const wllama = await this.initializeWllama(modelBuffer);
			
			// Update state
			this.currentModel.instance = wllama;
			this.currentModel.isLoaded = true;
			this.currentModel.isLoading = false;
			this.currentModel.progress = { loaded: modelBuffer.byteLength, total: modelBuffer.byteLength, percentage: 100, status: 'complete' };

			console.log(`Model ${model.id} loaded successfully`);
			return wllama;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			this.currentModel.error = errorMessage;
			this.currentModel.isLoading = false;
			this.currentModel.progress = { loaded: 0, total: 0, percentage: 0, status: 'error' };
			throw error;
		}
	}

	private async initializeWllama(modelBuffer: ArrayBuffer): Promise<Wllama> {
		// Create Wllama instance with required pathConfig
		// For browser usage, we need to provide the WASM file paths
		const pathConfig = {
			'single-thread/wllama.wasm': '/wllama.wasm'
		};

		const wllama = new Wllama(pathConfig);

		// Convert ArrayBuffer to Blob
		const blob = new Blob([modelBuffer], { type: 'application/octet-stream' });

		// Load the model
		await wllama.loadModel([blob], {
			n_ctx: 2048,
			n_threads: Math.floor((navigator.hardwareConcurrency || 1) / 2),
			embeddings: false
		});

		return wllama;
	}

	async generateText(
		prompt: string,
		options: {
			maxTokens?: number;
			temperature?: number;
			topP?: number;
			stream?: boolean;
			onToken?: (token: string, fullText: string) => void;
		} = {}
	): Promise<string> {
		if (!this.currentModel?.instance) {
			throw new Error('No model loaded');
		}

		const {
			maxTokens = 512,
			temperature = 0.7,
			topP = 0.9,
			stream = false,
			onToken
		} = options;

		try {
			if (stream && onToken) {
				// Streaming generation
				const generator = await this.currentModel.instance.createCompletion(prompt, {
					nPredict: maxTokens,
					sampling: {
						temp: temperature,
						top_p: topP,
					},
					onNewToken: (token, piece, currentText) => {
						const tokenText = new TextDecoder().decode(piece);
						onToken(tokenText, currentText);
					}
				});

				let fullText = '';
				for await (const chunk of generator) {
					const tokenText = new TextDecoder().decode(chunk.piece);
					fullText += tokenText;
				}
				return fullText;
			} else {
				// Non-streaming generation
				return await this.currentModel.instance.createCompletion(prompt, {
					nPredict: maxTokens,
					sampling: {
						temp: temperature,
						top_p: topP,
					}
				});
			}
		} catch (error) {
			console.error('Text generation failed:', error);
			throw error;
		}
	}

	async generateChat(
		messages: WllamaChatMessage[],
		options: {
			maxTokens?: number;
			temperature?: number;
			topP?: number;
			stream?: boolean;
			onToken?: (token: string, fullText: string) => void;
		} = {}
	): Promise<string> {
		if (!this.currentModel?.instance) {
			throw new Error('No model loaded');
		}

		const {
			maxTokens = 512,
			temperature = 0.7,
			topP = 0.9,
			stream = false,
			onToken
		} = options;

		try {
			if (stream && onToken) {
				// Streaming chat completion
				const generator = await this.currentModel.instance.createChatCompletion(messages, {
					nPredict: maxTokens,
					sampling: {
						temp: temperature,
						top_p: topP,
					},
					stream: true
				});

				let fullText = '';
				for await (const chunk of generator) {
					const tokenText = new TextDecoder().decode(chunk.piece);
					fullText += tokenText;
					onToken(tokenText, fullText);
				}
				return fullText;
			} else {
				// Non-streaming chat completion
				return await this.currentModel.instance.createChatCompletion(messages, {
					nPredict: maxTokens,
					sampling: {
						temp: temperature,
						top_p: topP,
					}
				});
			}
		} catch (error) {
			console.error('Chat generation failed:', error);
			throw error;
		}
	}

	async cleanup(): Promise<void> {
		if (this.currentModel?.instance) {
			try {
				await this.currentModel.instance.exit();
			} catch (error) {
				console.error('Error cleaning up Wllama instance:', error);
			}
		}

		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}

		this.currentModel = null;
	}

	async cancelDownload(): Promise<void> {
		if (this.abortController) {
			this.abortController.abort();
		}
	}

	getCurrentModel(): ModelState | null {
		return this.currentModel;
	}

	async listCachedModels(): Promise<string[]> {
		return await this.opfs.listModels();
	}

	async deleteCachedModel(modelId: string): Promise<void> {
		await this.opfs.deleteModel(modelId);
	}

	async getModelSize(modelId: string): Promise<number | null> {
		try {
			const cached = await this.opfs.loadModel(modelId);
			return cached ? cached.byteLength : null;
		} catch {
			return null;
		}
	}
}

// Export singleton instance
export const wllamaManager = WllamaManager.getInstance();