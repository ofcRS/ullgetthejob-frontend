<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    Chart,
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend
  } from 'chart.js'

  // Register Chart.js components
  Chart.register(
    DoughnutController,
    ArcElement,
    Tooltip,
    Legend
  )

  export let data: {
    labels: string[]
    datasets: Array<{
      data: number[]
      backgroundColor?: string[]
      borderColor?: string[]
      borderWidth?: number
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
  }

  function createChart() {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    chart = new Chart(ctx, {
      type: 'doughnut',
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
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] as number
                    const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: (data.datasets[0].backgroundColor as string[])[i],
                      hidden: false,
                      index: i
                    }
                  })
                }
                return []
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const dataset = context.dataset
                const total = (dataset.data as number[]).reduce((a: number, b: number) => a + b, 0)
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                return `${label}: ${value} (${percentage}%)`
              }
            }
          }
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
