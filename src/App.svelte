<script>
	import Pad from './Pad.svelte'	
	import Keys from './Keys.svelte'
	import Looper from './Looper.svelte'
	import {onMount} from 'svelte'
	import { initSono } from './sono'
	import initWs, { sendMsg, initBinaryJS, closeBinaryJS, listen } from './websocket-api'
	const components = ['Keys', 'Loopers', 'Pad'];
	import shortid from 'shortid'

	let existingSessions = null
	let currentInstr = ''
	let started = false
	let sessionBroadcasted = false
	let currentBc = null

	function setComponent(comp){
		current = comp
	}

	function start(){
		initSono()
		started = true
		currentInstr = 'Keys'
	}

	function handleStartBroadcast(){
		const bcId = shortid.generate()
		// initWs()
		// const url = new URL(window.location);
		window.history.replaceState('', '', bcId)
		sessionBroadcasted = true
		currentBc = bcId
	}

	function handleListenBc(){

	}

	onMount(() => {
		const bcId = window.location.pathname.split('/').slice(1)[0]
		console.log(bcId)
		if(!!bcId && !currentBc){
			currentBc = bcId
			start()
			handleListenBc()
		}	
	})

</script>

<main id="main">
	<h1>Sono.ly</h1>
	{#if !started}
		<div class="tab start" on:click={start}>
			Start Session
		</div>

		{#if existingSessions}
			<div class="tab" on:click={start}>
				Session id
			</div>
		{/if}
	{:else}
	
		<section class="block-container">
			 <header>
				{#each components as comp}
					<div class="tab {currentInstr === comp ? 'selected' : ''}" on:click={() => setComponent(comp)}>{comp}</div>
				{/each}
			</header>
			<div class="instrument keys {currentInstr === 'Keys' ? 'show' : 'hide'}">
				{#if currentInstr === 'Keys'}
					<Keys />
				{/if}
			</div>
			<div class="instrument looper {currentInstr === 'Loopers' ? 'show' : 'hide'}">
				<Looper />
			</div>	
			<div class="instrument pad {currentInstr === 'Pad' ? 'show' : 'hide'}">
				<Pad />
			</div>
		</section>
	<section class="broadcast-controls">
			{#if !currentBc}
				<div class="tab" on:click={handleStartBroadcast}>
						Broadcast Session
				</div>
			{/if}
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

	.broadcast-controls {
		width: 200px; 
		margin: 0 auto; 
		margin-top: 50px;
	}

	.start {
		width: 100px; 
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
		padding: 12px;
		width: 70%;
		margin: 0 auto;
	}

	.instrument {
		margin: 0 auto;
		margin-top: 24px;
		padding: 24px;
		border: 1px solid #efefef;
		background: #fcfcfc;
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