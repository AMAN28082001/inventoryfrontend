"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Sale } from "@/lib/types"
import { useSales } from "./use-api-data"
import { salesApi } from "@/lib/api"

export function useSalesState(initialSales: Sale[] = []) {
  const shouldFetchFromApi = initialSales.length === 0
  const { data: apiSales, loading, error, refetch } = useSales(shouldFetchFromApi ? [] : initialSales)
  const [sales, setSales] = useState<Sale[]>(shouldFetchFromApi ? apiSales : initialSales)

  // Sync sales when API data loads
  useEffect(() => {
    if (shouldFetchFromApi && apiSales.length > 0) {
      setSales(apiSales as Sale[])
    }
  }, [apiSales, shouldFetchFromApi])

  const addSale = useCallback(
    async (sale: Sale | Omit<Sale, "id">) => {
      try {
        if ("id" in sale && sale.id) {
          // Update existing sale
          const updated = await salesApi.update(sale.id, {
            payment_status: sale.paymentStatus,
            // Add other fields as needed
          })
          setSales((prev) => prev.map((s) => (s.id === sale.id ? { ...updated, totalAmount: updated.total_amount, saleDate: updated.created_at, paymentStatus: updated.payment_status } as Sale : s)))
          await refetch()
        } else {
          // Create new sale - this would need proper API format
          // For now, just add to local state if it's a new sale object
          setSales((prev) => [...prev, sale as Sale])
        }
      } catch (err) {
        console.error("Error saving sale:", err)
        throw err
      }
    },
    [refetch]
  )

  const updateSalePaymentStatus = useCallback(
    async (saleId: string, status: "pending" | "completed") => {
      try {
        await salesApi.update(saleId, { payment_status: status })
        setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, paymentStatus: status } : s)))
        await refetch()
      } catch (err) {
        console.error("Error updating sale status:", err)
        throw err
      }
    },
    [refetch]
  )

  const deleteSale = useCallback(
    async (saleId: string) => {
      try {
        await salesApi.delete(saleId)
        setSales((prev) => prev.filter((s) => s.id !== saleId))
        await refetch()
      } catch (err) {
        console.error("Error deleting sale:", err)
        throw err
      }
    },
    [refetch]
  )

  const stats = useMemo(() => {
    const b2bSales = sales.filter((s) => s.type === "B2B")
    const b2cSales = sales.filter((s) => s.type === "B2C")
    const pendingPaymentSales = sales.filter((s) => s.paymentStatus === "pending")
    const completedPaymentSales = sales.filter((s) => s.paymentStatus === "completed")

    return {
      b2bCount: b2bSales.length,
      b2cCount: b2cSales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
      b2bRevenue: b2bSales.reduce((sum, s) => sum + s.totalAmount, 0),
      b2cRevenue: b2cSales.reduce((sum, s) => sum + s.totalAmount, 0),
      pendingPayments: pendingPaymentSales.length,
      pendingAmount: pendingPaymentSales.reduce((sum, s) => sum + s.totalAmount, 0),
      completedPayments: completedPaymentSales.length,
    }
  }, [sales])

  const getSalesByType = useCallback((type: "B2B" | "B2C") => sales.filter((s) => s.type === type), [sales])

  const getSalesByPaymentStatus = useCallback(
    (status: "pending" | "completed") => sales.filter((s) => s.paymentStatus === status),
    [sales],
  )

  const getSalesByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return sales.filter((s) => {
        const saleDate = new Date(s.saleDate || s.created_at || "")
        return saleDate >= startDate && saleDate <= endDate
      })
    },
    [sales],
  )

  const getTotalSalesByProduct = useCallback(
    (productName: string) => {
      return sales.filter((s) => s.productName === productName).reduce((sum, s) => sum + s.quantity, 0)
    },
    [sales],
  )

  return {
    sales,
    stats,
    addSale,
    updateSalePaymentStatus,
    deleteSale,
    getSalesByType,
    getSalesByPaymentStatus,
    getSalesByDateRange,
    getTotalSalesByProduct,
    loading,
    error,
    refetch,
  }
}
