import { supabase } from './supabase'

export interface DashboardKPIs {
  totalOrders: number
  activeCustomers: number
  todaysFunctions: number
  pendingFittings: number
  revenueThisMonth: number
  completedOrdersThisMonth: number
}

export interface TodaysFunction {
  id: string
  order_number: string
  customer_name: string
  wedding_date: string
  wedding_venue: string | null
  status: string
  actual_members: number
  total_members: number
}

export interface RecentActivityItem {
  id: string
  action: string
  user_name: string
  entity_type: string
  entity_name: string | null
  description: string
  created_at: string
}

class DashboardService {
  
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0]
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      
      // Total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      // Active customers (customers with orders in the last 12 months)
      const { count: activeCustomers } = await supabase
        .from('customers')
        .select('*, orders!inner(*)', { count: 'exact', head: true })
        .gte('orders.created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      
      // Today's functions (weddings happening today)
      const { count: todaysFunctions } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('wedding_date', today)
      
      // Pending fittings (orders with members less than total expected)
      const { data: allActiveOrders } = await supabase
        .from('order_summary')
        .select('id, actual_members, total_members')
        .in('status', ['confirmed', 'in_progress'])
      
      const ordersNeedingFittings = allActiveOrders?.filter(order => 
        order.actual_members < order.total_members) || []
      
      const pendingFittings = ordersNeedingFittings.reduce((sum, order) => 
        sum + (order.total_members - order.actual_members), 0)
      
      // Revenue this month (simplified - would need pricing calculation)
      const { count: completedOrdersThisMonth } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('wedding_date', startOfMonth)
      
      return {
        totalOrders: totalOrders || 0,
        activeCustomers: activeCustomers || 0,
        todaysFunctions: todaysFunctions || 0,
        pendingFittings: pendingFittings,
        revenueThisMonth: (completedOrdersThisMonth || 0) * 800, // Estimated average order value
        completedOrdersThisMonth: completedOrdersThisMonth || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      throw new Error('Failed to fetch dashboard KPIs')
    }
  }
  
  async getTodaysFunctions(): Promise<TodaysFunction[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('order_summary')
        .select('*')
        .eq('wedding_date', today)
        .order('customer_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching today\'s functions:', error)
        throw new Error(`Failed to fetch today's functions: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('DashboardService.getTodaysFunctions error:', error)
      throw error
    }
  }
  
  async getUpcomingFunctions(days = 7): Promise<TodaysFunction[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('order_summary')
        .select('*')
        .gte('wedding_date', today)
        .lte('wedding_date', endDate)
        .order('wedding_date', { ascending: true })
        .order('customer_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching upcoming functions:', error)
        throw new Error(`Failed to fetch upcoming functions: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('DashboardService.getUpcomingFunctions error:', error)
      throw error
    }
  }
  
  async getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching recent activity:', error)
        throw new Error(`Failed to fetch recent activity: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('DashboardService.getRecentActivity error:', error)
      throw error
    }
  }
}

const dashboardService = new DashboardService()

export { dashboardService }
export default dashboardService