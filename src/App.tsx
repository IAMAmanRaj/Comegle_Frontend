import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import CollegeNotAllowed from "./pages/CollegeNotAllowed";
import Onboarding from "./pages/Onboarding/Onboarding";
import { PrivateRoute } from "./components/PrivateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/collegenotallowed" element={<CollegeNotAllowed />} />
         
            {/* Protected routes */}
            <Route
              path="/landing"
              element={
                <PrivateRoute>
                  <Landing />
                </PrivateRoute>
              }
            />

            {/* Fallback 404 */}
            <Route path="*" element={<div>Not Found</div>} />
         
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#333", color: "#fff" },
            duration: 4000,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
