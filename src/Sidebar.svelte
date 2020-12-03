<script>
	export let open = false
</script>

<aside class="absolute w-full h-full bg-gray-200 border-r-2 shadow-lg text-gray-600" class:open>
	<nav class="p-12 text-xl">
		<div class="header">Sono.ly is a collection of instruments you can play with your keyboard or mouse and livestream to anyone.</div>
		<a class="block" href="https://sonolib.onrender.com">Sound Library</a>
		<a class="block" href="https://github.com/bluedahltech/sono.ly">Github</a>
		<a class="block" href="https://youtube.com/watch?v=c83sUM6eWOU">Demo</a>
	</nav>
</aside>

<style>
	aside {
		z-index: 10;
		left: -100%;
		transition: left 0.3s ease-in-out;
	}

	.header{
		margin-bottom: 12px;
	}
	
	.open {
		left: 0;
	}
</style>