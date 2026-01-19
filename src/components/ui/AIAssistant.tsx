"use client";

import { useState } from "react";

interface AIAssistantProps {
  type: "suggest_issue" | "generate_diagnosis" | "suggest_resolution" | "autocomplete";
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  issueDescription?: string;
  diagnosis?: string;
  currentText?: string;
  fieldContext?: string;
  onSuggestion: (suggestion: string) => void;
  buttonText?: string;
  className?: string;
}

export function AIAssistant({
  type,
  deviceType,
  deviceBrand,
  deviceModel,
  issueDescription,
  diagnosis,
  currentText,
  fieldContext,
  onSuggestion,
  buttonText = "Sugerir con AI",
  className = "",
}: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          deviceType,
          deviceBrand,
          deviceModel,
          issueDescription,
          diagnosis,
          partialText: currentText,
          fieldContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar sugerencia");
      }

      onSuggestion(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generando...
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {buttonText}
          </>
        )}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

interface AITextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  label: string;
  aiType: "suggest_issue" | "generate_diagnosis" | "suggest_resolution";
  aiButtonText?: string;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  issueDescription?: string;
  diagnosis?: string;
}

export function AITextarea({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
  label,
  aiType,
  aiButtonText = "Generar con AI",
  deviceType,
  deviceBrand,
  deviceModel,
  issueDescription,
  diagnosis,
}: AITextareaProps) {
  const handleSuggestion = (suggestion: string) => {
    if (value.trim()) {
      onChange(value + "\n\n" + suggestion);
    } else {
      onChange(suggestion);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label} {required && "*"}
        </label>
        <AIAssistant
          type={aiType}
          deviceType={deviceType}
          deviceBrand={deviceBrand}
          deviceModel={deviceModel}
          issueDescription={issueDescription}
          diagnosis={diagnosis}
          currentText={value}
          onSuggestion={handleSuggestion}
          buttonText={aiButtonText}
        />
      </div>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
