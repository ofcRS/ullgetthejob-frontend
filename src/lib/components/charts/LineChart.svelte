<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js'

  // Register Chart.js components
  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler
  )

  export let data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
      fill?: boolean
      tension?: number
    }>
  }
  export let title: string = ''
  export let height: number = 300

  let canvas: HTMLCanvasElement
  let chart: Chart | null = null

  onMount(() => {
    createChart()
  })

  onDestroy(() => {
    if (chart) {
      chart.destroy()
    }
  })

  function createChart() {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    chart = new Chart(ctx, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: data.datasets.length > 1,
            position: 'bottom'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    })
  }

  // Update chart when data changes
  $: if (chart && data) {
    chart.data = data
    chart.update('active')
  }
</script>

<div class="chart-container" style="height: {height}px">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
  }
</style>
