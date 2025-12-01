"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Loader2, AlertCircle } from "lucide-react"
import { productsApi, categoriesApi } from "@/lib/api"
import type { Product } from "@/lib/api"
import { authService } from "@/lib/auth"

interface ProductModalProps {
  product?: Product | null
  onClose: () => void
  onSave: (product: Product | Omit<Product, "id">) => void
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Check if user is agent (only agents can set price)
  const currentUser = authService.getUser()
  const isAgent = currentUser?.role === "agent"

  const [formData, setFormData] = useState({
    name: product?.name || "",
    model: product?.model || "",
    wattage: product?.wattage || "",
    price: product?.price || product?.unit_price || 0,
    quantity: product?.quantity || product?.central_stock || 0,
    category: product?.category || "",
    image: product?.image || "",
  })

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

  useEffect(() => {
    if (product?.image) {
      setImagePreview(product.image)
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }
      setImageFile(file)
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const productData: any = {
        name: formData.name,
        model: formData.model,
        category: formData.category,
        wattage: formData.wattage || undefined,
        quantity: formData.quantity || 0,
        image: imageFile || undefined,
      }
      
      // Only include price if user is agent
      if (isAgent) {
        productData.unit_price = formData.price || 0
      } else if (product) {
        // For super-admin/admin editing, keep existing price if product exists
        productData.unit_price = product.unit_price || product.price || 0
      } else {
        // For super-admin/admin creating new product, set default price to 0
        productData.unit_price = 0
      }

      if (product?.id) {
        // Update existing product
        const updated = await productsApi.update(product.id, productData)
        onSave(updated)
      } else {
        // Create new product
        const created = await productsApi.create(productData)
        onSave(created)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <Card className="bg-slate-800 border-slate-700 p-4 sm:p-6 lg:p-8 max-w-[95%] sm:max-w-lg w-full my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition flex-shrink-0 ml-2">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model *</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Wattage</label>
            <input
              type="text"
              name="wattage"
              value={formData.wattage}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g., 400W"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Panels, Inverter, Battery"
              list="categories"
              required
            />
            <datalist id="categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className={`grid grid-cols-1 ${isAgent ? 'sm:grid-cols-2' : ''} gap-4`}>
            {isAgent && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Unit Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Image (Optional)</label>
            {imagePreview && (
              <div className="mb-2 relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 bg-transparent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
