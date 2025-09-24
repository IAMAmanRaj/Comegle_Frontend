import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import CollegeNotAllowed from "./pages/CollegeNotAllowed/CollegeNotAllowed";
import Onboarding from "./pages/Onboarding/Onboarding";
import { PrivateRoute } from "./components/PrivateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./pages/Profile/Profile";
import { PublicRoute } from "./components/PublicRoute";

const queryClient = new QueryClient();

function App() {

  const openRoutes = [
    { path: "/collegenotallowed", element: <CollegeNotAllowed /> },
    { path: "/onboarding", element: <Onboarding /> },
  ]

  const authPublicRoutes = [
    { path: "/", element: <Home /> },
    
  ];

  const authPrivateRoutes = [
    { path: "/landing", element: <Landing /> },
    { path: "/profile", element: <ProfilePage /> },
  ]

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Open Public routes */}
          {openRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
         
          {/* Protected Public routes */}
          {authPublicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<PublicRoute>{element}</PublicRoute>} />
          ))}

          {/* Protected routes */}
          {authPrivateRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<PrivateRoute>{element}</PrivateRoute>} />
          ))}

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
