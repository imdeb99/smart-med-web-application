import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppointmentsProvider } from "./context/AppointmentsContext";
import { PrescriptionsProvider } from "./context/PrescriptionsContext";
import { DoctorsProvider } from "./context/DoctorsContext";
import { PatientsProvider } from "./context/PatientsContext";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DoctorsProvider>
          <PatientsProvider>
            <AppointmentsProvider>
              <PrescriptionsProvider>
                <BrowserRouter>
                  <div className="min-h-screen flex flex-col bg-gray-50">
                    <Navbar />
                    <main className="flex-1">
                      <AppRoutes />
                    </main>
                    <Footer />
                  </div>
                </BrowserRouter>
              </PrescriptionsProvider>
            </AppointmentsProvider>
          </PatientsProvider>
        </DoctorsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
