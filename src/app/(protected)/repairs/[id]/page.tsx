import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database, RepairStatus } from "@/types/database";
import { RepairStatusUpdate } from "./RepairStatusUpdate";

type Repair = Database["public"]["Tables"]["repairs"]["Row"];
type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Device = Database["public"]["Tables"]["devices"]["Row"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  diagnosed: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  waiting_parts: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusFlow: RepairStatus[] = [
  "pending",
  "diagnosed",
  "in_progress",
  "waiting_parts",
  "completed",
  "delivered",
];

export default async function RepairDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: repair } = await supabase
    .from("repairs")
    .select("*")
    .eq("id", id)
    .single() as { data: Repair | null };

  if (!repair) {
    notFound();
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", repair.customer_id)
    .single() as { data: Customer | null };

  const { data: device } = await supabase
    .from("devices")
    .select("*")
    .eq("id", repair.device_id)
    .single() as { data: Device | null };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/repairs" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Repairs
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{repair.ticket_number}</h1>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusColors[repair.status]}`}>
          {repair.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Issue Description</h2>
            <p className="text-gray-700">{repair.issue_description}</p>
          </div>

          {/* Diagnosis & Resolution */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Diagnosis & Resolution</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Diagnosis</label>
                <p className="mt-1 text-gray-700">{repair.diagnosis || "Not yet diagnosed"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Resolution</label>
                <p className="mt-1 text-gray-700">{repair.resolution || "Not yet resolved"}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <RepairStatusUpdate
            repairId={id}
            currentStatus={repair.status}
            diagnosis={repair.diagnosis}
            resolution={repair.resolution}
            finalCost={repair.final_cost}
            statusFlow={statusFlow}
            deviceType={device?.type}
            deviceBrand={device?.brand}
            deviceModel={device?.model}
            issueDescription={repair.issue_description}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Customer</h2>
            {customer && (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
                {customer.email && <p className="text-sm text-gray-500">{customer.email}</p>}
                <Link href={`/customers/${customer.id}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                  View Customer →
                </Link>
              </div>
            )}
          </div>

          {/* Device */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Device</h2>
            {device && (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{device.brand} {device.model}</p>
                <p className="text-sm text-gray-500 capitalize">{device.type}</p>
                {device.serial_number && (
                  <p className="text-sm text-gray-500">S/N: {device.serial_number}</p>
                )}
                {device.color && (
                  <p className="text-sm text-gray-500">Color: {device.color}</p>
                )}
                {device.condition_notes && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">Condition Notes:</p>
                    <p className="text-sm text-gray-600">{device.condition_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Costs & Dates */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="text-sm font-medium">{new Date(repair.created_at).toLocaleString()}</dd>
              </div>
              {repair.estimated_cost && (
                <div>
                  <dt className="text-sm text-gray-500">Estimated Cost</dt>
                  <dd className="text-sm font-medium">${repair.estimated_cost}</dd>
                </div>
              )}
              {repair.final_cost && (
                <div>
                  <dt className="text-sm text-gray-500">Final Cost</dt>
                  <dd className="text-sm font-medium text-green-600">${repair.final_cost}</dd>
                </div>
              )}
              {repair.estimated_completion && (
                <div>
                  <dt className="text-sm text-gray-500">Est. Completion</dt>
                  <dd className="text-sm font-medium">{new Date(repair.estimated_completion).toLocaleDateString()}</dd>
                </div>
              )}
              {repair.completed_at && (
                <div>
                  <dt className="text-sm text-gray-500">Completed</dt>
                  <dd className="text-sm font-medium">{new Date(repair.completed_at).toLocaleString()}</dd>
                </div>
              )}
              {repair.delivered_at && (
                <div>
                  <dt className="text-sm text-gray-500">Delivered</dt>
                  <dd className="text-sm font-medium">{new Date(repair.delivered_at).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
