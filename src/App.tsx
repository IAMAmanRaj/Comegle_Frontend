import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import { PrivateRoute } from "./components/PrivateRoute";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import CollegeNotAllowed from "./pages/CollegeNotAllowed";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Protected routes */}
            <Route
              path="/landing"
              element={
                <PrivateRoute>
                  <Landing />
                </PrivateRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                  <Onboarding />
              }
            />
            <Route path="/collegenotallowed" element={<CollegeNotAllowed />} />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
    </QueryClientProvider>
  );
}

export default App;
