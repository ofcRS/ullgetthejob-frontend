<script lang="ts">
  export let value: string = ''
  export let readonly = false
  const onInput = (e: Event) => {
    const el = e.target as HTMLTextAreaElement
    value = el.value
    const event = new CustomEvent('change', { detail: value })
    dispatchEvent(event)
  }
</script>

<textarea
  class="w-full min-h-[220px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  bind:value
  on:input={onInput}
  {readonly}
/>


