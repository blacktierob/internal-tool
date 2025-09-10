import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboard.service'
import type { 
  DashboardKPIs, 
  TodaysFunction, 
  RecentActivityItem 
} from '../services/dashboard.service'

export interface UseDashboardOptions {
  autoFetch?: boolean
  refreshInterval?: number // milliseconds
}

export interface UseDashboardReturn {
  kpis: DashboardKPIs | null
  todaysFunctions: TodaysFunction[]
  upcomingFunctions: TodaysFunction[]
  recentActivity: RecentActivityItem[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  clearError: () => void
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { autoFetch = true, refreshInterval } = options
  
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [todaysFunctions, setTodaysFunctions] = useState<TodaysFunction[]>([])
  const [upcomingFunctions, setUpcomingFunctions] = useState<TodaysFunction[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch all dashboard data in parallel
      const [
        kpisData,
        todaysData,
        upcomingData,
        activityData
      ] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getTodaysFunctions(),
        dashboardService.getUpcomingFunctions(7),
        dashboardService.getRecentActivity(10)
      ])
      
      setKpis(kpisData)
      setTodaysFunctions(todaysData)
      setUpcomingFunctions(upcomingData)
      setRecentActivity(activityData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      setError(errorMessage)
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await fetchDashboardData()
  }

  const clearError = () => {
    setError(null)
  }

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchDashboardData()
    }
  }, [autoFetch])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchDashboardData()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  return {
    kpis,
    todaysFunctions,
    upcomingFunctions,
    recentActivity,
    loading,
    error,
    refresh,
    clearError
  }
}