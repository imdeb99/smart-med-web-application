import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Send,
  BadgeCheck,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { useDoctors } from "../../context/DoctorsContext";
import { useAuth } from "../../context/AuthContext";

function formatElapsed(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoConsultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const { getDoctorById } = useDoctors();
  const { user } = useAuth();

  const appointment = appointments.find((a) => a.id === appointmentId);
  const doctor = appointment ? getDoctorById(appointment.doctorId) : null;

  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, from: "doctor", text: "Hello! I can see you've joined. How are you feeling today?" },
  ]);
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!appointment || !doctor) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-gray-600">This consultation could not be found.</p>
      </div>
    );
  }

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "patient", text: draft.trim() }]);
    setDraft("");
  };

  const handleEndCall = () => navigate("/patient/appointments");

  return (
    <div className="bg-gray-900 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-white/90 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="sr-only">Live call, elapsed time</span>
          Live · {formatElapsed(elapsed)}
        </div>
        <div className="flex items-center gap-1.5">
          {doctor.name}
          {doctor.verified && (
            <BadgeCheck size={14} className="text-emerald-400" aria-label="Verified doctor" />
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex items-center justify-center p-4">
          <div className="w-full h-full max-h-[70vh] rounded-2xl bg-gray-800 flex flex-col items-center justify-center">
            {camOn ? (
              <>
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-28 h-28 rounded-full object-cover mb-4 opacity-90"
                />
                <p className="text-white/80 text-sm">{doctor.name}</p>
              </>
            ) : (
              <div className="text-white/50 text-sm flex flex-col items-center gap-2">
                <VideoOff size={32} aria-hidden="true" />
                Camera is off
              </div>
            )}
          </div>

          <div
            className="absolute bottom-8 right-8 w-32 h-24 sm:w-40 sm:h-28 rounded-xl bg-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-lg"
            aria-hidden="true"
          >
            {camOn ? (
              <span className="text-white/70 text-xs">You ({user?.name || "Patient"})</span>
            ) : (
              <VideoOff size={20} className="text-white/40" />
            )}
          </div>
        </div>

        {chatOpen && (
          <aside className="w-full max-w-xs bg-white flex flex-col border-l border-gray-200" aria-label="Chat">
            <div className="px-4 py-3 border-b border-gray-100 font-medium text-gray-800 text-sm">
              Chat with {doctor.name}
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                    m.from === "patient"
                      ? "bg-teal-600 text-white ml-auto"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Type a message
              </label>
              <input
                id="chat-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                onClick={sendMessage}
                aria-label="Send message"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 flex items-center justify-center transition-colors"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
          </aside>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 py-5 bg-gray-900/80">
        <button
          onClick={() => setMicOn((prev) => !prev)}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          aria-pressed={!micOn}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            micOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-600 text-white"
          }`}
        >
          {micOn ? <Mic size={18} aria-hidden="true" /> : <MicOff size={18} aria-hidden="true" />}
        </button>
        <button
          onClick={() => setCamOn((prev) => !prev)}
          aria-label={camOn ? "Turn off camera" : "Turn on camera"}
          aria-pressed={!camOn}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            camOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-600 text-white"
          }`}
        >
          {camOn ? <Video size={18} aria-hidden="true" /> : <VideoOff size={18} aria-hidden="true" />}
        </button>
        <button
          onClick={() => setChatOpen((prev) => !prev)}
          aria-label={chatOpen ? "Close chat" : "Open chat"}
          aria-pressed={chatOpen}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            chatOpen ? "bg-teal-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          <MessageSquare size={18} aria-hidden="true" />
        </button>
        <button
          onClick={handleEndCall}
          aria-label="End call"
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
        >
          <PhoneOff size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
