"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AIAssistant } from "@/components/ui/AIAssistant";
import type { RepairStatus } from "@/types/database";

interface Props {
  repairId: string;
  currentStatus: RepairStatus;
  diagnosis: string | null;
  resolution: string | null;
  finalCost: number | null;
  statusFlow: RepairStatus[];
  // Device info for AI context
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  issueDescription?: string;
}

export function RepairStatusUpdate({
  repairId,
  currentStatus,
  diagnosis: initialDiagnosis,
  resolution: initialResolution,
  finalCost: initialFinalCost,
  statusFlow,
  deviceType,
  deviceBrand,
  deviceModel,
  issueDescription,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis || "");
  const [resolution, setResolution] = useState(initialResolution || "");
  const [finalCost, setFinalCost] = useState(initialFinalCost?.toString() || "");

  const currentIndex = statusFlow.indexOf(currentStatus);
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  const handleStatusUpdate = async (newStatus: RepairStatus) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const updates: Record<string, unknown> = { status: newStatus };

    if (newStatus === "diagnosed" && diagnosis) {
      updates.diagnosis = diagnosis;
    }
    if (newStatus === "completed") {
      updates.resolution = resolution;
      updates.final_cost = finalCost ? parseFloat(finalCost) : null;
      updates.completed_at = new Date().toISOString();
    }
    if (newStatus === "delivered") {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("repairs")
      .update(updates)
      .eq("id", repairId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this repair?")) return;
    await handleStatusUpdate("cancelled");
  };

  const handleDiagnosisSuggestion = (suggestion: string) => {
    if (diagnosis.trim()) {
      setDiagnosis(diagnosis + "\n\n" + suggestion);
    } else {
      setDiagnosis(suggestion);
    }
  };

  const handleResolutionSuggestion = (suggestion: string) => {
    if (resolution.trim()) {
      setResolution(resolution + "\n\n" + suggestion);
    } else {
      setResolution(suggestion);
    }
  };

  if (currentStatus === "delivered" || currentStatus === "cancelled") {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-medium text-gray-900">Update Status</h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-4">
        {currentStatus === "pending" && (
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
              <AIAssistant
                type="generate_diagnosis"
                deviceType={deviceType}
                deviceBrand={deviceBrand}
                deviceModel={deviceModel}
                issueDescription={issueDescription}
                onSuggestion={handleDiagnosisSuggestion}
                buttonText="Generar Diagnóstico"
              />
            </div>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="What's wrong with the device?"
            />
          </div>
        )}

        {(currentStatus === "in_progress" || currentStatus === "waiting_parts") && (
          <>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Resolution</label>
                <AIAssistant
                  type="suggest_resolution"
                  deviceType={deviceType}
                  deviceBrand={deviceBrand}
                  deviceModel={deviceModel}
                  issueDescription={issueDescription}
                  diagnosis={diagnosis || initialDiagnosis || undefined}
                  onSuggestion={handleResolutionSuggestion}
                  buttonText="Sugerir Resolución"
                />
              </div>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="What was done to fix the device?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Final Cost ($)</label>
              <input
                type="number"
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          {nextStatus && (
            <button
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : `Mark as ${nextStatus.replace("_", " ")}`}
            </button>
          )}

          {currentStatus === "diagnosed" && (
            <button
              onClick={() => handleStatusUpdate("waiting_parts")}
              disabled={loading}
              className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              Waiting for Parts
            </button>
          )}

          <button
            onClick={handleCancel}
            disabled={loading}
            className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            Cancel Repair
          </button>
        </div>
      </div>
    </div>
  );
}
