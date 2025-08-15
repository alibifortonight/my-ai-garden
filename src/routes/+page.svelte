<script lang="ts">
	import { modelStore } from '$lib/stores/model';
	import ModelSelector from '$lib/components/ModelSelector.svelte';
	import ChatContainer from '$lib/components/ChatContainer.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import { Sparkles, Github, ExternalLink, AlertTriangle } from 'lucide-svelte';
</script>

<svelte:head>
	<title>AI Garden - Browser-based AI with WebAssembly</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-3">
					<Sparkles class="w-8 h-8 text-primary-600" />
					<div>
						<h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">AI Garden</h1>
						<p class="text-sm text-gray-500 dark:text-gray-400">Browser-based AI with WebAssembly</p>
					</div>
				</div>
				
				<div class="flex items-center gap-4">
					<a
						href="https://github.com/alibifortonight/my-ai-garden"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-ghost"
						aria-label="GitHub Repository"
					>
						<Github class="w-5 h-5" />
					</a>
					<a
						href="https://wllama.ai"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-ghost"
						aria-label="Wllama Website"
					>
						<ExternalLink class="w-5 h-5" />
					</a>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
			<div class="lg:col-span-1">
				<ModelSelector />
			</div>
			
			<div class="lg:col-span-3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
				<ChatContainer />
				<ChatInput />
			</div>
		</div>
		
		{#if $modelStore.error}
			<div class="fixed bottom-4 right-4 max-w-sm w-full mt-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
				<div class="flex items-center gap-3">
					<div class="flex-shrink-0">
						<AlertTriangle class="w-5 h-5 text-red-500" />
					</div>
					<div>
						<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
						<p class="text-sm text-red-700 dark:text-red-300 mt-1">{$modelStore.error}</p>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>