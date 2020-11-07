<script>
	import Pad from './Pad.svelte'	
	import Keys from './Keys.svelte'

	import { initSono } from './sono'
	const components = ['Pad', 'Keys', 'Looper'];

	let current = ''
	let started = false

	function setComponent(comp){
		if(!started) start()
		current = comp
	}

	function start(){
		initSono()
		started = true
	}

</script>

<main id="main">
	<h1>Sono.ly</h1>
 <header>
			{#each components as comp}
				<div class="tab {current === comp ? 'selected' : ''}" on:click={() => setComponent(comp)}>{comp}</div>
			{/each}

		</header>
		{#if current === 'Pad'}
			<Pad />
		{:else if current === 'Keys'}
			<Keys />
		{:else if current === 'Looper'}
			<section>Looper</section>
		{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	.tab{
		border: 1px solid #ff3e00;
		padding: 4px;
		cursor: pointer;
	}


	.tab:hover, .tab.selected{
		background: #ff3e00;
		color: white;
	}

	section{
		margin-top: 100px;
	}

	header {
		display: flex;
		margin: 0 auto;
		width: 250px;
		justify-content: space-between;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>