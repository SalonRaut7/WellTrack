import { useRef, useState } from "react";
import api from "../api/axios";

type StepDTO = {
  date?: string | null;
  activityType: string;
  stepsCount: number;
};

type SleepDTO = {
  date?: string | null;
  bedTime?: string | null;
  wakeUpTime?: string | null;
  quality: string;
};

type MoodDTO = {
  date?: string | null;
  mood: string;
  notes?: string | null;
};

type HydrationDTO = {
  date?: string | null;
  waterIntakeLiters: number;
};

type HabitDTO = {
  date?: string | null;
  name: string;
  completed: boolean;
};

type FoodEntryDTO = {
  date?: string | null;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  mealType: string;
};

type ImportPreviewDto = {
  steps: StepDTO[];
  sleep: SleepDTO[];
  mood: MoodDTO[];
  hydration: HydrationDTO[];
  habit: HabitDTO[];
  food: FoodEntryDTO[];
  errors: string[];
  warnings: string[];
};

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasPreviewData =
    !!preview &&
    (
      preview.steps.length > 0 ||
      preview.sleep.length > 0 ||
      preview.mood.length > 0 ||
      preview.hydration.length > 0 ||
      preview.habit.length > 0 ||
      preview.food.length > 0
    );

  const hasErrors = !!preview && preview.errors.length > 0;
  const canConfirm = hasPreviewData && !hasErrors;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setPreview(null);

    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select a valid .xlsx Excel file.");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      alert("Please choose an Excel file first.");
      return;
    }

    try {
      setLoadingPreview(true);
      setMessage(null);
      setPreview(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/api/import/preview", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPreview(response.data);
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Failed to preview import file.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) {
      alert("No preview data available.");
      return;
    }

    if (preview.errors.length > 0) {
      alert("Please fix validation errors before confirming import.");
      return;
    }

    try {
      setConfirmingImport(true);
      setMessage(null);

      await api.post("/api/import/confirm", preview, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setMessage("Import completed successfully.");
      setSelectedFile(null);
      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import confirm failed:", error);
      alert("Failed to confirm import.");
    } finally {
      setConfirmingImport(false);
    }
  };

  const totalRowsReady =
    (preview?.steps.length || 0) +
    (preview?.sleep.length || 0) +
    (preview?.mood.length || 0) +
    (preview?.hydration.length || 0) +
    (preview?.habit.length || 0) +
    (preview?.food.length || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Import Tracker Data
          </h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base">
            Upload an Excel file (.xlsx), review the rows ready to import, then confirm to save them.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Choose Excel file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-indigo-500"
            />

            {selectedFile && (
              <div className="mt-3 text-sm text-slate-300">
                Selected file: <span className="font-semibold text-white">{selectedFile.name}</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handlePreview}
                disabled={!selectedFile || loadingPreview}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
                  !selectedFile || loadingPreview
                    ? "bg-white/10 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-500",
                ].join(" ")}
              >
                {loadingPreview ? "Generating Preview..." : "Preview Import"}
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {preview && (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <h2 className="text-lg font-bold text-white">Rows Ready to Import</h2>
                <p className="mt-2 text-sm text-slate-300">
                  These counts exclude invalid rows and rows already detected as duplicates.
                </p>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                  <div className="rounded-xl bg-white/5 p-3">Steps: {preview.steps.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Sleep: {preview.sleep.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Mood: {preview.mood.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Hydration: {preview.hydration.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Habit: {preview.habit.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Food: {preview.food.length}</div>
                  <div className="rounded-xl bg-indigo-500/20 p-3 font-bold">Total: {totalRowsReady}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <h2 className="text-lg font-bold text-white">Validation Errors</h2>
                {preview.errors.length === 0 ? (
                  <p className="mt-2 text-sm text-emerald-300">No validation errors found.</p>
                ) : (
                  <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-rose-300">
                    {preview.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <h2 className="text-lg font-bold text-white">Warnings</h2>
                {preview.warnings.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-300">No warnings found.</p>
                ) : (
                  <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-amber-300">
                    {preview.warnings.map((warn, idx) => (
                      <li key={idx}>{warn}</li>
                    ))}
                  </ul>
                )}
              </div>

              {preview.steps.length > 0 && (
                <SectionTable
                  title="Steps"
                  headers={["Date", "Activity", "Steps Count"]}
                  rows={preview.steps.map((x) => [
                    formatDateTime(x.date),
                    x.activityType,
                    x.stepsCount.toString(),
                  ])}
                />
              )}

              {preview.sleep.length > 0 && (
                <SectionTable
                  title="Sleep"
                  headers={["Date", "Bed Time", "Wake Up Time", "Quality"]}
                  rows={preview.sleep.map((x) => [
                    formatDateTime(x.date),
                    formatDateTime(x.bedTime),
                    formatDateTime(x.wakeUpTime),
                    x.quality,
                  ])}
                />
              )}

              {preview.mood.length > 0 && (
                <SectionTable
                  title="Mood"
                  headers={["Date", "Mood", "Notes"]}
                  rows={preview.mood.map((x) => [
                    formatDateTime(x.date),
                    x.mood,
                    x.notes || "-",
                  ])}
                />
              )}

              {preview.hydration.length > 0 && (
                <SectionTable
                  title="Hydration"
                  headers={["Date", "Water Intake (L)"]}
                  rows={preview.hydration.map((x) => [
                    formatDateTime(x.date),
                    x.waterIntakeLiters.toString(),
                  ])}
                />
              )}

              {preview.habit.length > 0 && (
                <SectionTable
                  title="Habit"
                  headers={["Date", "Name", "Completed"]}
                  rows={preview.habit.map((x) => [
                    formatDateTime(x.date),
                    x.name,
                    x.completed ? "Yes" : "No",
                  ])}
                />
              )}

              {preview.food.length > 0 && (
                <SectionTable
                  title="Food"
                  headers={["Date", "Food", "Calories", "Protein", "Carbs", "Fat", "Serving", "Meal"]}
                  rows={preview.food.map((x) => [
                    formatDateTime(x.date),
                    x.foodName,
                    x.calories.toString(),
                    x.protein.toString(),
                    x.carbs.toString(),
                    x.fat.toString(),
                    x.servingSize,
                    x.mealType,
                  ])}
                />
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleConfirmImport}
                  disabled={!canConfirm || confirmingImport}
                  className={[
                    "rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all",
                    !canConfirm || confirmingImport
                      ? "bg-white/10 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-500",
                  ].join(" ")}
                >
                  {confirmingImport ? "Importing..." : "Confirm Import"}
                </button>
              </div>

              {hasErrors && (
                <div className="text-sm text-rose-300">
                  Fix validation errors before confirming import.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-slate-300">
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-white/5 text-slate-100">
                {row.map((cell, cidx) => (
                  <td key={cidx} className="px-3 py-2 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}