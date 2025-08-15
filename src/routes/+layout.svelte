<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="AI Garden - Run AI models in your browser with WebAssembly" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>AI Garden</title>
</svelte:head>

{@render children?.()}
