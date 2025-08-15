<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	import { processMarkdown } from '$lib/utils/markdown';
	import type { Message } from '$lib/stores/ai';
	
	let { message } = $props<{ message: Message }>();
	
	let copied = $state(false);
	
	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(message.content);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy message:', error);
		}
	}
</script>

<div class="flex gap-4 {message.role === 'user' ? 'justify-end' : 'justify-start'}">
	<div class="max-w-3xl {message.role === 'user' ? 'order-2' : 'order-1'}">
		<div class="card {message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800'}">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1 prose prose-sm max-w-none {message.role === 'user' ? 'prose-invert' : ''}">
					{@html processMarkdown(message.content)}
				</div>
				
				<button
					class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
					onclick={copyToClipboard}
					title="Copy message"
				>
					{#if copied}
						<Check class="w-4 h-4 text-green-600" />
					{:else}
						<Copy class="w-4 h-4" />
					{/if}
				</button>
			</div>
		</div>
		
		<div class="text-xs text-gray-500 dark:text-gray-400 mt-2 {message.role === 'user' ? 'text-right' : 'text-left'}">
			{message.timestamp.toLocaleTimeString()}
		</div>
	</div>
</div> 