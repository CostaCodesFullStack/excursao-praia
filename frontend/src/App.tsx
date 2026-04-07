import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import ProtectedLayout from "./components/ProtectedLayout";
import { useTheme } from "./lib/theme";
import BusMapPage from "./pages/BusMap";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import PassengersPage from "./pages/Passengers";

function AppShell() {
  const { theme } = useTheme();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/bus" element={<BusMapPage />} />
            <Route path="/passengers" element={<PassengersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        theme={theme}
        toastOptions={{
          classNames: {
            toast: "font-body",
          },
        }}
      />
    </>
  );
}

export default AppShell;

