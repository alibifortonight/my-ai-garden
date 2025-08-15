import { aiActions } from '$lib/stores/ai';
import type { AIModel } from '$lib/stores/ai';
import { Wllama } from '@wllama/wllama';

// Format bytes to human readable format
export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format number with commas
export function formatNumber(num: number): string {
	return new Intl.NumberFormat().format(num);
}

// Download progress handler
export function createProgressHandler() {
	return (event: ProgressEvent) => {
		if (event.lengthComputable) {
			const progress = (event.loaded / event.total) * 100;
			aiActions.setModelProgress(progress);
		}
	};
}

// Load model using fetch with progress
export async function loadModel(model: AIModel): Promise<ArrayBuffer> {
	try {
		aiActions.setLoading(true);
		aiActions.setError(null);
		aiActions.setModelProgress(0);
		
		const response = await fetch(model.modelUrl);
		
		if (!response.ok) {
			throw new Error(`Failed to load model: ${response.statusText}`);
		}
		
		const contentLength = response.headers.get('content-length');
		const total = contentLength ? parseInt(contentLength, 10) : 0;
		
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error('Failed to get response reader');
		}
		
		const chunks: Uint8Array[] = [];
		let loaded = 0;
		
		while (true) {
			const { done, value } = await reader.read();
			
			if (done) break;
			
			chunks.push(value);
			loaded += value.length;
			
			if (total > 0) {
				const progress = (loaded / total) * 100;
				aiActions.setModelProgress(progress);
			}
		}
		
		const arrayBuffer = new ArrayBuffer(loaded);
		const uint8Array = new Uint8Array(arrayBuffer);
		let offset = 0;
		
		for (const chunk of chunks) {
			uint8Array.set(chunk, offset);
			offset += chunk.length;
		}
		
		return arrayBuffer;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		aiActions.setError(errorMessage);
		throw error;
	} finally {
		aiActions.setLoading(false);
	}
}

// Initialize WebAssembly module using Wllama
export async function initializeWasmModule(modelBuffer: ArrayBuffer): Promise<Wllama> {
	try {
		console.log('Initializing Wllama with buffer size:', modelBuffer.byteLength);
		
		// Create Wllama instance with required pathConfig
		// For now, we'll use a simple path config - in a real implementation,
		// you'd need to provide the actual WASM file paths
		const pathConfig = {
			'single-thread/wllama.wasm': '/wllama.wasm'
		};
		
		const wllama = new Wllama(pathConfig);
		
		// Convert ArrayBuffer to Blob
		const blob = new Blob([modelBuffer], { type: 'application/octet-stream' });
		
		// Load the model using the correct API
		await wllama.loadModel([blob], {
			n_ctx: 2048,
			n_threads: Math.floor((navigator.hardwareConcurrency || 1) / 2),
		});
		
		console.log('Wllama initialized successfully');
		return wllama;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to initialize WebAssembly module';
		aiActions.setError(errorMessage);
		throw error;
	}
}

// Generate response using AI model
export async function generateResponse(prompt: string, wllama: Wllama): Promise<string> {
	try {
		aiActions.setLoading(true);
		
		// Generate response using Wllama's createCompletion method
		const response = await wllama.createCompletion(prompt, {
			nPredict: 512,
			sampling: {
				temp: 0.7,
				top_p: 0.9,
			}
		});
		
		return response;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
		aiActions.setError(errorMessage);
		throw error;
	} finally {
		aiActions.setLoading(false);
	}
}

// Cleanup Wllama instance
export function cleanupWllama(wllama: Wllama | null) {
	if (wllama) {
		try {
			wllama.exit();
			console.log('Wllama instance destroyed');
		} catch (error) {
			console.error('Error destroying Wllama instance:', error);
		}
	}
} 