"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, ShoppingCart, CreditCard, TrendingUp, BarChart3, Target, Loader2, RotateCcw, Search } from "lucide-react"
import SalesModal from "@/components/modals/sales-modal"
import AgentStockRequestModal from "@/components/modals/agent-stock-request-modal"
import StockConfirmationModal from "@/components/modals/stock-confirmation-modal"
import StockReturnModal from "@/components/modals/stock-return-modal"
import { useSalesState } from "@/hooks/use-sales-state"
import { useStockRequestsState } from "@/hooks/use-stock-requests-state"
import { authService } from "@/lib/auth"
import type { Sale } from "@/lib/api"
import type { StockRequest } from "@/lib/api"

interface AgentDashboardProps {
  userName: string
}

export default function AgentDashboard({ userName }: AgentDashboardProps) {
  const sales = useSalesState([])
  const requests = useStockRequestsState([])
  const [showSalesModal, setShowSalesModal] = useState(false)
  const [showStockRequestModal, setShowStockRequestModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showStockReturnModal, setShowStockReturnModal] = useState(false)
  const [saleType, setSaleType] = useState<"b2b" | "b2c" | null>(null)
  const [filterType, setFilterType] = useState<"all" | "B2B" | "B2C">("all")
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null)
  const [salesSearchQuery, setSalesSearchQuery] = useState("")
  const [requestsSearchQuery, setRequestsSearchQuery] = useState("")

  const currentUserId = authService.getUser()?.id

  // Filter my stock requests
  const myRequests = requests.requests.filter(r => r.requested_by_id === currentUserId)
  
  // Sort requests by date (most recent first)
  const sortedRequests = [...myRequests].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })
  
  // Filter and sort requests by search query
  const filteredAndSortedRequests = sortedRequests.filter((r) => {
    if (!requestsSearchQuery.trim()) return true
    // Search in requested_by_name or notes
    return r.requested_by_name?.toLowerCase().includes(requestsSearchQuery.toLowerCase()) ||
           r.notes?.toLowerCase().includes(requestsSearchQuery.toLowerCase()) ||
           false
  })
  
  const pendingRequests = filteredAndSortedRequests.filter(r => r.status === "pending")
  const dispatchedRequests = filteredAndSortedRequests.filter(r => r.status === "dispatched")

  // Sort sales by date (most recent first)
  const sortedSales = [...sales.sales].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 
                  a.saleDate ? new Date(a.saleDate).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 
                  b.saleDate ? new Date(b.saleDate).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })

  // Filter sales by type and customer search
  const filteredSales = sortedSales.filter((s) => {
    const typeMatch = filterType === "all" || s.type === filterType
    const customerMatch = !salesSearchQuery.trim() || 
      (s.customer_name?.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
       s.customerName?.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
       false)
    return typeMatch && customerMatch
  })

  const handleCreateSale = async (newSale: Sale | Omit<Sale, "id">) => {
    try {
      await sales.addSale(newSale as any)
      await sales.refetch()
      setShowSalesModal(false)
      setSaleType(null)
    } catch (err) {
      console.error("Failed to create sale:", err)
    }
  }

  const handleCreateStockRequest = async () => {
    await requests.refetch()
    setShowStockRequestModal(false)
  }

  const handleConfirmReceipt = async () => {
    await requests.refetch()
    setShowConfirmationModal(false)
    setSelectedRequest(null)
  }

  const b2bSales = sales.sales.filter((s) => s.type === "B2B")
  const b2cSales = sales.sales.filter((s) => s.type === "B2C")
  const totalRevenue = sales.sales.reduce((sum, s) => sum + (s.totalAmount || s.total_amount || 0), 0)
  const b2bRevenue = b2bSales.reduce((sum, s) => sum + (s.totalAmount || s.total_amount || 0), 0)
  const b2cRevenue = b2cSales.reduce((sum, s) => sum + (s.totalAmount || s.total_amount || 0), 0)
  const pendingPayments = sales.sales.filter((s) => s.paymentStatus === "pending").length
  const completedPayments = sales.sales.filter((s) => s.paymentStatus === "completed").length
  const pendingAmount = sales.sales
    .filter((s) => s.paymentStatus === "pending")
    .reduce((sum, s) => sum + (s.totalAmount || s.total_amount || 0), 0)
  const averageSaleValue = sales.sales.length > 0 ? Math.round(totalRevenue / sales.sales.length) : 0
  const topProduct =
    sales.sales.length > 0
      ? Object.entries(
          sales.sales.reduce(
            (acc, s) => {
              const productName = s.productName || s.items?.[0]?.product?.name || "Unknown"
              const quantity = s.quantity || s.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
              acc[productName] = (acc[productName] || 0) + quantity
              return acc
            },
            {} as Record<string, number>,
          ),
        ).sort(([, a], [, b]) => b - a)[0]
      : null

  if (sales.loading || requests.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Agent Dashboard</h1>
        <p className="text-slate-400">Welcome {userName}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-400">₹{(totalRevenue / 1000).toFixed(1)}K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">B2B Sales</p>
              <p className="text-2xl font-bold text-blue-400">{b2bSales.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">B2C Sales</p>
              <p className="text-2xl font-bold text-cyan-400">{b2cSales.length}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-cyan-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Pending Payments</p>
              <p className="text-2xl font-bold text-amber-400">₹{(pendingAmount / 1000).toFixed(1)}K</p>
            </div>
            <CreditCard className="w-8 h-8 text-amber-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Stock Requests Section */}
      {dispatchedRequests.length > 0 && (
        <Card className="bg-amber-950/30 border-amber-700 border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold mb-1">Stock Requests Awaiting Confirmation</p>
              <p className="text-sm text-slate-400">
                You have {dispatchedRequests.length} dispatched request(s) that need confirmation
              </p>
            </div>
            <Button
              onClick={() => {
                if (dispatchedRequests[0]) {
                  setSelectedRequest(dispatchedRequests[0])
                  setShowConfirmationModal(true)
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Receipt
            </Button>
          </div>
        </Card>
      )}

      {/* Sales Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-white">Sales</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSaleType("b2b")
                setShowSalesModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New B2B Sale
            </Button>
            <Button
              onClick={() => {
                setSaleType("b2c")
                setShowSalesModal(true)
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New B2C Sale
            </Button>
            <Button
              onClick={() => {
                setShowStockRequestModal(true)
              }}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request Stock
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search by Customer */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={salesSearchQuery}
              onChange={(e) => setSalesSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterType === "all" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              All Sales
            </button>
          <button
            onClick={() => setFilterType("B2B")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterType === "B2B" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            B2B
          </button>
          <button
            onClick={() => setFilterType("B2C")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterType === "B2C" ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            B2C
          </button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 text-white font-medium">{sale.customerName || sale.customer_name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            sale.type === "B2B"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                          }`}
                        >
                          {sale.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-bold text-emerald-400">
                        ₹{(sale.totalAmount || sale.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {sale.paymentStatus === "pending" ? (
                          <span className="px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-full">
                            Pending
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50 rounded-full">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {(sale.saleDate || sale.created_at) ? new Date(sale.saleDate || sale.created_at || "").toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No sales found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-slate-400">B2B Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{(b2bRevenue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400 mt-1">{b2bSales.length} transactions</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="text-xs text-slate-400">B2C Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{(b2cRevenue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-slate-400 mt-1">{b2cSales.length} transactions</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-slate-400">Avg. Sale Value</span>
          </div>
          <p className="text-2xl font-bold text-white">₹{averageSaleValue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">
            {topProduct ? `Top: ${topProduct[0]}` : "No sales yet"}
          </p>
        </Card>
      </div>

      {/* Stock Requests */}
      {filteredAndSortedRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-bold text-white">My Stock Requests</h2>
          </div>
          
          {/* Search for Stock Requests */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search requests by user or notes..."
              value={requestsSearchQuery}
              onChange={(e) => setRequestsSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            {filteredAndSortedRequests.slice(0, 5).map((request) => (
              <Card
                key={request.id}
                className={`border-l-4 p-3 ${
                  request.status === "pending"
                    ? "bg-amber-950/30 border-l-amber-500"
                    : request.status === "dispatched"
                      ? "bg-green-950/30 border-l-green-500"
                      : request.status === "confirmed"
                        ? "bg-cyan-950/30 border-l-cyan-500"
                        : "bg-red-950/30 border-l-red-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {request.items?.[0]?.product?.name || "Multiple Products"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Qty: {request.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} •{" "}
                      {request.created_at ? new Date(request.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        request.status === "pending"
                          ? "bg-amber-500 text-amber-950"
                          : request.status === "dispatched"
                            ? "bg-green-500 text-green-950"
                            : request.status === "confirmed"
                              ? "bg-cyan-500 text-cyan-950"
                              : "bg-red-500 text-red-950"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    {request.status === "dispatched" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowConfirmationModal(true)
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showSalesModal && saleType && (
        <SalesModal
          saleType={saleType}
          onClose={() => {
            setShowSalesModal(false)
            setSaleType(null)
          }}
          onSave={handleCreateSale}
        />
      )}

      {showStockRequestModal && (
        <AgentStockRequestModal
          onClose={() => setShowStockRequestModal(false)}
          onSuccess={handleCreateStockRequest}
        />
      )}

      {showConfirmationModal && selectedRequest && (
        <StockConfirmationModal
          request={selectedRequest}
          onConfirm={handleConfirmReceipt}
          onClose={() => {
            setShowConfirmationModal(false)
            setSelectedRequest(null)
          }}
        />
      )}
      {showStockReturnModal && (
        <StockReturnModal
          userRole="agent"
          onClose={() => setShowStockReturnModal(false)}
          onSuccess={async () => {
            setShowStockReturnModal(false)
          }}
        />
      )}
    </div>
  )
}
