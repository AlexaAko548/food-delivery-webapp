"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ForgotPasswordPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Placeholder Image 1", "Placeholder Image 2", "Placeholder Image 3"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
            <h2 className="text-4xl font-bold text-[#5C3A21] mb-12 text-center">Forgot Password</h2>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-6 py-3 rounded-full border border-[#A68A72] bg-transparent text-[#5C3A21] placeholder:text-[#A68A72] focus:outline-none focus:ring-2 focus:ring-[#6A4423] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                required
              />

              <div className="pt-6 flex justify-center">
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#6A4423] hover:bg-[#523318] text-white rounded-full font-semibold shadow-md transition-colors"
                >
                  Send Email
                </button>
              </div>
            </form>

            <div className="mt-20 text-center">
              <Link href="/login" className="text-sm text-[#8A6B52] hover:text-[#5C3A21] transition-colors">
                Back to Sign in
              </Link>
            </div>
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