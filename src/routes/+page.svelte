<script lang="ts">
	import { aiStore } from '$lib/stores/ai';
	import ModelSelector from '$lib/components/ModelSelector.svelte';
	import ChatContainer from '$lib/components/ChatContainer.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import { Sparkles, Github, ExternalLink } from 'lucide-svelte';
</script>

<svelte:head>
	<title>AI Garden - Browser-based AI with WebAssembly</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
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
						href="https://github.com/your-username/ai-garden"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-ghost"
					>
						<Github class="w-5 h-5" />
						<span class="sr-only">GitHub</span>
					</a>
					<a
						href="https://wllama.ai"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-ghost"
					>
						<ExternalLink class="w-5 h-5" />
						<span class="sr-only">Wllama</span>
					</a>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-12rem)]">
			<!-- Sidebar -->
			<div class="lg:col-span-1">
				<ModelSelector />
			</div>
			
			<!-- Chat Area -->
			<div class="lg:col-span-3 flex flex-col">
				<ChatContainer />
				<ChatInput />
			</div>
		</div>
		
		<!-- Error Display -->
		{#if $aiStore.error}
			<div class="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
				<div class="flex items-center gap-3">
					<div class="flex-shrink-0">
						<div class="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
							<span class="text-white text-xs font-bold">!</span>
						</div>
					</div>
					<div>
						<h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
						<p class="text-sm text-red-700 dark:text-red-300 mt-1">{$aiStore.error}</p>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
