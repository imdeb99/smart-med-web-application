import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wallet, CreditCard, Smartphone, Banknote, CheckCircle2, FileDown } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { useAppointments } from "../../context/AppointmentsContext";
import { useToast } from "../../context/ToastContext";
import useFormValidation, { validators } from "../../hooks/useFormValidation";
import Modal from "../../components/shared/Modal";
import { Input } from "../../components/shared/Field";
import { downloadAppointmentPdf } from "../../api/appointments";

const paymentMethods = [
  { id: "bkash", label: "bKash", icon: Smartphone },
  { id: "nagad", label: "Nagad", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "cash", label: "Pay at Visit", icon: Banknote },
];

const PLATFORM_FEE = 20;

const cardNumberFormat = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const expiryFormat = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookAppointment } = useAppointments();
  const { addToast } = useToast();

  const booking = location.state;
  const [method, setMethod] = useState("bkash");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!confirmedAppointment) return;
    setDownloadingPdf(true);
    try {
      await downloadAppointmentPdf(confirmedAppointment.id);
      addToast("Appointment ticket downloaded.", "success");
    } catch (err) {
      addToast(err.message || "Could not download the ticket.", "error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const needsMobile = method === "bkash" || method === "nagad";
  const needsCard = method === "card";

  const { values, errors, touched, submitting, handleChange, handleBlur, handleSubmit, setValue } =
    useFormValidation(
      { mobile: "", cardNumber: "", expiry: "", cvc: "" },
      {
        mobile: (v) =>
          !needsMobile ? "" : validators.phone(v),
        cardNumber: (v) => {
          if (!needsCard) return "";
          if (!v || !String(v).trim()) return "Card number is required.";
          return String(v).replace(/\s/g, "").length === 16 ? "" : "Enter a valid 16-digit card number.";
        },
        expiry: (v) => {
          if (!needsCard) return "";
          if (!v || !String(v).trim()) return "Expiry date is required.";
          const [mm, yy] = String(v).split("/");
          const month = Number(mm);
          const year = Number(yy);
          if (!mm || !yy || month < 1 || month > 12) return "Use a valid MM/YY expiry.";
          const now = new Date();
          const exp = new Date(2000 + year, month, 0);
          if (exp < now) return "This card has expired.";
          return "";
        },
        cvc: (v) => {
          if (!needsCard) return "";
          if (!v || !String(v).trim()) return "CVC is required.";
          return /^\d{3,4}$/.test(String(v)) ? "" : "Enter the 3-digit CVC.";
        },
      }
    );

  if (!booking) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-gray-600">No booking details found.</p>
        <Link to="/patient/doctors" className="text-teal-600 hover:underline mt-3 inline-block">
          Find a doctor to book an appointment
        </Link>
      </div>
    );
  }

  // Doctor details are passed through booking state from the booking page,
  // so no separate doctor fetch is needed here.
  const doctor = {
    name: booking.doctorName || "Doctor",
    specialty: booking.doctorSpecialty || "",
    avatar: booking.doctorAvatar || "",
  };
  const total = booking.fee + PLATFORM_FEE;

  const onSubmit = async () => {
    setBookingError("");
    try {
      const appointment = await bookAppointment({
        doctorId: booking.doctorId,
        date: booking.date,
        time: booking.time,
        type: booking.type,
        fee: booking.fee,
        notes: "",
      });
      setConfirmedAppointment(appointment);
      setShowSuccess(true);
      addToast("Payment successful. Appointment booked!", "success");
    } catch (err) {
      setBookingError(err.message || "Could not book the appointment. Please try again.");
      addToast(bookingError || "Could not book the appointment.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
                aria-pressed={method === id}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  method === id
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500 hover:border-teal-300"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {method !== "cash" && (
            <form className="mt-5 space-y-3" noValidate>
              {needsMobile && (
                <Input
                  type="tel"
                  name="mobile"
                  label="Mobile Number"
                  placeholder="+880 1XXXXXXXXX"
                  autoComplete="tel"
                  value={values.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.mobile ? errors.mobile : ""}
                />
              )}
              {needsCard && (
                <>
                  <Input
                    type="text"
                    name="cardNumber"
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={values.cardNumber}
                    onChange={(e) => setValue("cardNumber", cardNumberFormat(e.target.value))}
                    onBlur={handleBlur}
                    error={touched.cardNumber ? errors.cardNumber : ""}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="text"
                      name="expiry"
                      label="Expiry"
                      placeholder="MM/YY"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={values.expiry}
                      onChange={(e) => setValue("expiry", expiryFormat(e.target.value))}
                      onBlur={handleBlur}
                      error={touched.expiry ? errors.expiry : ""}
                    />
                    <Input
                      type="text"
                      name="cvc"
                      label="CVC"
                      placeholder="123"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={values.cvc}
                      onChange={(e) => setValue("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onBlur={handleBlur}
                      error={touched.cvc ? errors.cvc : ""}
                    />
                  </div>
                </>
              )}
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Wallet size={13} aria-hidden="true" />
                This is a demo checkout — no real payment will be processed.
              </p>
            </form>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Invoice Summary</h2>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-gray-800">{doctor.name}</p>
              <p className="text-xs text-teal-600">{doctor.specialty}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm mt-4">
            <div className="flex justify-between text-gray-500">
              <span>Date</span>
              <span className="text-gray-800">{formatDate(booking.date)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Time</span>
              <span className="text-gray-800">{booking.time}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Type</span>
              <span className="text-gray-800 capitalize">
                {booking.type === "video" ? "Video Call" : "In-person"}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-gray-500">
              <span>Consultation Fee</span>
              <span>৳{booking.fee}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Platform Fee</span>
              <span>৳{PLATFORM_FEE}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="w-full mt-6 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {submitting ? "Processing..." : `Pay ৳${total}`}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showSuccess}
        onClose={() => navigate("/patient/appointments")}
        title="Payment Successful"
        footer={
          <>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-2 border border-teal-200 text-teal-700 hover:bg-teal-50 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileDown size={15} aria-hidden="true" />
              {downloadingPdf ? "Downloading..." : "Download PDF"}
            </button>
            <button
              onClick={() => navigate("/patient/appointments")}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
            >
              View My Appointments
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="bg-emerald-50 text-emerald-600 rounded-full p-3 mb-3">
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-600">
            Your appointment with <span className="font-medium text-gray-800">{doctor.name}</span> on{" "}
            {confirmedAppointment && formatDate(confirmedAppointment.date)} at{" "}
            {confirmedAppointment?.time} has been confirmed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
