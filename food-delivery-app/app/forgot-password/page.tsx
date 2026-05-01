"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/clientApp";

export default function ForgotPasswordPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const slides = [
    "https://static.cordonbleu.edu/Files/MediaFile/88425.jpg",
    "https://m.media-amazon.com/images/S/assets.wholefoodsmarket.com//content/57/85/7a61e4d94a80ace0a3a0a50b03d4/2025-wfm-cen-novb-ee-thanksgiving-family-meals-wfmonsite-homepage-content-split._TTW_._CR0,0,1320,990_._SR900,675_._QL100_.jpg",
    "https://wowitsveggie.com/wp-content/uploads/2020/04/differenttypesofcofee-coffeedrinks.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
    } catch (error: unknown) {
      setStatus("error");
      if (error instanceof Error) {
        const code = (error as { code?: string }).code;
        if (code === "auth/user-not-found") {
          setErrorMessage("No account found with this email.");
        } else if (code === "auth/invalid-email") {
          setErrorMessage("Please enter a valid email address.");
        } else if (code === "auth/too-many-requests") {
          setErrorMessage("Too many attempts. Please try again later.");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EAE3D9]">
      <header className="h-16 flex items-center px-6 border-b border-[#D4C8BA] bg-[#EAE3D9] z-20 shrink-0">
        <Link href="/login" className="mr-4 hover:opacity-70 transition-opacity">
          <svg className="w-7 h-7 text-[#5C3A21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#5C3A21]">Brand</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col justify-center relative p-8">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#DCD1C4] rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-[#DCD1C4] rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

          <div className="max-w-sm mx-auto w-full relative z-10">
            <h2 className="text-4xl font-bold text-[#5C3A21] mb-4 text-center">Forgot Password</h2>

            {status === "success" ? (
              <div className="text-center space-y-6 mt-8">
                <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-[#6A4423]/10">
                  <svg className="w-8 h-8 text-[#6A4423]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#5C3A21] font-semibold text-lg">Check your email</p>
                <p className="text-[#A68A72] text-sm">
                  We sent a password reset link to <span className="font-medium text-[#5C3A21]">{email}</span>.
                  Check your inbox and follow the instructions.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setEmail(""); }}
                  className="text-sm text-[#8A6B52] hover:text-[#5C3A21] transition-colors underline underline-offset-2"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <>
                <p className="text-[#A68A72] text-sm text-center mb-8">
                  Enter your email and we'll send you a link to reset your password.
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-3 rounded-full border border-[#A68A72] bg-transparent text-[#5C3A21] placeholder:text-[#A68A72] focus:outline-none focus:ring-2 focus:ring-[#6A4423] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    required
                    disabled={status === "loading"}
                  />

                  {}
                  {status === "error" && (
                    <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                  )}

                  <div className="pt-4 flex justify-center">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-1/2 py-3 bg-[#6A4423] hover:bg-[#523318] text-white rounded-full font-semibold shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? "Sending..." : "Send Email"}
                    </button>
                  </div>
                </form>
              </>
            )}

            <div className="mt-16 text-center">
              <Link href="/login" className="text-sm text-[#8A6B52] hover:text-[#5C3A21] transition-colors">
                Back to Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 relative bg-[#4A3F35] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 transition-opacity mix-blend-overlay duration-1000 flex items-center justify-center bg-[#7e6855]">
            <img src={slides[currentSlide]} alt="Food slideshow" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}