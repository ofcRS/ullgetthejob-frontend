import { apiClient } from './client'
import type { DashboardStats, DailyStrategy, MarketInsight } from '$lib/types'

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>('/api/dashboard/stats')
}

export async function getDailyStrategies(): Promise<DailyStrategy[]> {
  return apiClient.get<DailyStrategy[]>('/api/dashboard/strategies')
}

export async function getMarketInsights(): Promise<MarketInsight[]> {
  return apiClient.get<MarketInsight[]>('/api/dashboard/insights')
}

export async function refreshDashboard(): Promise<{
  stats: DashboardStats
  strategies: DailyStrategy[]
  insights: MarketInsight[]
}> {
  return apiClient.post<{
    stats: DashboardStats
    strategies: DailyStrategy[]
    insights: MarketInsight[]
  }>('/api/dashboard/refresh', {})
}

export async function dismissStrategy(strategyId: string): Promise<void> {
  return apiClient.post<void>(`/api/dashboard/strategies/${strategyId}/dismiss`, {})
}
