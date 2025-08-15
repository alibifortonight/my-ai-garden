<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import ModelSelector from '$lib/components/ModelSelector.svelte';
	import { modelStatus } from '$lib/stores/model';

	let { children } = $props();

	let sidebarOpen = $state(true);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="AI Garden - Run AI models in your browser with WebAssembly" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>AI Garden</title>
</svelte:head>

<!-- Layout wrapper -->
<div class="flex min-h-screen flex-col bg-gray-100 text-gray-900">

<!-- Header -->
<header class="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white shadow-md">
	<div class="container mx-auto flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<h1 class="text-2xl font-bold">AI Garden</h1>
			<!-- Optional Sidebar Toggle Button -->
			<!-- <button onclick={toggleSidebar} class="text-white focus:outline-none lg:hidden">
				<svg
					class="h-6 w-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
					></path>
				</svg>
			</button> -->
		</div>
		<div class="flex items-center space-x-4">
			<ModelSelector />
			<span class="text-sm">Model Status: {$modelStatus}</span>
		</div>
	</div>
</header>

<!-- Main Content Area -->
<main class="container mx-auto flex flex-grow p-4">
	{@render children?.()}
</main>

</div>
