export function getNextDays(count = 7) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Local YYYY-MM-DD (not UTC) so the iso matches the day/month chips and
    // the adapter's toISODateTime/toISODate, which both use local time.
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push({
      iso: `${y}-${m}-${day}`,
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return days;
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/** Trigger a browser download of `data` serialized as a pretty-printed .json file. */
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  if (!heightM) return 0;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-50", barColor: "bg-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-600", bg: "bg-emerald-50", barColor: "bg-emerald-500" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-600", bg: "bg-amber-50", barColor: "bg-amber-500" };
  return { label: "Obese", color: "text-red-600", bg: "bg-red-50", barColor: "bg-red-500" };
}
