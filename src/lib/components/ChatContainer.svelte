<script lang="ts">
	import { aiStore, aiActions } from '$lib/stores/ai';
	import { modelStore } from '$lib/stores/model';
	import ChatMessage from './ChatMessage.svelte';
	import { Trash2 } from 'lucide-svelte';

	let chatContainer: HTMLDivElement;

	function clearChat() {
		aiActions.clearMessages();
	}

	$effect(() => {
		if (chatContainer && $aiStore.settings.autoScroll) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});
</script>

<div class="flex-1 flex flex-col min-h-0">
	<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat</h2>

		{#if $aiStore.messages.length > 0}
			<button
				onclick={clearChat}
				class="btn-ghost text-sm"
			>
				<Trash2 class="w-4 h-4 mr-2" />
				Clear Chat
			</button>
		{/if}
	</div>

	<div
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto p-4 space-y-4"
	>
		{#if $aiStore.messages.length === 0}
			<div class="flex items-center justify-center h-full">
				<div class="text-center text-gray-500 dark:text-gray-400">
					{#if $modelStore.currentModel?.isLoaded}
						<p class="text-lg font-medium mb-2">Start a conversation</p>
						<p class="text-sm">Type a message below to begin chatting with the AI</p>
					{:else}
						<p class="text-lg font-medium mb-2">No model loaded</p>
						<p class="text-sm">Please select and load an AI model to start chatting</p>
					{/if}
				</div>
			</div>
		{:else}
			{#each $aiStore.messages as message (message.id)}
				<ChatMessage {message} />
			{/each}
		{/if}
	</div>
</div>