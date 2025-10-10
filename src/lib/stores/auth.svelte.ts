import { api } from '$lib/api/client'
import { browser } from '$app/environment'
import { writable } from 'svelte/store'

export interface User {
  id: string
  email: string
  name?: string
}

export const user = writable<User | null>(null)
export const isAuthenticated = writable(false)
export const isLoading = writable(true)

class AuthStore {
  constructor() {
    if (browser) {
      this.initializeAuth()
    }
  }

  private async initializeAuth() {
    try {
      // Check if we have a stored token and validate it
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Try to get user info to validate the token
        await this.refreshUser()
      }
    } catch (error) {
      // Token is invalid, clear it
      if (browser) {
        localStorage.removeItem('auth_token')
      }
      api.setToken(null)
    } finally {
      isLoading.set(false)
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response

      this.setAuth(token, userData)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {})
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error)
    } finally {
      this.clearAuth()
    }
  }

  private setAuth(token: string, userData: User) {
    api.setToken(token)
    user.set(userData)
    isAuthenticated.set(true)
  }

  private clearAuth() {
    api.setToken(null)
    if (browser) {
      localStorage.removeItem('auth_token')
    }
    user.set(null)
    isAuthenticated.set(false)
  }

  private async refreshUser(): Promise<void> {
    try {
      const userData = await api.get('/auth/me')
      user.set(userData)
      isAuthenticated.set(true)
    } catch (error) {
      throw new Error('Failed to refresh user data')
    }
  }

  // Method to check if current user can perform certain actions
  hasPermission(permission: string): boolean {
    // Implement based on your permission system
    let auth: boolean
    isAuthenticated.subscribe(value => auth = value)
    return auth
  }
}

export const authStore = new AuthStore()
