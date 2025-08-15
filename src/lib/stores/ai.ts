import { writable, derived, get } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import { modelStore, modelActions } from './model';
import type { ModelInfo } from '$lib/utils/wllama';

// Message interface
export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
}

// AI State interface
export interface AIState {
	// Messages
	messages: Message[];
	
	// Current conversation
	currentConversationId: string | null;
	
	// Generation state
	isGenerating: boolean;
	generationProgress: string;
	
	// Settings
	settings: {
		maxHistoryLength: number;
		autoScroll: boolean;
		showTimestamps: boolean;
	};
}

// Initial state
const initialState: AIState = {
	messages: [],
	currentConversationId: null,
	isGenerating: false,
	generationProgress: '',
	settings: {
		maxHistoryLength: 100,
		autoScroll: true,
		showTimestamps: true,
	}
};

// Create the AI store with persistence
export const aiStore = persisted<AIState>('ai-garden-chat-store', initialState, {
	storage: 'local'
});

// Derived stores for easier access
export const messages = derived(aiStore, ($store) => $store.messages);
export const isGenerating = derived(aiStore, ($store) => $store.isGenerating);
export const generationProgress = derived(aiStore, ($store) => $store.generationProgress);
export const settings = derived(aiStore, ($store) => $store.settings);

// AI Actions
export const aiActions = {
	// Add a message to the conversation
	addMessage(content: string, role: 'user' | 'assistant' | 'system' = 'user'): void {
		const message: Message = {
			id: crypto.randomUUID(),
			role,
			content,
			timestamp: new Date()
		};

		aiStore.update(state => {
			const newMessages = [...state.messages, message];
			
			// Limit history length
			if (newMessages.length > state.settings.maxHistoryLength) {
				newMessages.splice(0, newMessages.length - state.settings.maxHistoryLength);
			}
			
			return {
				...state,
				messages: newMessages
			};
		});
	},

	// Clear all messages
	clearMessages(): void {
		aiStore.update(state => ({
			...state,
			messages: [],
			currentConversationId: null
		}));
	},

	// Remove a specific message
	removeMessage(messageId: string): void {
		aiStore.update(state => ({
			...state,
			messages: state.messages.filter(msg => msg.id !== messageId)
		}));
	},

	// Update a message
	updateMessage(messageId: string, content: string): void {
		aiStore.update(state => ({
			...state,
			messages: state.messages.map(msg => 
				msg.id === messageId ? { ...msg, content } : msg
			)
		}));
	},

	// Generate AI response
	async generateResponse(prompt: string, options: {
		stream?: boolean;
		onToken?: (token: string, fullText: string) => void;
	} = {}): Promise<string> {
		// Check if model is loaded
		const modelState = get(modelStore);
		if (!modelState.currentModel?.isLoaded) {
			throw new Error('No model loaded. Please select and load a model first.');
		}

		// Add user message
		this.addMessage(prompt, 'user');

		// Start generation
		aiStore.update(state => ({
			...state,
			isGenerating: true,
			generationProgress: 'Generating response...'
		}));

		try {
			let response = '';
			
			if (options.stream && options.onToken) {
				// Streaming generation
				response = await modelActions.generateText(prompt, {
					stream: true,
					onToken: (token, fullText) => {
						response = fullText;
						options.onToken!(token, fullText);
						
						// Update progress
						aiStore.update(state => ({
							...state,
							generationProgress: `Generated ${fullText.length} characters...`
						}));
					}
				});
			} else {
				// Non-streaming generation
				response = await modelActions.generateText(prompt);
			}

			// Add AI response
			this.addMessage(response, 'assistant');

			// Clear generation state
			aiStore.update(state => ({
				...state,
				isGenerating: false,
				generationProgress: ''
			}));

			return response;
		} catch (error) {
			// Clear generation state
			aiStore.update(state => ({
				...state,
				isGenerating: false,
				generationProgress: ''
			}));

			// Add error message
			const errorMessage = error instanceof Error ? error.message : 'An error occurred';
			this.addMessage(`Error: ${errorMessage}`, 'assistant');
			
			throw error;
		}
	},

	// Generate chat completion from conversation history
	async generateChatResponse(options: {
		stream?: boolean;
		onToken?: (token: string, fullText: string) => void;
	} = {}): Promise<string> {
		// Check if model is loaded
		const modelState = get(modelStore);
		if (!modelState.currentModel?.isLoaded) {
			throw new Error('No model loaded. Please select and load a model first.');
		}

		// Convert messages to chat format
		const currentState = get(aiStore);
		const chatMessages = currentState.messages.map((msg: Message) => ({
			role: msg.role,
			content: msg.content
		}));

		// Start generation
		aiStore.update(state => ({
			...state,
			isGenerating: true,
			generationProgress: 'Generating chat response...'
		}));

		try {
			let response = '';
			
			if (options.stream && options.onToken) {
				// Streaming chat completion
				response = await modelActions.generateChat(chatMessages, {
					stream: true,
					onToken: (token, fullText) => {
						response = fullText;
						options.onToken!(token, fullText);
						
						// Update progress
						aiStore.update(state => ({
							...state,
							generationProgress: `Generated ${fullText.length} characters...`
						}));
					}
				});
			} else {
				// Non-streaming chat completion
				response = await modelActions.generateChat(chatMessages);
			}

			// Add AI response
			this.addMessage(response, 'assistant');

			// Clear generation state
			aiStore.update(state => ({
				...state,
				isGenerating: false,
				generationProgress: ''
			}));

			return response;
		} catch (error) {
			// Clear generation state
			aiStore.update(state => ({
				...state,
				isGenerating: false,
				generationProgress: ''
			}));

			// Add error message
			const errorMessage = error instanceof Error ? error.message : 'An error occurred';
			this.addMessage(`Error: ${errorMessage}`, 'assistant');
			
			throw error;
		}
	},

	// Update settings
	updateSettings(settings: Partial<AIState['settings']>): void {
		aiStore.update(state => ({
			...state,
			settings: { ...state.settings, ...settings }
		}));
	},

	// Start a new conversation
	startNewConversation(): void {
		aiStore.update(state => ({
			...state,
			messages: [],
			currentConversationId: crypto.randomUUID()
		}));
	},

	// Export conversation as JSON
	exportConversation(): string {
		const state = get(aiStore);
		const exportData = {
			conversationId: state.currentConversationId,
			messages: state.messages,
			exportedAt: new Date().toISOString()
		};
		return JSON.stringify(exportData, null, 2);
	},

	// Import conversation from JSON
	importConversation(jsonData: string): void {
		try {
			const data = JSON.parse(jsonData);
			if (data.messages && Array.isArray(data.messages)) {
				aiStore.update(state => ({
					...state,
					messages: data.messages.map((msg: any) => ({
						...msg,
						timestamp: new Date(msg.timestamp)
					})),
					currentConversationId: data.conversationId || crypto.randomUUID()
				}));
			}
		} catch (error) {
			console.error('Failed to import conversation:', error);
			throw new Error('Invalid conversation format');
		}
	},

	// Get conversation statistics
	getConversationStats(): {
		totalMessages: number;
		userMessages: number;
		assistantMessages: number;
		totalCharacters: number;
		averageMessageLength: number;
	} {
		const state = get(aiStore);
		const messages = state.messages;
		
		const userMessages = messages.filter((msg: Message) => msg.role === 'user').length;
		const assistantMessages = messages.filter((msg: Message) => msg.role === 'assistant').length;
		const totalCharacters = messages.reduce((sum: number, msg: Message) => sum + msg.content.length, 0);
		const averageMessageLength = messages.length > 0 ? totalCharacters / messages.length : 0;

		return {
			totalMessages: messages.length,
			userMessages,
			assistantMessages,
			totalCharacters,
			averageMessageLength: Math.round(averageMessageLength)
		};
	}
};

// Export model-related stores and actions for backward compatibility
export { modelStore, modelActions, currentModel, isLoading, error } from './model';
export type { ModelInfo } from '$lib/utils/wllama'; 