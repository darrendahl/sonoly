<script>
	import Pad from './Pad.svelte'	
	import Keys from './Keys.svelte'
	import Looper from './Looper.svelte'
	import {onMount} from 'svelte'
	import { initSono } from './sono'
	import {startBroadcast, listen2Broadcast, initWsConnection, closeBroadcast } from './broadcaster'
	const components = ['Keys', 'Loopers', 'Pad'];
	import shortid from 'shortid'

	let existingSessions = null
	let currentInstr = ''
	let started = false
	let currentBc = null
	let isListener = false

	function setComponent(comp){
		currentInstr = comp
	}

	function start(){
		initSono()
		started = true
		currentInstr = 'Keys'
	}

	function handleStartBroadcast(){
		// TODO: Implement multiple sessions
		// currentBc = shortid.generate()
		currentBc = 'livestream'
		initWsConnection(true)
		window.history.replaceState('', '', currentBc)
	}

	function handleCloseBroadcast(){
		closeBroadcast()		
		currentBc = null
		window.history.replaceState('', '', '')
		isListener = false
	}

	function startListening(){
		initWsConnection(false)
		start()
		started = true
	}

	onMount(() => {
		const bcId = window.location.pathname.split('/').slice(1)[0]
		if(!!bcId && !currentBc){
			isListener = true
			currentBc = bcId
		}	
	})

	const gohome = () => {
		window.location = '/'
	}

</script>

<main id="main">
	<h1 class="pointer" on:click={gohome}>Sono.ly</h1>
	{#if !started && !isListener}
		<div class="tab start" on:click={start}>
			Start Session
		</div>

		<div id="sessions">
			
		</div>
	{:else if !started && isListener}
		<div class="tab start" on:click={startListening}>
			Start Listening
		</div>
	{:else}
		
		<section class="block-container {isListener ? 'listener' : null}">

				{#if isListener}
					<div class="listen-header">Listening to Darren's Livestream...</div>
				{/if}
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
			{#if currentBc && !isListener}
				<div style="margin-bottom: 12px;">Livestreaming to https://sono.ly/{currentBc}</div>
				<div class="tab" on:click={handleCloseBroadcast}>
						Stop Livestream
				</div>
			{/if}

			{#if currentBc && isListener}
				<div class="tab" on:click={handleCloseBroadcast}>
						Stop Listening
				</div>
			{/if}

			{#if !currentBc}
				<div class="tab" on:click={handleStartBroadcast}>
						Start Livestreaming
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

	.listen-header {
		margin-bottom: 24px;
	}

	.listener {
		opacity: 0.7;
	}

	.broadcast-controls {
		width: 200px; 
		margin: 0 auto; 
		margin-top: 50px;
	}

	#sessions {
		margin-top: 48px;
	}

	.start {
		width: 150px; 
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

	.pointer{
		cursor: pointer;
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