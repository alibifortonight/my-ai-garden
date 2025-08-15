<script lang="ts">
	import { Send, Loader2 } from 'lucide-svelte';
	import { aiStore, aiActions } from '$lib/stores/ai';
	import { generateResponse } from '$lib/utils/ai';
	
	let message = $state('');
	let textareaRef: HTMLTextAreaElement;
	
	async function handleSubmit() {
		const currentState = $aiStore;
		if (!message.trim() || currentState.isLoading || !currentState.isModelLoaded || !currentState.currentModel || !currentState.wllamaInstance) return;
		
		const userMessage = message.trim();
		message = '';
		
		// Add user message
		aiActions.addMessage(userMessage, 'user');
		
		try {
			// Generate AI response using the Wllama instance
			const response = await generateResponse(userMessage, currentState.wllamaInstance);
			aiActions.addMessage(response, 'assistant');
			
		} catch (error) {
			console.error('Failed to generate response:', error);
			aiActions.addMessage('Sorry, I encountered an error while generating a response. Please try again.', 'assistant');
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
	
	function adjustTextareaHeight() {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = Math.min(textareaRef.scrollHeight, 200) + 'px';
		}
	}
</script>

<div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
	<div class="max-w-4xl mx-auto">
		<form class="flex gap-3" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="flex-1 relative">
				<textarea
					bind:this={textareaRef}
					bind:value={message}
					oninput={adjustTextareaHeight}
					onkeydown={handleKeydown}
					placeholder={$aiStore.isModelLoaded ? "Type your message..." : "Please load a model first"}
					disabled={!$aiStore.isModelLoaded || $aiStore.isLoading}
					class="textarea min-h-[44px] max-h-[200px] pr-12 resize-none"
					rows="1"
				></textarea>
			</div>
			
			<button
				type="submit"
				disabled={!message.trim() || $aiStore.isLoading || !$aiStore.isModelLoaded}
				class="btn-primary self-end"
			>
				{#if $aiStore.isLoading}
					<Loader2 class="w-4 h-4 animate-spin" />
				{:else}
					<Send class="w-4 h-4" />
				{/if}
			</button>
		</form>
		
		{#if !$aiStore.isModelLoaded}
			<div class="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
				Please select and load an AI model to start chatting
			</div>
		{/if}
	</div>
</div> 