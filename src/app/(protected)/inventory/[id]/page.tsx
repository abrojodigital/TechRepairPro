"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type InventoryItem = Database["public"]["Tables"]["inventory"]["Row"];

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setItem(data as InventoryItem);
      }
      setLoading(false);
    }
    loadItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase
      .from("inventory")
      .update({
        name: formData.get("name") as string,
        sku: formData.get("sku") as string,
        description: formData.get("description") as string || null,
        category: formData.get("category") as string,
        quantity: parseInt(formData.get("quantity") as string) || 0,
        min_quantity: parseInt(formData.get("min_quantity") as string) || 0,
        cost_price: parseFloat(formData.get("cost_price") as string),
        sell_price: parseFloat(formData.get("sell_price") as string),
        location: formData.get("location") as string || null,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/inventory");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("inventory").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/inventory");
  };

  const handleAdjustStock = async (adjustment: number) => {
    if (!item) return;
    const supabase = createClient();
    const newQuantity = Math.max(0, item.quantity + adjustment);

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setItem({ ...item, quantity: newQuantity });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!item) {
    return <div className="text-center text-red-600">Item not found</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/inventory" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Inventory
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Item</h1>
      </div>

      {/* Quick Stock Adjustment */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Stock Adjustment</h2>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
          <span className="text-gray-500">in stock</span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleAdjustStock(-1)}
              className="rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
            >
              -1
            </button>
            <button
              onClick={() => handleAdjustStock(1)}
              className="rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200"
            >
              +1
            </button>
            <button
              onClick={() => handleAdjustStock(10)}
              className="rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200"
            >
              +10
            </button>
          </div>
        </div>
        {item.quantity <= item.min_quantity && (
          <p className="mt-2 text-sm text-red-600">Low stock alert: below minimum quantity ({item.min_quantity})</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={item.name}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              required
              defaultValue={item.sku}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              required
              defaultValue={item.category}
              list="categories"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <datalist id="categories">
              <option value="Screens" />
              <option value="Batteries" />
              <option value="Cables" />
              <option value="Chargers" />
              <option value="Cases" />
              <option value="Tools" />
              <option value="Components" />
              <option value="Other" />
            </datalist>
          </div>

          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={item.description || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              defaultValue={item.quantity}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="min_quantity" className="block text-sm font-medium text-gray-700">
              Min. Quantity
            </label>
            <input
              type="number"
              id="min_quantity"
              name="min_quantity"
              min="0"
              defaultValue={item.min_quantity}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700">
              Cost Price ($) *
            </label>
            <input
              type="number"
              id="cost_price"
              name="cost_price"
              required
              step="0.01"
              min="0"
              defaultValue={item.cost_price}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="sell_price" className="block text-sm font-medium text-gray-700">
              Sell Price ($) *
            </label>
            <input
              type="number"
              id="sell_price"
              name="sell_price"
              required
              step="0.01"
              min="0"
              defaultValue={item.sell_price}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Storage Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={item.location || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete Item
          </button>
          <div className="flex gap-3">
            <Link
              href="/inventory"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
