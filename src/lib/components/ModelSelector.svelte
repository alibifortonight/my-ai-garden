<script lang="ts">
	import { modelStore, modelActions } from '$lib/stores/model';
	import { Brain, Download, CheckCircle } from 'lucide-svelte';
	import type { ModelInfo } from '$lib/utils/wllama';

	async function loadModelHandler(model: ModelInfo) {
		try {
			await modelActions.loadModel(model);
		} catch (error) {
			console.error('Failed to load model:', error);
		}
	}
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Select AI Model</h2>

	<div class="grid gap-4 md:grid-cols-2">
		{#each $modelStore.availableModels as model (model.id)}
			<button
				class="card cursor-pointer transition-all hover:shadow-md text-left {$modelStore.currentModel?.model.id === model.id ? 'ring-2 ring-primary-500' : ''}"
				onclick={() => loadModelHandler(model)}
				onkeydown={(e) => e.key === 'Enter' && loadModelHandler(model)}
				disabled={$modelStore.isLoading}
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
								<span>{modelActions.formatNumber(model.parameters)}</span>
							</div>
							<div class="flex justify-between">
								<span>Context Length:</span>
								<span>{modelActions.formatNumber(model.contextLength)}</span>
							</div>
							<div class="flex justify-between">
								<span>Size:</span>
								<span>{modelActions.formatModelSize(model.size)}</span>
							</div>
						</div>
					</div>

					<div class="ml-4">
						{#if $modelStore.currentModel?.model.id === model.id}
							{#if $modelStore.isLoading}
								<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
							{:else if $modelStore.currentModel?.isLoaded}
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

	{#if $modelStore.isLoading && $modelStore.downloadProgress}
		<div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
			<div class="flex items-center gap-3">
				<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
				<div>
					<p class="text-sm font-medium text-blue-900 dark:text-blue-100">
						{$modelStore.downloadProgress.status === 'downloading' ? 'Downloading' : 'Loading'} {$modelStore.currentModel?.model.name}...
					</p>
					{#if $modelStore.downloadProgress.status === 'downloading'}
						<progress
							class="w-full"
							value={$modelStore.downloadProgress.loaded}
							max={$modelStore.downloadProgress.total}
						></progress>
						<p class="text-xs text-blue-700 dark:text-blue-300">
							{modelActions.formatModelSize($modelStore.downloadProgress.loaded)} / {modelActions.formatModelSize($modelStore.downloadProgress.total)}
						</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>