<script lang="ts">
  const features = [
    {
      title: 'AI Chat Assistant',
      description: 'Get personalized help with your job search from our context-aware AI',
      icon: '💬',
      href: '/chat',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400'
    },
    {
      title: 'AI Dashboard',
      description: 'Track your progress with daily strategies and market insights',
      icon: '📊',
      href: '/dashboard',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400'
    },
    {
      title: 'CV Builder',
      description: 'Build your perfect CV with live AI suggestions',
      icon: '📝',
      href: '/cv/builder',
      color: 'bg-green-50 border-green-200 hover:border-green-400'
    },
    {
      title: 'Application Strategy',
      description: 'Get AI-powered job prioritization and timing recommendations',
      icon: '🎯',
      href: '/strategy',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400'
    }
  ]

  const workflow = [
    { step: 1, title: 'Upload CV', href: '/upload', icon: '📤' },
    { step: 2, title: 'Search Jobs', href: '/search', icon: '🔍' },
    { step: 3, title: 'Customize', href: '/jobs', icon: '✨' },
    { step: 4, title: 'Apply', href: '/queue', icon: '🚀' }
  ]
</script>

<div class="container mx-auto px-4 py-12 max-w-6xl">
  <!-- Hero Section -->
  <div class="text-center mb-16">
    <h1 class="text-5xl font-bold text-gray-900 mb-4">UllGetTheJob</h1>
    <p class="text-xl text-gray-600 mb-8">AI-powered job application assistant</p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a href="/upload" class="btn btn-primary text-lg px-8 py-3">Start: Upload CV</a>
      <a href="/search" class="btn text-lg px-8 py-3">Search Jobs</a>
    </div>
  </div>

  <!-- AI Features Grid -->
  <div class="mb-16">
    <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">AI-Powered Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each features as feature}
        <a
          href={feature.href}
          class="block p-6 bg-white border-2 rounded-lg {feature.color} transition-all hover:shadow-lg"
        >
          <div class="flex items-start gap-4">
            <div class="text-4xl">{feature.icon}</div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p class="text-gray-600">{feature.description}</p>
            </div>
            <svg
              class="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </a>
      {/each}
    </div>
  </div>

  <!-- Workflow Steps -->
  <div class="mb-16">
    <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      {#each workflow as item}
        <a
          href={item.href}
          class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all text-center border-2 border-transparent hover:border-blue-400"
        >
          <div class="text-5xl mb-3">{item.icon}</div>
          <div
            class="text-sm font-semibold text-blue-600 mb-2"
          >
            Step {item.step}
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{item.title}</h3>
        </a>
      {/each}
    </div>
  </div>

  <!-- Quick Links -->
  <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white text-center">
    <h2 class="text-2xl font-bold mb-4">Ready to Get Started?</h2>
    <p class="mb-6 text-blue-100">
      Join thousands of job seekers using AI to land their dream jobs
    </p>
    <div class="flex flex-wrap gap-3 justify-center">
      <a href="/upload" class="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
        Upload Your CV
      </a>
      <a href="/chat" class="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
        Chat with AI
      </a>
      <a href="/dashboard" class="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
        View Dashboard
      </a>
    </div>
  </div>

  <!-- Features List -->
  <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
    <div class="p-6">
      <div class="text-3xl mb-3">🎯</div>
      <h3 class="font-semibold text-gray-900 mb-2">Smart Matching</h3>
      <p class="text-sm text-gray-600">
        AI analyzes your skills and matches them with job requirements in real-time
      </p>
    </div>
    <div class="p-6">
      <div class="text-3xl mb-3">⚡</div>
      <h3 class="font-semibold text-gray-900 mb-2">Auto-Apply</h3>
      <p class="text-sm text-gray-600">
        Customize CVs and submit applications automatically with intelligent rate limiting
      </p>
    </div>
    <div class="p-6">
      <div class="text-3xl mb-3">📈</div>
      <h3 class="font-semibold text-gray-900 mb-2">Track Progress</h3>
      <p class="text-sm text-gray-600">
        Monitor your applications and get actionable insights to improve success rate
      </p>
    </div>
  </div>
</div>