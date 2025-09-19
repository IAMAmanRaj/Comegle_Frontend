import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, MapPin, Shield, Zap, Heart } from "lucide-react";
import Test from "./Test";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Main() {
  const activeStudentsRef = useRef<HTMLDivElement>(null);
  const collegesRef = useRef<HTMLDivElement>(null);
  const communitiesRef = useRef<HTMLDivElement>(null);
  const connectionsRef = useRef<HTMLDivElement>(null);

  const handleStartConnecting = () => {
    if (window.innerWidth < 1024) {
      // mobile → scroll 30vh down to signup
      gsap.to(window, {
        duration: 1,
        scrollTo: window.scrollY + window.innerHeight * 0.3,
        ease: "power2.inOut",
      });
    } else {
      // desktop → pulse animation
      const card = document.getElementById("join-comegle");
      if (card) {
        gsap.fromTo(
          card,
          { boxShadow: "0 0 0px rgba(34,197,94,0)", scale: 1 },
          {
            boxShadow: "0 0 40px rgba(34,197,94,0.9)", // Tailwind's green-500 color
            scale: 1.05,
            duration: 0.6,
            repeat: 1,
            yoyo: true,
            ease: "power2.inOut",
          }
        );
      }
    }
  };

  useEffect(() => {
    const animateNumber = (
      el: HTMLDivElement | null,
      end: number,
      suffix = ""
    ) => {
      if (!el) return;
      const obj = { val: 0 };
      gsap.fromTo(
        obj,
        { val: 0 },
        {
          val: end,
          duration: 2,
          ease: "power1.out",
          onUpdate: function () {
            el.textContent = Math.floor(obj.val).toLocaleString() + suffix;
          },
        }
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNumber(activeStudentsRef.current, 500, "+");
            animateNumber(collegesRef.current, 180, "+");
            animateNumber(communitiesRef.current, 10, "+");
            animateNumber(connectionsRef.current, 10000, "+");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (activeStudentsRef.current) {
      observer.observe(activeStudentsRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="absolute inset-0 bg-[url('/abstract-network.png')] opacity-5"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">
                ✨ Now Live for Indian Colleges
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-balance">
                <span className="text-emerald-600">Comegle</span>
                <br />
                <span className="text-slate-700 relative top-2">Omegle for Colleges</span>
              </h1>
              <p className="text-xl text-slate-500 mb-8 text-pretty">
                Connect with college students through video chat, join interest
                communities, and network with legitimate students across India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleStartConnecting}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white"
                >
                  Start Connecting
                </Button>
                <Link
                  to="video_link_here_boye"
                  target="_blank"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="border-emerald-200 bg-white shadow-xl border text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <Test />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-700">
              Why Choose Comegle?
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Experience the next generation of college networking with features
              designed for students
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">
                Smart Matching
              </h3>
              <p className="text-slate-500">
                Control your connections with state-based and gender-based
                matching. Connect with students from specific regions or
                colleges.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">
                Interest Communities
              </h3>
              <p className="text-slate-500">
                Join communities for DSA, startups, movies, competitive
                programming, and more. Find your tribe with shared interests.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-gray-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-700">
                Verified Students
              </h3>
              <p className="text-slate-500">
                Network with legitimate college students only. Educational email
                verification ensures authentic connections.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-700">
              See Comegle in Action
            </h2>
            <p className="text-xl text-slate-500">
              Experience seamless video chat and community features
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/communitiesUI-L6u0xwxppcvcMk5aqyaPL2nfHI32Nr.png"
                alt="Comegle Communities Interface"
                className="rounded-xl shadow-2xl w-full"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Video className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-700">
                    1:1 Video Chat
                  </h3>
                  <p className="text-slate-500">
                    Connect face-to-face with college students through
                    high-quality video calls
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-700">
                    Quick Connect
                  </h3>
                  <p className="text-slate-500">
                    Jump into conversations instantly or configure your matching
                    preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-700">
                    Community Driven
                  </h3>
                  <p className="text-slate-500">
                    Join trending communities and connect with like-minded
                    students
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div ref={activeStudentsRef} className="text-4xl font-bold mb-2">
                0
              </div>
              <div className="text-emerald-100">Active Students</div>
            </div>
            <div>
              <div ref={collegesRef} className="text-4xl font-bold mb-2">
                0
              </div>
              <div className="text-emerald-100">Colleges</div>
            </div>
            <div>
              <div ref={communitiesRef} className="text-4xl font-bold mb-2">
                0
              </div>
              <div className="text-emerald-100">Communities</div>
            </div>
            <div>
              <div ref={connectionsRef} className="text-4xl font-bold mb-2">
                0
              </div>
              <div className="text-emerald-100">Connections Made</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-700">
            Ready to Expand Your Network?
          </h2>
          <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
            Join thousands of college students already connecting, learning, and
            growing together on Comegle.
          </p>
          <Button
            size="lg"
            onClick={() => {
              const target = document.getElementById("join-comegle");
              if (target) {
                gsap.to(window, {
                  duration: 1,
                  scrollTo: { y: target, offsetY: 40 }, // offsetY optional for spacing
                  ease: "power2.inOut",
                });
              }
            }}
            className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-700">Comegle</h3>
              <p className="text-slate-500 text-sm">
                Connecting college students across India through meaningful
                conversations and shared interests.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-700">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Features</li>
                <li>Communities</li>
                <li>Safety</li>
                <li>Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-700">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-700">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>Twitter</li>
                <li>Instagram</li>
                <li>LinkedIn</li>
                <li>Discord</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-slate-500">
            <p>
              &copy; 2025 Comegle. Made with ❤️ by{" "}
              <Link
                className="text-gray-600 font-semibold"
                target="_blank"
                to="https://www.linkedin.com/in/aman-raj-a3710622a/"
              >
                Aman
              </Link>{" "}
              &{" "}
              <Link
                target="_blank"
                to="https://www.linkedin.com/in/aditya-raj-72b825223/z"
                className="text-gray-600 font-semibold"
              >
                Aditya
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
