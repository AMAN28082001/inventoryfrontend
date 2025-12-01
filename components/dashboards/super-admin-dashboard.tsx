"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Package, Search, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import ProductModal from "@/components/modals/product-modal"
import EnhancedRequestApprovalModal from "@/components/modals/enhanced-request-approval-modal"
import { useInventoryState } from "@/hooks/use-inventory-state"
import { useStockRequestsState } from "@/hooks/use-stock-requests-state"
import { productsApi, stockRequestsApi, categoriesApi } from "@/lib/api"
import type { Product } from "@/lib/api"
import type { StockRequest } from "@/lib/api"

interface SuperAdminDashboardProps {
  userName: string
}

export default function SuperAdminDashboard({ userName }: SuperAdminDashboardProps) {
  const inventory = useInventoryState([])
  const requests = useStockRequestsState([])
  
  const [showProductModal, setShowProductModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoriesApi.getAll()
        setCategories(cats.map(c => c.label))
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
    }
    loadCategories()
  }, [])

  const filteredProducts = inventory.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = async (product: Product | Omit<Product, "id">) => {
    try {
      await inventory.addProduct(product as any)
      await inventory.refetch()
      setShowProductModal(false)
      setEditingProduct(null)
    } catch (err) {
      console.error("Failed to save product:", err)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    setIsDeleting(id)
    try {
      await inventory.deleteProduct(id)
      await inventory.refetch()
    } catch (err) {
      console.error("Failed to delete product:", err)
      alert("Failed to delete product. Please try again.")
    } finally {
      setIsDeleting(null)
    }
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
      await requests.rejectRequest(selectedRequest.id, "Rejected by super admin")
      await requests.refetch()
      setShowApprovalModal(false)
      setSelectedRequest(null)
    } catch (err) {
      console.error("Failed to reject request:", err)
    }
  }

  // Filter requests from admins only
  const adminRequests = requests.requests.filter(r => r.requested_from === "super-admin")
  const pendingRequests = adminRequests.filter((r) => r.status === "pending").length
  const dispatchedRequests = adminRequests.filter((r) => r.status === "dispatched").length
  const confirmedRequests = adminRequests.filter((r) => r.status === "confirmed").length
  const rejectedRequests = adminRequests.filter((r) => r.status === "rejected").length
  
  const totalProducts = inventory.products.length
  const totalValue = inventory.products.reduce((sum, p) => sum + (p.quantity || 0) * (p.price || 0), 0)
  const lowStockProducts = inventory.products.filter((p) => (p.quantity || 0) < 50).length

  if (inventory.loading || requests.loading) {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
        <p className="text-slate-400">Welcome {userName}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Total Products</p>
          <p className="text-3xl font-bold text-white">{totalProducts}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-6">
          <p className="text-slate-400 text-sm mb-2">Inventory Value</p>
          <p className="text-3xl font-bold text-white">${(totalValue / 1000).toFixed(1)}K</p>
        </Card>
        <Card className="bg-amber-950/30 border-amber-700 border p-6">
          <p className="text-slate-400 text-sm mb-2">Pending Requests</p>
          <p className="text-3xl font-bold text-amber-500">{pendingRequests}</p>
        </Card>
        <Card className="bg-cyan-950/30 border-cyan-700 border p-6">
          <p className="text-slate-400 text-sm mb-2">Total Stock</p>
          <p className="text-3xl font-bold text-cyan-400">
            {inventory.products.reduce((sum, p) => sum + (p.quantity || 0), 0)}
          </p>
        </Card>
        <Card className="bg-red-950/30 border-red-700 border p-6">
          <p className="text-slate-400 text-sm mb-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Low Stock
          </p>
          <p className="text-3xl font-bold text-red-400">{lowStockProducts}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Products Catalog
            </h2>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setShowProductModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={categoryFilter || ""}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Products List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="bg-slate-800 border-slate-700 p-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 truncate">{product.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs">Model</p>
                            <p className="text-white truncate">{product.model}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Category</p>
                            <p className="text-white truncate">{product.category}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Quantity</p>
                            <p className={`font-semibold ${(product.quantity || 0) < 50 ? "text-red-400" : "text-cyan-400"}`}>
                              {product.quantity || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Price</p>
                            <p className="text-white font-semibold">${product.price || product.unit_price || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2 sm:ml-4 flex-shrink-0">
                        <Button
                          onClick={() => {
                            setEditingProduct(product)
                            setShowProductModal(true)
                          }}
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          size="sm"
                          variant="outline"
                          disabled={isDeleting === product.id}
                          className="border-red-600 text-red-400 hover:bg-red-950"
                        >
                          {isDeleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800 border-slate-700 p-4 text-center">
                  <p className="text-slate-400">No products found</p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Stock Requests Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Admin Requests
          </h2>

          <div className="space-y-3">
            <Card className="bg-amber-950/30 border-amber-700 border p-3">
              <p className="text-slate-400 text-xs mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-400">{pendingRequests}</p>
            </Card>
            <Card className="bg-green-950/30 border-green-700 border p-3">
              <p className="text-slate-400 text-xs mb-1">Dispatched</p>
              <p className="text-2xl font-bold text-green-400">{dispatchedRequests}</p>
            </Card>
            <Card className="bg-cyan-950/30 border-cyan-700 border p-3">
              <p className="text-slate-400 text-xs mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-cyan-400">{confirmedRequests}</p>
            </Card>
            <Card className="bg-red-950/30 border-red-700 border p-3">
              <p className="text-slate-400 text-xs mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{rejectedRequests}</p>
            </Card>
          </div>

          <h2 className="text-lg font-bold text-white mt-6">Recent Requests</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {adminRequests.slice(0, 10).map((request) => (
              <Card
                key={request.id}
                className={`border-l-4 p-3 ${
                  request.status === "pending"
                    ? "bg-amber-950/30 border-l-amber-500 border border-slate-700"
                    : request.status === "dispatched"
                      ? "bg-green-950/30 border-l-green-500 border border-slate-700"
                      : request.status === "confirmed"
                        ? "bg-cyan-950/30 border-l-cyan-500 border border-slate-700"
                        : "bg-red-950/30 border-l-red-500 border border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {request.items?.[0]?.product?.name || "Multiple Products"}
                    </p>
                    <p className="text-xs text-slate-400">From: {request.requested_by_name || "Admin"}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    request.status === "pending" ? "bg-amber-500 text-amber-950" :
                    request.status === "dispatched" ? "bg-green-500 text-green-950" :
                    request.status === "confirmed" ? "bg-cyan-500 text-cyan-950" :
                    "bg-red-500 text-red-950"
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-white font-bold text-xs mb-2">
                  Qty: {request.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </p>
                {request.status === "pending" && (
                  <button
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowApprovalModal(true)
                    }}
                    className="w-full text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Review & Dispatch
                  </button>
                )}
                {request.status === "rejected" && request.rejection_reason && (
                  <p className="text-xs text-red-300 mt-1">Reason: {request.rejection_reason}</p>
                )}
              </Card>
            ))}
            {adminRequests.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No requests yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false)
            setEditingProduct(null)
          }}
          onSave={handleAddProduct}
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
    </div>
  )
}
