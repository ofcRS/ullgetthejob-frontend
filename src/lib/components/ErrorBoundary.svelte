<script lang="ts">
	import { onMount } from 'svelte'

	export let fallback: string = 'Something went wrong'
	export let showDetails: boolean = false
	export let onError: ((error: Error) => void) | null = null

	let hasError = false
	let error: Error | null = null
	let errorInfo: { componentStack?: string } = {}

	onMount(() => {
		const handleError = (event: ErrorEvent) => {
			event.preventDefault()
			hasError = true
			error = event.error

			// Call optional error callback
			if (onError && error) {
				onError(error)
			}

			// Log to console in development
			if (import.meta.env.DEV) {
				console.error('[ErrorBoundary] Caught error:', error)
			}

			// TODO: Send to error tracking service (Sentry, etc.)
		}

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			event.preventDefault()
			hasError = true
			error = new Error(event.reason?.message || 'Unhandled promise rejection')

			if (onError && error) {
				onError(error)
			}

			if (import.meta.env.DEV) {
				console.error('[ErrorBoundary] Unhandled rejection:', event.reason)
			}
		}

		window.addEventListener('error', handleError)
		window.addEventListener('unhandledrejection', handleUnhandledRejection)

		return () => {
			window.removeEventListener('error', handleError)
			window.removeEventListener('unhandledrejection', handleUnhandledRejection)
		}
	})

	function retry() {
		hasError = false
		error = null
		errorInfo = {}
		window.location.reload()
	}

	function goHome() {
		window.location.href = '/'
	}
</script>

{#if hasError}
	<div class="error-boundary-container min-h-screen flex items-center justify-center bg-gray-50 px-4">
		<div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
			<div class="text-center mb-6">
				<div class="text-6xl mb-4">⚠️</div>
				<h2 class="text-2xl font-bold text-gray-900 mb-2">{fallback}</h2>
				<p class="text-gray-600">We're sorry, but something unexpected happened.</p>
			</div>

			{#if showDetails && error}
				<details class="mb-6 bg-gray-50 rounded-lg p-4">
					<summary class="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
						Error details
					</summary>
					<div class="mt-4 space-y-2">
						<div class="text-sm">
							<span class="font-semibold text-gray-700">Message:</span>
							<p class="text-red-600 mt-1">{error.message}</p>
						</div>
						{#if error.stack}
							<div class="text-sm">
								<span class="font-semibold text-gray-700">Stack trace:</span>
								<pre
									class="mt-1 text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">{error.stack}</pre>
							</div>
						{/if}
					</div>
				</details>
			{/if}

			<div class="flex flex-col sm:flex-row gap-3 justify-center">
				<button
					on:click={retry}
					class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
				>
					Retry
				</button>
				<button
					on:click={goHome}
					class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
				>
					Go to Homepage
				</button>
			</div>

			<div class="mt-6 text-center text-sm text-gray-500">
				<p>
					If this problem persists, please contact support with the error details above.
				</p>
			</div>
		</div>
	</div>
{:else}
	<slot />
{/if}

<style>
	.error-boundary-container {
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
