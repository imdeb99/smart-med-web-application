import { useMemo } from "react";
import { Calculator } from "lucide-react";
import { calculateBMI, getBMICategory } from "../../utils/helpers";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import { Input } from "../../components/shared/Field";

const heightRange = (value) => {
  const base = validators.number(value);
  if (base) return base;
  const h = Number(value);
  if (h < 50 || h > 250) return "Height must be between 50 and 250 cm.";
  return "";
};

const weightRange = (value) => {
  const base = validators.number(value);
  if (base) return base;
  const w = Number(value);
  if (w < 2 || w > 400) return "Weight must be between 2 and 400 kg.";
  return "";
};

export default function BMICalculator() {
  const { values, errors, touched, handleChange, handleBlur } = useFormValidation(
    { height: "", weight: "" },
    { height: heightRange, weight: weightRange }
  );

  const bmi = useMemo(() => {
    const h = parseFloat(values.height);
    const w = parseFloat(values.weight);
    if (!h || !w) return null;
    return calculateBMI(w, h);
  }, [values.height, values.weight]);

  const category = bmi ? getBMICategory(bmi) : null;
  const gaugePercent = bmi ? Math.min(100, (bmi / 40) * 100) : 0;

  const minHealthy = values.height
    ? (18.5 * (parseFloat(values.height) / 100) ** 2).toFixed(1)
    : null;
  const maxHealthy = values.height
    ? (24.9 * (parseFloat(values.height) / 100) ** 2).toFixed(1)
    : null;

  const showResult = bmi !== null && !errors.height && !errors.weight;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-teal-50 text-teal-600 rounded-xl p-2.5">
          <Calculator size={22} aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">BMI Calculator</h1>
      </div>
      <p className="text-gray-500 mb-8">
        Calculate your Body Mass Index and see instantly which healthy range you fall into.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            name="height"
            label="Height (cm)"
            placeholder="e.g. 170"
            min={50}
            max={250}
            inputMode="decimal"
            value={values.height}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.height ? errors.height : ""}
          />
          <Input
            type="number"
            name="weight"
            label="Weight (kg)"
            placeholder="e.g. 65"
            min={2}
            max={400}
            inputMode="decimal"
            value={values.weight}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.weight ? errors.weight : ""}
          />
        </div>

        {showResult && category ? (
          <div className={`mt-8 rounded-2xl p-6 text-center ${category.bg}`}>
            <p className="text-sm text-gray-500">Your BMI</p>
            <p className={`text-4xl font-bold mt-1 ${category.color}`}>{bmi}</p>
            <p className={`text-sm font-medium mt-1 ${category.color}`}>{category.label}</p>

            <div className="mt-5">
              <div className="h-2.5 rounded-full bg-white overflow-hidden">
                <div
                  className={`h-full rounded-full ${category.barColor} transition-all`}
                  style={{ width: `${gaugePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>0</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40+</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Healthy weight range for your height: {minHealthy}kg - {maxHealthy}kg
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl p-6 text-center bg-gray-50 text-gray-400 text-sm">
            Enter your height and weight to see your BMI result.
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6 text-center">
          BMI is a general indicator and does not account for muscle mass, bone density, or body
          composition. Consult a doctor for a full health assessment.
        </p>
      </div>
    </div>
  );
}
