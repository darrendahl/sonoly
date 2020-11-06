<script>
  import sono from './sono'

  let m = {x: null, y: null}
  let prevM = {x: null, y: null}
  let to
  let count = 0
  function handleMove(evt){
    var canvas = document.getElementById('pad');

    var rect = canvas.getBoundingClientRect();

    prevM = m
    m.x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
    m.y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.fillStyle = '#ff3e00';
      // ctx.moveTo(m.x, m.y);
      ctx.fillRect(m.x, m.y, 1, 1);
      // ctx.stroke();
      // ctx.moveTo(prevM.x, prevM.y);
      // ctx.lineTo(m.x, m.y);
      // ctx.strokeStyle = 'blue';
      // ctx.lineWidth = 1;
      // ctx.stroke();
      // ctx.closePath();
      count++

      if(count % 10 === 0){
        console.log(m, count)
        sono().playSweep(m, true)
      }


      clearTimeout(to)
      to = setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }, 100)
    }


  }

  function stopPlaying(){
    sono().stop()
  }


</script>

<canvas id="pad" width="500" height="250" on:mousemove={handleMove} on:mouseout={stopPlaying}></canvas>

<style>
  canvas{
    border: 1px solid #0f0f0f;
    background: #f3f3f3;
    border-radius: 1px;
    margin: 0 auto;
    margin-top: 25px
  }
</style>