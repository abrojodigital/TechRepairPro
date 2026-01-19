import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch summary stats
  const [
    { count: totalRepairs },
    { count: pendingRepairs },
    { count: completedRepairs },
    { count: totalCustomers },
  ] = await Promise.all([
    supabase.from("repairs").select("*", { count: "exact", head: true }),
    supabase.from("repairs").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("repairs").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { name: "Total Repairs", value: totalRepairs ?? 0 },
    { name: "Pending", value: pendingRepairs ?? 0 },
    { name: "Completed", value: completedRepairs ?? 0 },
    { name: "Customers", value: totalCustomers ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">
              {stat.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}
