import { useMemo, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts +8801XXXXXXXXX / 01XXXXXXXXX / +1 (555) 000-0000 style numbers.
const PHONE_RE = /^\+?[\d\s().-]{8,}$/;

export const validators = {
  required: (value) => (value && String(value).trim() ? "" : "This field is required."),
  email: (value) => {
    if (!value || !String(value).trim()) return "Email is required.";
    return EMAIL_RE.test(String(value).trim()) ? "" : "Enter a valid email address.";
  },
  phone: (value) => {
    if (!value || !String(value).trim()) return "Phone number is required.";
    return PHONE_RE.test(String(value).trim()) ? "" : "Enter a valid phone number.";
  },
  minLength: (n) => (value) => {
    if (!value || String(value).trim().length < n) return `Must be at least ${n} characters.`;
    return "";
  },
  number: (value) => {
    if (value === "" || value === null || value === undefined) return "This field is required.";
    const n = Number(value);
    if (Number.isNaN(n)) return "Enter a valid number.";
    if (n <= 0) return "Must be greater than zero.";
    return "";
  },
};

export default function useFormValidation(initialValues, rules) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next = {};
    Object.keys(rules).forEach((field) => {
      const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
      for (const rule of fieldRules) {
        const error = typeof rule === "function" ? rule(values[field], values) : "";
        if (error) {
          next[field] = error;
          break;
        }
      }
    });
    return next;
  }, [values, rules]);

  const isValid = Object.keys(errors).length === 0;

  const setValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (e) => {
    setValue(e.target.name, e.target.value);
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = (onSubmit) => async (e) => {
    e.preventDefault();
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setTouched({});
    setSubmitting(false);
  };

  return {
    values,
    setValues,
    errors,
    touched,
    isValid,
    submitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
