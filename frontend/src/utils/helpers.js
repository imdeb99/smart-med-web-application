export function getNextDays(count = 7) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: d.toISOString().split("T")[0],
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
