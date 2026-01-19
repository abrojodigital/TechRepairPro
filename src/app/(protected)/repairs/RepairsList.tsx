"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/ui/SearchInput";
import type { Database, RepairStatus } from "@/types/database";

type Repair = Database["public"]["Tables"]["repairs"]["Row"] & {
  customer: { name: string; phone: string } | null;
  device: { brand: string; model: string; type: string } | null;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  diagnosed: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  waiting_parts: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusOptions: RepairStatus[] = [
  "pending",
  "diagnosed",
  "in_progress",
  "waiting_parts",
  "completed",
  "delivered",
  "cancelled",
];

export function RepairsList({ repairs }: { repairs: Repair[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch =
      repair.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      repair.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      repair.customer?.phone.includes(search) ||
      repair.device?.brand.toLowerCase().includes(search.toLowerCase()) ||
      repair.device?.model.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || repair.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="w-full max-w-xs">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search tickets, customers..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <Link
          href="/repairs/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New Repair
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRepairs.map((repair) => (
              <tr key={repair.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {repair.ticket_number}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div>{repair.customer?.name}</div>
                  <div className="text-xs text-gray-400">{repair.customer?.phone}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {repair.device?.brand} {repair.device?.model}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      statusColors[repair.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {repair.status.replace("_", " ")}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(repair.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/repairs/${repair.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredRepairs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  {repairs.length === 0
                    ? "No repairs found. Create your first repair ticket."
                    : "No repairs match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
