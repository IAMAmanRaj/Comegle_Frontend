import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shuffle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore, type User } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/utils";


interface Test {
  user: User;
}

const testEmails = [
  "testuser_test1@test1.ac.in",
  "testuser_test2@test2.ac.in",
  "testuser_test3@test3.ac.in",
  "testuser_test4@test4.ac.in",
  "testuser_test5@test5.ac.in",
];

    export default function Test({ user }: Test) {
  const [isTestMode, setIsTestMode] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setUser, setToken, token } = useAuthStore();

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (credential: string) => {
      const res = await api.post("/auth/google/verify", { credential });
      return res.data;
    },
    onSuccess: (response) => {
      // ✅ Redirect logic
      if (response.message.includes("already exists")) {
        // ✅ Save user in zustand
        setUser(response.data.user);
        setToken(response.data.accessToken);
        navigate("/landing");
        toast.success("Welcome back!");
      } else if (response.message.includes("College allowed")) {
        setUser(response.data.user);
        setToken(null);
        navigate("/onboarding");
        toast.success(response.message);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Authentication failed");
      if (err.response?.status === 403) {
        setUser(err.response?.data?.data?.user || null);
        navigate("/collegenotallowed");
      }
    },
  });

  const generateTestEmail = () => {
    const randomEmail =
      testEmails[Math.floor(Math.random() * testEmails.length)];
    setTestEmail(randomEmail);
  };

  const handleTestLogin = async () => {
    if (!testEmail) {
      generateTestEmail();
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/test/verify", { email: testEmail });
      const response = res.data;

      if (res.status === 200 && response.success) {
        // ✅ same flow as google success
        setUser(response.data.user);
        setToken(response.data.accessToken);
        navigate("/landing");
        toast.success("Welcome back!");
      } else {
        toast.error(response.message || "Invalid test email");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid test email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        id="join-comegle"
        className="p-8 bg-card/50 backdrop-blur-sm border-border/50"
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Join Comegle</h3>
          <p className="text-muted-foreground cursor-pointer text-sm">
            {isTestMode && !user
              ? "Try with a test account"
              : "Sign in with your college email"}
          </p>
        </div>

        {
          token &&  (
           <Button
              variant="outline"
              className="w-full cursor-pointer bg-transparent"
              onClick={() => navigate("/landing")}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Continue as {user?.email}
            </Button>
          ) 
        }

        {!isTestMode && !token? (
          
          <div className="space-y-4 flex flex-col items-center">
            {mutation.isPending ? (
              <div className="flex items-center">
                <span className="mr-2">Signing in...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={(res) =>
                  res.credential && mutation.mutate(res.credential)
                }
                onError={() => toast.error("Google Login Failed")}
              />
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full cursor-pointer bg-transparent"
              onClick={() => setIsTestMode(true)}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Try with Test Account
            </Button>
          </div>
        ) : (
          !token && ( <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Click generate to get test email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={generateTestEmail}
                className="flex-1 cursor-pointer hover:text-emerald-600 hover:bg-white bg-transparent"
              >
                <Shuffle className="w-4 h-4 mr-2 " />
                Generate
              </Button>
              <Button
                onClick={handleTestLogin}
                disabled={!testEmail || isLoading}
                className="flex-1 cursor-pointer bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Signing in..." : "Enter"}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full cursor-pointer text-sm"
              onClick={() => setIsTestMode(false)}
            >
              Back to Google Login
            </Button>
          </div>)
         
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Only college email addresses are allowed for registration
        </p>
      </Card>
    </div>
  );
}
