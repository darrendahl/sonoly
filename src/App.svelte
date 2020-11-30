<script>
	import Pad from './Pad.svelte'	
	import Keys from './Keys.svelte'
	import Looper from './Looper.svelte'
	import Navbar from './Navbar.svelte'
	import Sidebar from './Sidebar.svelte'
	import {onMount, onDestroy} from 'svelte'
	import { initSono } from './sono'
	import { listeners, broadcastStatus } from './stores'
	import { getActiveLivestreams } from './api'
	import { hri } from 'human-readable-ids'
	import {startBroadcast, listen2Broadcast, initWsConnection, closeBroadcast } from './broadcaster'
	const components = ['Keys', 'Loopers', 'Pad'];
	import shortid from 'shortid'
	let existingSessions = []
	let activeListeners = []
	let currentInstr = ''
	let started = false
	let currentBc = null
	let isListener = false
	let bcStatus = false

	const BASE_SONO_URL =
	  process.env === "dev"
	    ? "http://localhost:5000"
	    : "https://sono.ly";

	function setComponent(comp){
		currentInstr = comp
	}

	function start(){
		initSono()
		started = true
		currentInstr = 'Keys'
	}

	function copy(text) {
	    var input = document.createElement('textarea');
	    input.innerHTML = text;
	    document.body.appendChild(input);
	    input.select();
	    var result = document.execCommand('copy');
	    document.body.removeChild(input);
	    return result;
	}

	function handleStartBroadcast(){
		// TODO: Implement multiple sessions
		// currentBc = shortid.generate()
		currentBc = hri.random()
		initWsConnection(true, currentBc)
		window.history.replaceState('', '', currentBc)
	}

	function handleCloseBroadcast(returnHome){
		closeBroadcast()		
		currentBc = null
		window.history.replaceState('', '', '')
		isListener = false		

		if(returnHome){
			window.location = '/'
		}
	}

	function startListening(){
		initWsConnection(false, currentBc)
		start()
		started = true
	}

	onMount(async () => {
		const bcId = window.location.pathname.split('/').slice(1)[0]
		if(!!bcId && !currentBc){
			isListener = true
			currentBc = bcId
		} else {
			existingSessions = await getActiveLivestreams()
		}
	})


	const unsubscribeL = listeners.subscribe((value) => {
		activeListeners = value
	})

	const unsubscribeBs = broadcastStatus.subscribe((value) => {
		bcStatus = value
	})

	onDestroy(() => {
		unsubscribeL()
		unsubscribeBs()
	})

	const gohome = () => {
		window.location = '/'
	}

	let open = false

</script>

<Sidebar bind:open/>
<Navbar bind:sidebar={open}/>

<main id="main">
	<h1 class="pointer" on:click={gohome}>Sono.ly</h1>
	{#if !started && !isListener}
		<div class="tab start" on:click={start}>
			Start Session
		</div>

		{#if existingSessions.length > 0}
			<div class="sessions">
				<div class="sessions-header">Or listen to active livestreams:</div>
				{#each existingSessions as session}
					<a href={session}><div  class="tab">{session}'s livestream</div></a>
				{/each}
			</div>
		{/if}
	{:else if !started && isListener}
		<div class="tab start" on:click={startListening}>
			Start Listening
		</div>
	{:else}
		
		<section class="block-container {isListener ? 'listener' : null}">

				{#if isListener}
					<div class="listen-header">{bcStatus === false ? `Listening to ${currentBc}'s Livestream...` : bcStatus}</div>
				{/if}
			 <header>
				{#each components as comp}
					<div class="tab {currentInstr === comp ? 'selected' : ''}" on:click={() => setComponent(comp)}>{comp}</div>
				{/each}
			</header>
			<div class="instrument keys {currentInstr === 'Keys' ? 'show' : 'hide'}">
					<Keys currentInstr={currentInstr} />
			</div>
			<div class="instrument looper {currentInstr === 'Loopers' ? 'show' : 'hide'}">
				<Looper />
			</div>	
			<div class="instrument pad {currentInstr === 'Pad' ? 'show' : 'hide'}">
				<Pad />
			</div>
		</section>

		{#if currentBc && !isListener}
			<div style="margin-top: 12px;">Livestreaming to {BASE_SONO_URL}/{currentBc} <span class="copy" on:click={() => copy(`${BASE_SONO_URL}/${currentBc}`)}>copy</span></div>
		{/if}
		<section class="broadcast-controls">
			{#if currentBc && !isListener}
				<div class="tab" on:click={handleCloseBroadcast}>
						Stop Livestream
				</div>
			{/if}

			{#if currentBc && isListener}
				<div class="tab" on:click={() => handleCloseBroadcast(true)}>
						Return Home
				</div>
			{/if}

			{#if !currentBc}
				<div class="tab" on:click={handleStartBroadcast}>
						Start Livestreaming
				</div>
			{/if}

			{#if activeListeners.length > 0}
				<div><div>Active Listeners</div>
					{#each activeListeners as al}
						<div>{al}</div>
					{/each}
				</div>
			{/if}
		</section>
		<footer>
			<a href="https://sonolib.onrender.com" target="_blank"><div class="tab">View Sound Library</div></a>
		</footer>
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
		margin-bottom: 12px;
	}
	.sessions-header{
		margin-bottom: 12px;
	}

	.sessions {
		margin: 0 auto;
		width: 250px;
		margin-top: 64px;
	}

	footer {
		width: 200px;
		margin: 0 auto;
	}

	.sessions a, footer a {
		color: #333;
	}

	.sessions a:hover, footer a:hover{
		color: white;
		text-decoration: none;
	}

	.start {
		width: 150px; 
		margin: 0 auto; 
	}

	.hide {
		display: none;
	}

	.copy {
		border: 1px solid #bababa;
		padding: 2px;
		font-size: 12px;
		margin-left: 12px;
		cursor: pointer;
	}

	.copy:hover{
		opacity: 0.9;
		background: #bababa;
	}

	.show {
		display: block;
	}

	.tab{
		border: 1px solid #ff3e00;
		padding: 4px;
		cursor: pointer;
	}

	.sessions .tab {
		margin-bottom: 12px;
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