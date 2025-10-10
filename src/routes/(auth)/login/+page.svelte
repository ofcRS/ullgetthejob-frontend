<script lang="ts">
  let email = $state('')
  let password = $state('')

  async function login() {
    // TODO: implement login
    console.log('Login:', { email, password })
  }
</script>

<div class="container mx-auto p-6 max-w-md">
  <h1 class="text-3xl font-bold mb-6">Login</h1>

  <form on:submit|preventDefault={login} class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium mb-1">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium mb-1">Password</label>
      <input
        id="password"
        type="password"
        bind:value={password}
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
      Login
    </button>
  </form>
</div>
