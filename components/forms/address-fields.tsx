"use client"

interface Address {
  line1: string
  line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface AddressFieldsProps {
  address: Address
  onChange: (address: Address) => void
  label?: string
  required?: boolean
}

export default function AddressFields({ address, onChange, label = "Address", required = false }: AddressFieldsProps) {
  const updateField = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value })
  }

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Address Line 1 {required && <span className="text-red-400">*</span>}
        </label>
        <input
          type="text"
          value={address.line1}
          onChange={(e) => updateField("line1", e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          required={required}
          placeholder="Street address, P.O. box"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Address Line 2</label>
        <input
          type="text"
          value={address.line2}
          onChange={(e) => updateField("line2", e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            City {required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required={required}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            State/Province {required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required={required}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Postal/ZIP Code {required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={address.postal_code}
            onChange={(e) => updateField("postal_code", e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required={required}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Country {required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => updateField("country", e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required={required}
            placeholder="e.g., India, USA"
          />
        </div>
      </div>
    </div>
  )
}

export type { Address }

