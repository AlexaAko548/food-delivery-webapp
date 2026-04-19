"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/clientApp"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Placeholder Image 1", "Placeholder Image 2", "Placeholder Image 3"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/home");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home"); 
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/home"); 
    } catch (err:any) {
      setError("Google sign-in failed. Please try again.");
    }
  }; 

  return (
    <div className="min-h-screen flex flex-col bg-[#E7E2DE]">
      <header className="h-16 flex items-center px-6 border-b border-[#D4C8BA] bg-[#E7E2DE] z-20 shrink-0">
        <button className="mr-4">
          <svg className="w-7 h-7 text-[#5C3A21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <Link href="/" className="hover:opacity-70 transition-opacity text-2xl font-bold text-[#5C3A21]">Brand</Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        <div className="w-full md:w-1/2 flex flex-col justify-center relative p-8">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#DCD1C4] rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-[#DCD1C4] rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

          <div className="max-w-sm mx-auto w-full relative z-10">
            <h2 className="text-4xl font-bold text-[#5C3A21] mb-8 text-center">Sign In</h2>
            
            {error && <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>}
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-6 py-3 rounded-full border border-[#A68A72] bg-transparent text-[#5C3A21] placeholder:text-[#A68A72] focus:outline-none focus:ring-2 focus:ring-[#6A4423] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-6 py-3 rounded-full border border-[#A68A72] bg-transparent text-[#5C3A21] placeholder:text-[#A68A72] focus:outline-none focus:ring-2 focus:ring-[#6A4423] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-2 px-4">
                  <Link href="/forgot-password" className="text-sm text-[#8A6B52] hover:text-[#5C3A21] underline decoration-1 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#6A4423] hover:bg-[#523318] text-white rounded-full font-semibold shadow-md transition-colors"
                >
                  Login
                </button>
              </div>
            </form>

            <div className="flex items-center my-8 max-w-xs mx-auto">
              <hr className="grow border-t border-[#D4C8BA]" />
              <span className="mx-4 text-sm text-[#8A6B52]">or</span>
              <hr className="grow border-t border-[#D4C8BA]" />
            </div>

            <button
              type="button"
              className="w-full py-3 flex items-center justify-center gap-3 border border-[#D4C8BA] rounded-full font-bold text-[#5C3A21] bg-[#FAF8F6] hover:bg-white transition-colors shadow-sm"
              onClick={handleGoogleLogin}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" /> 
              Continue with Google
            </button>

            <p className="text-center text-[#8A6B52] mt-8 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#8A6B52] underline decoration-1 hover:text-[#5C3A21] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 relative bg-[#4A3F35] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 transition-opacity duration-1000 flex items-center justify-center bg-[#3a3028]">
            <span className="text-[#EAE3D9] font-bold text-2xl border-2 border-[#EAE3D9] p-6 rounded-xl bg-black/20">
              {slides[currentSlide]}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}