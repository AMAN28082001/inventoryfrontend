"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle, Clock, XCircle, ShoppingCart, AlertCircle, TrendingUp, Loader2 } from "lucide-react"
import AdminStockRequestModal from "@/components/modals/admin-stock-request-modal"
import EnhancedRequestApprovalModal from "@/components/modals/enhanced-request-approval-modal"
import StockConfirmationModal from "@/components/modals/stock-confirmation-modal"
import { useStockRequestsState } from "@/hooks/use-stock-requests-state"
import { authService } from "@/lib/auth"
import type { StockRequest } from "@/lib/api"

interface AdminDashboardProps {
  userName: string
}

export default function AdminDashboard({ userName }: AdminDashboardProps) {
  const requests = useStockRequestsState([])
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestModalType, setRequestModalType] = useState<"super-admin" | "admin-transfer" | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "dispatched" | "confirmed" | "rejected">("all")

  const currentUserId = authService.getUser()?.id

  // Get requests from agents (where requested_from = "admin")
  const agentRequests = requests.requests.filter(r => r.requested_from === "admin")
  
  // Get my requests to super-admin
  const myRequests = requests.requests.filter(
    r => r.requested_from === "super-admin" && r.requested_by_id === currentUserId
  )

  // Combine for display
  const allRequests = [...agentRequests, ...myRequests]
  const filteredRequests = allRequests.filter((r) => {
    if (statusFilter === "all") return true
    if (statusFilter === "pending") return r.status === "pending"
    if (statusFilter === "dispatched") return r.status === "dispatched"
    if (statusFilter === "confirmed") return r.status === "confirmed"
    if (statusFilter === "rejected") return r.status === "rejected"
    return true
  })

  const handleCreateRequest = async () => {
    await requests.refetch()
    setShowRequestModal(false)
    setRequestModalType(null)
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest) return
    try {
      await requests.approveRequest(selectedRequest.id)
      await requests.refetch()
      setShowApprovalModal(false)
      setSelectedRequest(null)
    } catch (err) {
      console.error("Failed to approve request:", err)
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) return
    try {
      await requests.rejectRequest(selectedRequest.id, "Rejected by admin")
      await requests.refetch()
      setShowApprovalModal(false)
      setSelectedRequest(null)
    } catch (err) {
      console.error("Failed to reject request:", err)
    }
  }

  const handleConfirmReceipt = async () => {
    await requests.refetch()
    setShowConfirmationModal(false)
    setSelectedRequest(null)
  }

  const approved = allRequests.filter((r) => r.status === "dispatched" || r.status === "confirmed").length
  const pending = allRequests.filter((r) => r.status === "pending").length
  const rejected = allRequests.filter((r) => r.status === "rejected").length
  const totalRequested = allRequests.reduce((sum, r) => {
    return sum + (r.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0)
  }, 0)
  const approvalRate = allRequests.length > 0 ? Math.round((approved / allRequests.length) * 100) : 0

  const inProgress = pending
  const completed = approved + rejected
  const requestsThisMonth = allRequests.filter(
    (r) => new Date(r.created_at).getMonth() === new Date().getMonth(),
  ).length

  if (requests.loading) {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Welcome {userName}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Pending</p>
              <p className="text-3xl font-bold text-amber-500">{pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Approved</p>
              <p className="text-3xl font-bold text-green-500">{approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Rejected</p>
              <p className="text-3xl font-bold text-red-500">{rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Total Requested</p>
              <p className="text-3xl font-bold text-cyan-500">{totalRequested}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-cyan-500 opacity-50" />
          </div>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Approval Rate</p>
              <p className="text-3xl font-bold text-emerald-500">{approvalRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-2">In Progress</p>
          <p className="text-2xl font-bold text-amber-400 mb-2">{inProgress}</p>
          <p className="text-xs text-slate-500">Awaiting approval</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-2">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mb-2">{completed}</p>
          <p className="text-xs text-slate-500">Approved or rejected</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-slate-400 text-sm mb-2">This Month</p>
          <p className="text-2xl font-bold text-blue-400 mb-2">{requestsThisMonth}</p>
          <p className="text-xs text-slate-500">Total requests</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-white">Stock Requests</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setRequestModalType("super-admin")
                setShowRequestModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Request from Super Admin
            </Button>
            <Button
              onClick={() => {
                setRequestModalType("admin-transfer")
                setShowRequestModal(true)
              }}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Transfer to Admin
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === "all" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === "pending" ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("dispatched")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === "dispatched" ? "bg-green-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Dispatched
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === "confirmed" ? "bg-cyan-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === "rejected" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Requested By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => {
                    const isMyRequest = request.requested_by_id === currentUserId
                    const isAgentRequest = request.requested_from === "admin" && !isMyRequest
                    
                    return (
                      <tr key={request.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4 text-white font-medium">
                          {request.items?.[0]?.product?.name || "Multiple Products"}
                        </td>
                        <td className="px-6 py-4 text-white font-bold text-cyan-400">
                          {request.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {request.requested_by_name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {request.status === "pending" && (
                            <span className="px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-full">
                              Pending
                            </span>
                          )}
                          {request.status === "dispatched" && (
                            <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50 rounded-full">
                              Dispatched
                            </span>
                          )}
                          {request.status === "confirmed" && (
                            <span className="px-3 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full">
                              Confirmed
                            </span>
                          )}
                          {request.status === "rejected" && (
                            <span className="px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50 rounded-full">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isAgentRequest && request.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowApprovalModal(true)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Review
                            </Button>
                          )}
                          {isMyRequest && request.status === "dispatched" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowConfirmationModal(true)
                              }}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                              Confirm Receipt
                            </Button>
                          )}
                          {request.status === "rejected" && request.rejection_reason && (
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-red-300">{request.rejection_reason}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Recent Requests</h3>
            <div className="space-y-2">
              {allRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-b-0"
                >
                  <div>
                    <p className="text-sm text-white font-medium">
                      {request.items?.[0]?.product?.name || "Multiple Products"}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold text-cyan-400">
                    {request.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
              ))}
              {allRequests.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No requests yet</p>
              )}
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Request Status Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Pending</span>
                  <span className="text-xs font-bold text-amber-400">{pending}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${allRequests.length > 0 ? (pending / allRequests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Approved</span>
                  <span className="text-xs font-bold text-green-400">{approved}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${allRequests.length > 0 ? (approved / allRequests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Rejected</span>
                  <span className="text-xs font-bold text-red-400">{rejected}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${allRequests.length > 0 ? (rejected / allRequests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showRequestModal && requestModalType && (
        <AdminStockRequestModal
          requestType={requestModalType}
          onClose={() => {
            setShowRequestModal(false)
            setRequestModalType(null)
          }}
          onSuccess={handleCreateRequest}
        />
      )}

      {showApprovalModal && selectedRequest && (
        <EnhancedRequestApprovalModal
          request={selectedRequest}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedRequest(null)
          }}
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
    </div>
  )
}
