import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { CustomersList } from "./CustomersList";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export default async function CustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false }) as { data: Customer[] | null };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Customers</h1>
      <CustomersList customers={customers || []} />
    </div>
  );
}
