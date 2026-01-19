import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { RepairsList } from "./RepairsList";

type Repair = Database["public"]["Tables"]["repairs"]["Row"];
type RepairWithRelations = Repair & {
  customer: { name: string; phone: string } | null;
  device: { brand: string; model: string; type: string } | null;
};

export default async function RepairsPage() {
  const supabase = await createClient();

  const { data: repairs } = await supabase
    .from("repairs")
    .select(`
      *,
      customer:customers(name, phone),
      device:devices(brand, model, type)
    `)
    .order("created_at", { ascending: false }) as { data: RepairWithRelations[] | null };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Repairs</h1>
      <RepairsList repairs={repairs || []} />
    </div>
  );
}
