"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AITextarea } from "@/components/ui/AIAssistant";
import type { Database, DeviceType } from "@/types/database";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Device = Database["public"]["Tables"]["devices"]["Row"];

const deviceTypes: DeviceType[] = ["smartphone", "tablet", "laptop", "desktop", "console", "other"];

export default function NewRepairPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customer");

  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(preselectedCustomerId || "");
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewDevice, setShowNewDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  // Get selected device info for AI context
  const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice);

  useEffect(() => {
    async function loadCustomers() {
      const supabase = createClient();
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("name") as { data: Customer[] | null };
      setCustomers(data || []);
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadDevices() {
      if (!selectedCustomer) {
        setDevices([]);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("devices")
        .select("*")
        .eq("customer_id", selectedCustomer) as { data: Device[] | null };
      setDevices(data || []);
    }
    loadDevices();
  }, [selectedCustomer]);

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string || null,
      })
      .select()
      .single() as { data: Customer | null; error: Error | null };

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCustomers([...customers, data!]);
    setSelectedCustomer(data!.id);
    setShowNewCustomer(false);
    setLoading(false);
    setStep(2);
  };

  const handleCreateDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("devices")
      .insert({
        customer_id: selectedCustomer,
        type: formData.get("type") as DeviceType,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        serial_number: formData.get("serial_number") as string || null,
        color: formData.get("color") as string || null,
        condition_notes: formData.get("condition_notes") as string || null,
      })
      .select()
      .single() as { data: Device | null; error: Error | null };

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDevices([...devices, data!]);
    setSelectedDevice(data!.id);
    setShowNewDevice(false);
    setLoading(false);
    setStep(3);
  };

  const handleCreateRepair = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error } = await supabase.from("repairs").insert({
      customer_id: selectedCustomer,
      device_id: selectedDevice,
      issue_description: issueDescription,
      estimated_cost: formData.get("estimated_cost") ? parseFloat(formData.get("estimated_cost") as string) : null,
      estimated_completion: formData.get("estimated_completion") as string || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/repairs");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/repairs" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Repairs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Repair Ticket</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["Customer", "Device", "Issue"].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step > idx + 1
                    ? "bg-indigo-600 text-white"
                    : step === idx + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > idx + 1 ? "✓" : idx + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">{label}</span>
              {idx < 2 && <div className="mx-4 h-0.5 w-16 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Step 1: Select Customer */}
      {step === 1 && !showNewCustomer && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Select Customer</h2>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="max-h-64 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer.id);
                  setStep(2);
                }}
                className={`w-full rounded-md p-3 text-left hover:bg-gray-50 ${
                  selectedCustomer === customer.id ? "bg-indigo-50 ring-2 ring-indigo-500" : ""
                }`}
              >
                <div className="font-medium text-gray-900">{customer.name}</div>
                <div className="text-sm text-gray-500">{customer.phone}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewCustomer(true)}
            className="mt-4 w-full rounded-md border-2 border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 hover:border-gray-400"
          >
            + Add New Customer
          </button>
        </div>
      )}

      {/* New Customer Form */}
      {step === 1 && showNewCustomer && (
        <form onSubmit={handleCreateCustomer} className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">New Customer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input type="text" name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input type="tel" name="phone" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowNewCustomer(false)} className="rounded-md border px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Select Device */}
      {step === 2 && !showNewDevice && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Select Device</h2>
          {devices.length > 0 ? (
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => {
                    setSelectedDevice(device.id);
                    setStep(3);
                  }}
                  className="w-full rounded-md p-3 text-left hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {device.brand} {device.model}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">{device.type}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-500">No devices registered for this customer.</p>
          )}
          <button
            onClick={() => setShowNewDevice(true)}
            className="mt-4 w-full rounded-md border-2 border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 hover:border-gray-400"
          >
            + Add New Device
          </button>
          <button onClick={() => setStep(1)} className="mt-2 text-sm text-gray-500 hover:text-gray-700">
            ← Change Customer
          </button>
        </div>
      )}

      {/* New Device Form */}
      {step === 2 && showNewDevice && (
        <form onSubmit={handleCreateDevice} className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">New Device</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select name="type" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                {deviceTypes.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand *</label>
                <input type="text" name="brand" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model *</label>
                <input type="text" name="model" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <input type="text" name="serial_number" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input type="text" name="color" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condition Notes</label>
              <textarea name="condition_notes" rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Scratches, dents, missing parts..." />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowNewDevice(false)} className="rounded-md border px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Issue Details */}
      {step === 3 && (
        <form onSubmit={handleCreateRepair} className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Issue Details</h2>
          <div className="space-y-4">
            <AITextarea
              id="issue_description"
              name="issue_description"
              value={issueDescription}
              onChange={setIssueDescription}
              label="Issue Description"
              required
              rows={4}
              placeholder="Describe the problem the customer is experiencing..."
              aiType="suggest_issue"
              aiButtonText="Sugerir con AI"
              deviceType={selectedDeviceInfo?.type}
              deviceBrand={selectedDeviceInfo?.brand}
              deviceModel={selectedDeviceInfo?.model}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Cost ($)</label>
                <input
                  type="number"
                  name="estimated_cost"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Completion</label>
                <input
                  type="date"
                  name="estimated_completion"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700">
              ← Change Device
            </button>
            <button type="submit" disabled={loading} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Creating..." : "Create Repair Ticket"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
