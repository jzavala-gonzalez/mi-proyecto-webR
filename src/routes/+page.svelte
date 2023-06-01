<script>

    // Importar webR
    import { WebR } from '@r-wasm/webr';
    const webR = new WebR();
  
    // Funcion asincrónica para iniciar webR
    let webR_ready = false;
    let webR_cargando = false;
    async function start_webR() {
        webR_cargando = true;
        await webR.init();
        webR_ready = true;
        console.log('webR está listo!'); // Mensaje en consola
    }
  
    // start_webR(); // Comenzar inicializacion

    // 1. Una función asincrónica para evaluar R
  let algun_resultado = undefined;
  async function evaluar_codigo_R(mi_codigo) {
    const resultado = await webR.evalR(mi_codigo);
    const resultado_JS = await resultado.toJs();

    algun_resultado = resultado_JS;
  }


  // 2. Un comando encargado de iniciar dicha función
  $: if (webR_ready) {
      const code_string = 'print("hola, mundo!")';
      evaluar_codigo_R(code_string);
  }


  let numero_bins = 10;
  $: mi_codigo_plot = `
  nbins <- ${numero_bins}
  x <- faithful$waiting
  bins <- seq(min(x), max(x), length.out = nbins + 1)

  hist(x, breaks = bins, col = "#75AADB", border = "white",
      xlab = "Waiting time to next eruption (in mins)",
      main = "Histogram of waiting times")
  `

  // From https://github.com/hrbrmstr/webr-experiments/blob/batman/ggwebr/main.js
  async function plotR(plot_code) {
    const webRCodeShelter = await new webR.Shelter();

    // Usar un display de canvas
    await webR.evalRVoid(
      `canvas(width=${canvas_width/2}, \
      height=${canvas_height/2})`
    );

    // Capturar resultado del plot
    const result = await webRCodeShelter.captureR(plot_code, {
        withAutoprint: true,
        captureStreams: true,
        captureConditions: false,
        env: webR.objs.globalEnv,
    });

    await webR.evalRVoid("dev.off()");

    // Devolver resultados / mensajes
    const msgs = await webR.flush();
    return msgs;
  }


  $: if (webR_ready) {
      plotR(mi_codigo_plot)
          .then((msgs) => {
              console.log('plotR msgs', msgs);

              // Dibujar en el canvas según
              // las instrucciones de los mensajes
              msgs.forEach(m => {
                  if (m.type === 'canvasExec') Function(`this.getContext('2d').${m.data}`).bind(my_canvas)();
              });
          })
  }

  // Settings para el elemento canvas
  let my_canvas; // El elemento como tal
  let canvas_width = 800;
  let canvas_height = 600;

  
  </script>
  
  <!-- Un nuevo botón al mismo comienzo -->
<button on:click={start_webR} disabled='{webR_cargando}'>
    Iniciar!
  </button>


  <p>
  {#if webR_ready}
    webR está listo!
  {:else if webR_cargando}
    webR está cargando...
  {:else}
    webR no está listo
  {/if}
</p>

  <p>
    {#if algun_resultado}
      Resultado: {algun_resultado.values}
    {:else}
      Esperando algun resultado...
    {/if}
  </p>

  <div>
    <input type="range" id="num_bins" name="Numero de bins"
           min="1" max="30" bind:value={numero_bins}>
    <label for="num_bins">Numero de bins</label>
    <p>{numero_bins} bins</p>
</div>

  <!-- Un elemento canvas para dibujar el plot -->
<canvas bind:this={my_canvas}
width={canvas_width} height={canvas_height}>
</canvas>