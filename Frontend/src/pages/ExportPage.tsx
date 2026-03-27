import { useState } from "react";
import { Download, CalendarRange, FileSpreadsheet } from "lucide-react";
import api from "../api/axios";

export default function ExportPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await api.get("/api/export/excel", {
        params,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let fileName = "WellTrack_Export.xlsx";

      if (contentDisposition) {
        const fileNameStarMatch = contentDisposition.match(/filename\*\=UTF-8''([^;]+)/);
        if (fileNameStarMatch?.[1]) {
          fileName = decodeURIComponent(fileNameStarMatch[1]);
        } else {
          const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (fileNameMatch?.[1]) {
            fileName = fileNameMatch[1];
          }
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Export Tracker Data</h1>
              <p className="text-slate-300 text-sm">
                Download your wellness tracker data as an Excel file.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                From date
              </label>
              <div className="relative">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-4 py-3 text-white outline-none focus:ring-4 focus:ring-emerald-300/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                To date
              </label>
              <div className="relative">
                <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-4 py-3 text-white outline-none focus:ring-4 focus:ring-emerald-300/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Leave the dates empty to export all tracker data.
          </div>

          <div className="mt-6">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={[
                "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold",
                isExporting
                  ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-400",
                "transition-all duration-300",
              ].join(" ")}
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export to Excel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}