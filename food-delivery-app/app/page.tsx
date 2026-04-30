"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/clientApp";

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["Placeholder Image 1", "Placeholder Image 2", "Placeholder Image 3"];
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex flex-col bg-[#E7E2DE]">
      {/* Full-width Header */}
      <header className="h-16 flex items-center px-6 border-b border-[#D4C8BA] bg-[#E7E2DE] z-20 shrink-0">
        <button className="mr-4">
          <svg className="w-7 h-7 text-[#5C3A21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <Link href="/" className="hover:opacity-70 transition-opacity text-2xl font-bold text-[#5C3A21]">Brand</Link>
      </header>

      {/* Split Screen Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side - Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative p-8 md:p-16">
          {/* Soft Blurred Background Blobs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#DCD1C4] rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-[#DCD1C4] rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

          <div className="max-w-md mx-auto w-full relative z-10">
            <p className="text-[#8A6B52] text-xl mb-2">Howdy!</p>
            <h2 className="text-5xl md:text-6xl font-bold text-[#5C3A21] leading-tight mb-12">
              Your favorite dishes<br/>delivered fast
            </h2>
            
            <Link 
              href="/login" 
              className="inline-block px-12 py-3 bg-[#6A4423] hover:bg-[#523318] text-white rounded-full font-semibold shadow-md transition-colors text-center"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right Side - Slideshow */}
        <div className="hidden md:flex w-1/2 relative bg-[#4A3F35] items-center justify-center overflow-hidden">
          {/* Slideshow Content */}
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