"use client"

import { useState, useCallback } from "react"
import { useInventoryState } from "./use-inventory-state"
import { useSalesState } from "./use-sales-state"
import { useStockRequestsState } from "./use-stock-requests-state"

export function useAppState() {
  // Use empty arrays to trigger API fetching
  const inventory = useInventoryState([])
  const sales = useSalesState([])
  const requests = useStockRequestsState([])


  const getAppInsights = useCallback(() => {
    return {
      inventory: inventory.stats,
      sales: sales.stats,
      requests: requests.stats,
      lastUpdated: new Date().toISOString(),
    }
  }, [inventory.stats, sales.stats, requests.stats])

  return {
    inventory,
    sales,
    requests,
    getAppInsights,
  }
}
