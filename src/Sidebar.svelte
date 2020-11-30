<script>
	export let open = false
</script>

<aside class="absolute w-full h-full bg-gray-200 border-r-2 shadow-lg text-gray-600" class:open>
	<nav class="p-12 text-xl">
		<a class="block" href="https://sonolib.onrender.com">Sound Library</a>
		<a class="block" href="https://github.com/bluedahltech/sono.ly">Github</a>
		<a class="block" href="https://youtube.com/watch?v=ypBi8fA_YBM">Demo</a>
	</nav>
</aside>

<style>
	aside {
		left: -100%;
		transition: left 0.3s ease-in-out
	}
	
	.open {
		left: 0
	}
</style>