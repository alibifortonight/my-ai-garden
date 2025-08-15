<script lang="ts">
	import { aiStore, aiActions } from '$lib/stores/ai';
	import { AVAILABLE_MODELS as availableModels } from '$lib/utils/wllama';
	import { formatBytes, formatNumber, loadModel, initializeWasmModule, cleanupWllama } from '$lib/utils/ai';
	import { Brain, Download, CheckCircle, AlertCircle } from 'lucide-svelte';
	
	async function loadModelHandler(model: typeof availableModels[0]) {
		try {
			// Cleanup previous instance if exists
			const currentState = $aiStore;
			if (currentState.wllamaInstance) {
				cleanupWllama(currentState.wllamaInstance);
				aiActions.setWllamaInstance(null);
			}
			
			aiActions.setCurrentModel(model);
			aiActions.setModelLoaded(false);
			aiActions.setError(null);
			
			console.log(`Loading model: ${model.name}`);
			
			// Load the model file
			const modelBuffer = await loadModel(model);
			
			// Initialize Wllama with the model
			const wllama = await initializeWasmModule(modelBuffer);
			
			// Store the Wllama instance
			aiActions.setWllamaInstance(wllama);
			aiActions.setModelLoaded(true);
			
			console.log(`Model ${model.name} loaded successfully`);
		} catch (error) {
			console.error('Failed to load model:', error);
			aiActions.setError(error instanceof Error ? error.message : 'Failed to load model');
			aiActions.setModelLoaded(false);
		}
	}
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Select AI Model</h2>
	
	<div class="grid gap-4 md:grid-cols-2">
		{#each availableModels as model}
			<button
				class="card cursor-pointer transition-all hover:shadow-md text-left {$aiStore.currentModel?.id === model.id ? 'ring-2 ring-primary-500' : ''}" 
				onclick={() => loadModelHandler(model)}
				onkeydown={(e) => e.key === 'Enter' && loadModelHandler(model)}
			>
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<div class="flex items-center gap-2 mb-2">
							<Brain class="w-5 h-5 text-primary-600" />
							<h3 class="font-medium text-gray-900 dark:text-gray-100">{model.name}</h3>
						</div>
						
						<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
							{model.description}
						</p>
						
						<div class="space-y-1 text-xs text-gray-500 dark:text-gray-400">
							<div class="flex justify-between">
								<span>Parameters:</span>
								<span>{formatNumber(model.parameters)}</span>
							</div>
							<div class="flex justify-between">
								<span>Context Length:</span>
								<span>{formatNumber(model.contextLength)}</span>
							</div>
						</div>
					</div>
					
					<div class="ml-4">
						{#if $aiStore.currentModel?.id === model.id}
							{#if $aiStore.isLoading}
								<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
							{:else if $aiStore.isModelLoaded}
								<CheckCircle class="w-6 h-6 text-green-600" />
							{:else}
								<Download class="w-6 h-6 text-gray-400" />
							{/if}
						{:else}
							<Download class="w-6 h-6 text-gray-400" />
						{/if}
					</div>
				</div>
			</button>
		{/each}
	</div>
	
	{#if $aiStore.currentModel && $aiStore.isLoading}
		<div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
			<div class="flex items-center gap-3">
				<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
				<div>
					<p class="text-sm font-medium text-blue-900 dark:text-blue-100">
						Loading {$aiStore.currentModel.name}...
					</p>
					<p class="text-xs text-blue-700 dark:text-blue-300">
						This may take a few minutes on first load
					</p>
				</div>
			</div>
		</div>
	{/if}
</div> 