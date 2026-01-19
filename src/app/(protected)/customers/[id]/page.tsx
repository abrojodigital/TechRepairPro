import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Device = Database["public"]["Tables"]["devices"]["Row"];
type Repair = Database["public"]["Tables"]["repairs"]["Row"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  diagnosed: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  waiting_parts: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single() as { data: Customer | null };

  if (!customer) {
    notFound();
  }

  const { data: devices } = await supabase
    .from("devices")
    .select("*")
    .eq("customer_id", id) as { data: Device[] | null };

  const { data: repairs } = await supabase
    .from("repairs")
    .select("*, device:devices(brand, model)")
    .eq("customer_id", id)
    .order("created_at", { ascending: false }) as { data: (Repair & { device: { brand: string; model: string } | null })[] | null };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Customers
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{customer.name}</h1>
        </div>
        <Link
          href={`/customers/${id}/edit`}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Edit Customer
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Contact Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium text-gray-900">{customer.phone}</dd>
            </div>
            {customer.email && (
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900">{customer.email}</dd>
              </div>
            )}
            {customer.address && (
              <div>
                <dt className="text-sm text-gray-500">Address</dt>
                <dd className="text-sm font-medium text-gray-900">{customer.address}</dd>
              </div>
            )}
            {customer.notes && (
              <div>
                <dt className="text-sm text-gray-500">Notes</dt>
                <dd className="text-sm text-gray-900">{customer.notes}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">Customer Since</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(customer.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Devices */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Devices</h2>
            <Link
              href={`/repairs/new?customer=${id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + New Repair
            </Link>
          </div>
          {devices && devices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {devices.map((device) => (
                <li key={device.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {device.brand} {device.model}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{device.type}</p>
                    </div>
                    {device.serial_number && (
                      <span className="text-xs text-gray-400">S/N: {device.serial_number}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No devices registered yet.</p>
          )}
        </div>
      </div>

      {/* Repair History */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Repair History</h2>
        {repairs && repairs.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-medium uppercase text-gray-500">Ticket</th>
                <th className="py-3 text-left text-xs font-medium uppercase text-gray-500">Device</th>
                <th className="py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {repairs.map((repair) => (
                <tr key={repair.id}>
                  <td className="py-3 text-sm font-medium text-gray-900">{repair.ticket_number}</td>
                  <td className="py-3 text-sm text-gray-500">
                    {repair.device?.brand} {repair.device?.model}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[repair.status]}`}>
                      {repair.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">
                    {new Date(repair.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/repairs/${repair.id}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No repairs yet.</p>
        )}
      </div>
    </div>
  );
}
