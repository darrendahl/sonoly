<script>
	import Pad from './Pad.svelte'	
	import Keys from './Keys.svelte'
	import Looper from './Looper.svelte'
	import { initSono } from './sono'
	const components = ['Keys', 'Loopers', 'Pad'];

	let current = ''
	let started = false

	function setComponent(comp){
		current = comp
	}

	function start(){
		initSono()
		started = true
		current = 'Keys'
	}

</script>

<main id="main">
	<h1>Sono.ly</h1>
	{#if !started}
		<div class="tab start" on:click={start}>
			Start
		</div>
	{:else}
		<section class="block-container">
			 <header>
				{#each components as comp}
					<div class="tab {current === comp ? 'selected' : ''}" on:click={() => setComponent(comp)}>{comp}</div>
				{/each}
			</header>
			<div class="instrument {current === 'Keys' ? 'show' : 'hide'}">
				{#if current === 'Keys'}
					<Keys />
				{/if}
			</div>
			<div class="instrument {current === 'Loopers' ? 'show' : 'hide'}">
				<Looper />
			</div>	
			<div class="instrument {current === 'Pad' ? 'show' : 'hide'}">
				<Pad />
			</div>
		</section>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	.start {
		width: 80px; 
		margin: 0 auto; 
		margin-top: -24px; 
	}

	.hide {
		display: none;
	}

	.show {
		display: block;
	}

	.tab{
		border: 1px solid #ff3e00;
		padding: 4px;
		cursor: pointer;
	}

	.block-container {
		/*border: 1px solid #efefef;*/
		/*background: #fdfdfd;*/
		padding: 24px;
		width: 800px;
		margin: 0 auto;
	}

	.tab:hover, .tab.selected{
		background: #ff3e00;
		color: white;
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