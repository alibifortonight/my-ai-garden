import { writable, derived } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import { wllamaManager, AVAILABLE_MODELS, type ModelInfo, type ModelState, type DownloadProgress } from '$lib/utils/wllama';

// Types for the store
export interface ModelStoreState {
	// Available models
	availableModels: ModelInfo[];
	
	// Current model state
	currentModel: ModelState | null;
	
	// Loading states
	isInitializing: boolean;
	isLoading: boolean;
	
	// Download progress
	downloadProgress: DownloadProgress | null;
	
	// Error handling
	error: string | null;
	
	// Cached models
	cachedModels: string[];
	
	// Settings
	settings: {
		autoLoadLastModel: boolean;
		streamingEnabled: boolean;
		maxTokens: number;
		temperature: number;
		topP: number;
	};
}

// Initial state
const initialState: ModelStoreState = {
	availableModels: AVAILABLE_MODELS,
	currentModel: null,
	isInitializing: false,
	isLoading: false,
	downloadProgress: null,
	error: null,
	cachedModels: [],
	settings: {
		autoLoadLastModel: true,
		streamingEnabled: true,
		maxTokens: 512,
		temperature: 0.7,
		topP: 0.9,
	}
};

// Create the main store with persistence
export const modelStore = persisted<ModelStoreState>('ai-garden-model-store', initialState, {
	storage: 'local'
});

// Derived stores for easier access
export const currentModel = derived(modelStore, ($store) => $store.currentModel);
export const isLoading = derived(modelStore, ($store) => $store.isLoading);
export const isInitializing = derived(modelStore, ($store) => $store.isInitializing);
export const downloadProgress = derived(modelStore, ($store) => $store.downloadProgress);
export const error = derived(modelStore, ($store) => $store.error);
export const cachedModels = derived(modelStore, ($store) => $store.cachedModels);
export const settings = derived(modelStore, ($store) => $store.settings);

// Store actions
export const modelActions = {
	// Initialize the Wllama manager
	async initialize(): Promise<void> {
		modelStore.update(state => ({ ...state, isInitializing: true, error: null }));
		
		try {
			await wllamaManager.initialize();
			
			// Load cached models list
			const cached = await wllamaManager.listCachedModels();
			modelStore.update(state => ({ 
				...state, 
				cachedModels: cached,
				isInitializing: false 
			}));
			
			// Auto-load last model if enabled
			if (state.settings.autoLoadLastModel && state.currentModel) {
				await this.loadModel(state.currentModel.model);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to initialize';
			modelStore.update(state => ({ 
				...state, 
				error: errorMessage,
				isInitializing: false 
			}));
			throw err;
		}
	},

	// Load a model
	async loadModel(model: ModelInfo): Promise<void> {
		modelStore.update(state => ({ 
			...state, 
			isLoading: true, 
			error: null,
			downloadProgress: null
		}));

		try {
			await wllamaManager.loadModel(model, (progress) => {
				modelStore.update(state => ({ 
					...state, 
					downloadProgress: progress 
				}));
			});

			// Update store with current model state
			const currentModelState = wllamaManager.getCurrentModel();
			modelStore.update(state => ({ 
				...state, 
				currentModel: currentModelState,
				isLoading: false,
				downloadProgress: null
			}));

			// Update cached models list
			const cached = await wllamaManager.listCachedModels();
			modelStore.update(state => ({ 
				...state, 
				cachedModels: cached 
			}));

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load model';
			modelStore.update(state => ({ 
				...state, 
				error: errorMessage,
				isLoading: false,
				downloadProgress: null
			}));
			throw err;
		}
	},

	// Unload current model
	async unloadModel(): Promise<void> {
		try {
			await wllamaManager.cleanup();
			modelStore.update(state => ({ 
				...state, 
				currentModel: null 
			}));
		} catch (err) {
			console.error('Error unloading model:', err);
		}
	},

	// Cancel current download
	async cancelDownload(): Promise<void> {
		try {
			await wllamaManager.cancelDownload();
			modelStore.update(state => ({ 
				...state, 
				isLoading: false,
				downloadProgress: null 
			}));
		} catch (err) {
			console.error('Error canceling download:', err);
		}
	},

	// Generate text
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
		const state = get(modelStore);
		const finalOptions = {
			maxTokens: options.maxTokens ?? state.settings.maxTokens,
			temperature: options.temperature ?? state.settings.temperature,
			topP: options.topP ?? state.settings.topP,
			stream: options.stream ?? state.settings.streamingEnabled,
			onToken: options.onToken
		};

		return await wllamaManager.generateText(prompt, finalOptions);
	},

	// Generate chat completion
	async generateChat(
		messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
		options: {
			maxTokens?: number;
			temperature?: number;
			topP?: number;
			stream?: boolean;
			onToken?: (token: string, fullText: string) => void;
		} = {}
	): Promise<string> {
		const state = get(modelStore);
		const finalOptions = {
			maxTokens: options.maxTokens ?? state.settings.maxTokens,
			temperature: options.temperature ?? state.settings.temperature,
			topP: options.topP ?? state.settings.topP,
			stream: options.stream ?? state.settings.streamingEnabled,
			onToken: options.onToken
		};

		return await wllamaManager.generateChat(messages, finalOptions);
	},

	// Delete cached model
	async deleteCachedModel(modelId: string): Promise<void> {
		try {
			await wllamaManager.deleteCachedModel(modelId);
			
			// Update cached models list
			const cached = await wllamaManager.listCachedModels();
			modelStore.update(state => ({ 
				...state, 
				cachedModels: cached 
			}));

			// If we deleted the current model, unload it
			const currentState = get(modelStore);
			if (currentState.currentModel?.model.id === modelId) {
				await this.unloadModel();
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to delete cached model';
			modelStore.update(state => ({ 
				...state, 
				error: errorMessage 
			}));
			throw err;
		}
	},

	// Update settings
	updateSettings(settings: Partial<ModelStoreState['settings']>): void {
		modelStore.update(state => ({
			...state,
			settings: { ...state.settings, ...settings }
		}));
	},

	// Clear error
	clearError(): void {
		modelStore.update(state => ({ ...state, error: null }));
	},

	// Refresh cached models list
	async refreshCachedModels(): Promise<void> {
		try {
			const cached = await wllamaManager.listCachedModels();
			modelStore.update(state => ({ 
				...state, 
				cachedModels: cached 
			}));
		} catch (err) {
			console.error('Error refreshing cached models:', err);
		}
	},

	// Get model size
	async getModelSize(modelId: string): Promise<number | null> {
		return await wllamaManager.getModelSize(modelId);
	},

	// Check if model is cached
	isModelCached(modelId: string): boolean {
		const state = get(modelStore);
		return state.cachedModels.includes(modelId);
	},

	// Get model info by ID
	getModelById(modelId: string): ModelInfo | undefined {
		const state = get(modelStore);
		return state.availableModels.find(model => model.id === modelId);
	},

	// Format model size for display
	formatModelSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	},

	// Format number with commas
	formatNumber(num: number): string {
		return new Intl.NumberFormat().format(num);
	}
};

// Helper function to get store value
function get<T>(store: any): T {
	let value: T;
	store.subscribe((v: T) => value = v)();
	return value!;
}

// Initialize the store when the module is loaded
if (typeof window !== 'undefined') {
	// Only initialize on the client side
	modelActions.initialize().catch(console.error);
} 