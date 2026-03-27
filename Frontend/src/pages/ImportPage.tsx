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
  hours: number;
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

type ImportOverwriteConflictsDto = {
  steps: StepDTO[];
  sleep: SleepDTO[];
  mood: MoodDTO[];
  hydration: HydrationDTO[];
  habit: HabitDTO[];
  food: FoodEntryDTO[];
  hasConflicts: boolean;
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
  overwriteConflicts: ImportOverwriteConflictsDto;
};

type RangeMode = "all" | "today" | "range";

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewDto | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmingImport, setConfirmingImport] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [rangeMode, setRangeMode] = useState<RangeMode>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [overwriteConflicts, setOverwriteConflicts] = useState(false);

  const hasPreviewData =
    !!preview &&
    (preview.steps.length > 0 ||
      preview.sleep.length > 0 ||
      preview.mood.length > 0 ||
      preview.hydration.length > 0 ||
      preview.habit.length > 0 ||
      preview.food.length > 0);

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

    if (rangeMode === "range" && !fromDate && !toDate) {
      alert("Please provide at least a From date or a To date for range import.");
      return;
    }

    if (rangeMode === "range" && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from.getTime() > to.getTime()) {
        alert("From date cannot be later than To date.");
        return;
      }
    }

    try {
      setLoadingPreview(true);
      setMessage(null);
      setPreview(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const params: Record<string, string> = {
        rangeMode,
      };

      if (rangeMode === "range") {
        if (fromDate) {
          params.from = new Date(`${fromDate}T00:00:00`).toISOString();
        }
        if (toDate) {
          params.to = new Date(`${toDate}T23:59:59`).toISOString();
        }
      }

      const response = await api.post("/api/import/preview", formData, {
        params,
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

      await api.post(
        "/api/import/confirm",
        {
          preview,
          overwriteConflicts,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setMessage("Import completed successfully.");
      setSelectedFile(null);
      setPreview(null);
      setOverwriteConflicts(false);
      setRangeMode("all");
      setFromDate("");
      setToDate("");

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

  const totalRowsInPreview =
    (preview?.steps.length || 0) +
    (preview?.sleep.length || 0) +
    (preview?.mood.length || 0) +
    (preview?.hydration.length || 0) +
    (preview?.habit.length || 0) +
    (preview?.food.length || 0);

  const totalConflictRows =
    (preview?.overwriteConflicts.steps.length || 0) +
    (preview?.overwriteConflicts.sleep.length || 0) +
    (preview?.overwriteConflicts.mood.length || 0) +
    (preview?.overwriteConflicts.hydration.length || 0) +
    (preview?.overwriteConflicts.habit.length || 0) +
    (preview?.overwriteConflicts.food.length || 0);

  const estimatedRowsToImport = overwriteConflicts
    ? totalRowsInPreview
    : Math.max(0, totalRowsInPreview - totalConflictRows);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Import Tracker Data
          </h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base">
            Upload an Excel file (.xlsx), choose all rows, only today&apos;s rows, or a custom date range,
            review validation issues and overwrite conflicts, then confirm import.
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

            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-200 mb-3">Import data scope</div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRangeMode("all")}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
                    rangeMode === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/15",
                  ].join(" ")}
                >
                  Import all data in file
                </button>

                <button
                  type="button"
                  onClick={() => setRangeMode("today")}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
                    rangeMode === "today"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/15",
                  ].join(" ")}
                >
                  Import only today&apos;s data
                </button>

                <button
                  type="button"
                  onClick={() => setRangeMode("range")}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-semibold transition-all",
                    rangeMode === "range"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/15",
                  ].join(" ")}
                >
                  Import custom date range
                </button>
              </div>

              {rangeMode === "range" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      From date
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      To date
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwriteConflicts}
                  onChange={(e) => setOverwriteConflicts(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-amber-500"
                />
                <div>
                  <div className="text-sm font-semibold text-amber-100">
                    Overwrite existing entries for conflict rows
                  </div>
                  <div className="text-xs text-amber-200/80 mt-1">
                    If enabled, rows that match existing database timestamps will update existing rows.
                    If disabled, those conflict rows are skipped.
                  </div>
                </div>
              </label>
            </div>

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
                <h2 className="text-lg font-bold text-white">Import Summary</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Preview contains valid parsed rows after applying the selected import scope.
                  Conflict rows are displayed below and will be overwritten or skipped based on your selection.
                </p>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                  <div className="rounded-xl bg-white/5 p-3">Steps: {preview.steps.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Sleep: {preview.sleep.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Mood: {preview.mood.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Hydration: {preview.hydration.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Habit: {preview.habit.length}</div>
                  <div className="rounded-xl bg-white/5 p-3">Food: {preview.food.length}</div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-indigo-500/20 p-3 font-bold">
                    Total rows in preview: {totalRowsInPreview}
                  </div>
                  <div className="rounded-xl bg-amber-500/20 p-3 font-bold">
                    Overwrite conflicts: {totalConflictRows}
                  </div>
                  <div className="rounded-xl bg-emerald-500/20 p-3 font-bold">
                    Estimated rows applied: {estimatedRowsToImport}
                  </div>
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

              {totalConflictRows > 0 && (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  {overwriteConflicts
                    ? "Overwrite is enabled. Confirm import to update existing database rows for these conflicts."
                    : "Overwrite is disabled. Conflict rows shown below will be skipped on confirm."}
                </div>
              )}

              {preview.overwriteConflicts.steps.length > 0 && (
                <SectionTable
                  title="Overwrite Conflicts: Steps"
                  headers={["Date", "Activity", "Steps Count"]}
                  rows={preview.overwriteConflicts.steps.map((x) => [
                    formatDateTime(x.date),
                    x.activityType,
                    x.stepsCount.toString(),
                  ])}
                />
              )}

              {preview.overwriteConflicts.sleep.length > 0 && (
                <SectionTable
                  title="Overwrite Conflicts: Sleep"
                  headers={["Date", "Bed Time", "Wake Up Time", "Hours", "Quality"]}
                  rows={preview.overwriteConflicts.sleep.map((x) => [
                    formatDateTime(x.date),
                    formatDateTime(x.bedTime),
                    formatDateTime(x.wakeUpTime),
                    x.hours.toString(),
                    x.quality,
                  ])}
                />
              )}

              {preview.overwriteConflicts.mood.length > 0 && (
                <SectionTable
                  title="Overwrite Conflicts: Mood"
                  headers={["Date", "Mood", "Notes"]}
                  rows={preview.overwriteConflicts.mood.map((x) => [
                    formatDateTime(x.date),
                    x.mood,
                    x.notes || "-",
                  ])}
                />
              )}

              {preview.overwriteConflicts.hydration.length > 0 && (
                <SectionTable
                  title="Overwrite Conflicts: Hydration"
                  headers={["Date", "Water Intake (L)"]}
                  rows={preview.overwriteConflicts.hydration.map((x) => [
                    formatDateTime(x.date),
                    x.waterIntakeLiters.toString(),
                  ])}
                />
              )}

              {preview.overwriteConflicts.habit.length > 0 && (
                <SectionTable
                  title="Overwrite Conflicts: Habit"
                  headers={["Date", "Name", "Completed"]}
                  rows={preview.overwriteConflicts.habit.map((x) => [
                    formatDateTime(x.date),
                    x.name,
                    x.completed ? "Yes" : "No",
                  ])}
                />
              )}

              {preview.overwriteConflicts.food.length > 0 && (
                <SectionTable
                  title="Overwrite Conflicts: Food"
                  headers={[
                    "Date",
                    "Food",
                    "Calories",
                    "Protein",
                    "Carbs",
                    "Fat",
                    "Serving",
                    "Meal",
                  ]}
                  rows={preview.overwriteConflicts.food.map((x) => [
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
                  headers={["Date", "Bed Time", "Wake Up Time", "Hours", "Quality"]}
                  rows={preview.sleep.map((x) => [
                    formatDateTime(x.date),
                    formatDateTime(x.bedTime),
                    formatDateTime(x.wakeUpTime),
                    x.hours.toString(),
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
                  {confirmingImport
                    ? "Importing..."
                    : overwriteConflicts
                      ? "Confirm Import and Overwrite Conflicts"
                      : "Confirm Import"}
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