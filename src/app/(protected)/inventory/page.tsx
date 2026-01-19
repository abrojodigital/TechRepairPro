import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { InventoryList } from "./InventoryList";

type InventoryItem = Database["public"]["Tables"]["inventory"]["Row"];

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("inventory")
    .select("*")
    .order("name", { ascending: true }) as { data: InventoryItem[] | null };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inventory</h1>
      <InventoryList items={items || []} />
    </div>
  );
}
