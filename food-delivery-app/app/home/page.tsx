"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/clientApp"; 
import Header from "../components/Header";

const CATEGORIES = [
  { name: "Pasta", icon: "🍝" },
  { name: "Sandwiches", icon: "🥪" },
  { name: "Pastries", icon: "🥖" },
  { name: "Drinks", icon: "🥤" },
];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Route Protection only (Identity is handled inside Header)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#DCD1C4] border-t-[#6A4423] rounded-full animate-spin"></div>
          <p className="text-[#6A4423] font-bold animate-pulse">Loading your cravings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      
      {/* 1. Hero Section */}
      <section className="relative h-[65vh] min-h-[500px] w-full bg-[#3a3028] flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('/top.webp')" }}
        ></div>

        {/* --- THE IMPORTED HEADER --- */}
        <Header />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center mt-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center drop-shadow-md">
            What are you craving today?
          </h1>

          {/* Search Bar */}
          <div className="flex w-full max-w-2xl gap-3 mb-12">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#8A6B52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Pasta? Bread? Something sweet?" 
                className="w-full pl-12 pr-4 py-4 rounded-full bg-[#E7E2DE] text-[#5C3A21] placeholder:text-[#8A6B52] focus:outline-none focus:ring-4 focus:ring-[#6A4423]/50 transition-all font-medium"
              />
            </div>
            <button className="px-8 py-4 bg-[#997855] hover:bg-[#745b40] text-white rounded-full font-bold shadow-lg transition-colors">
              Search
            </button>
          </div>

          {/* Categories - Now linked to dynamic routes */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {CATEGORIES.map((cat, index) => (
              <Link 
                key={index} 
                href={`/${cat.name.toLowerCase()}`}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#DCD1C4] border-2 border-white/20 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">
                  {cat.icon}
                </div>
                <span className="text-white text-sm font-semibold drop-shadow-md group-hover:text-[#DCD1C4] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Your Last Order Section */}
      <section className="w-full bg-[#E7E2DE] rounded-b-4xl shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-[#6A4423]">Your Last Order</h2>
            <button className="text-sm font-semibold text-[#8A6B52] hover:text-[#5C3A21] underline decoration-1 transition-colors">
              Add all to basket
            </button>
          </div>
          
          <div className="grid grid-flow-col auto-cols-[85%] md:auto-cols-[calc(33.333%-1rem)] gap-6 overflow-x-auto snap-x snap-mandatory pb-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D4C8BA] [&::-webkit-scrollbar-thumb]:rounded-full">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={`last-order-${item}`} className="snap-start h-full">
                <FoodCard />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Limited Time Only Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#6A4423] mb-6 text-center tracking-wide uppercase">
          Limited Time Only
        </h2>
        
        <div className="grid grid-flow-col auto-cols-[85%] md:auto-cols-[calc(33.333%-1rem)] gap-6 overflow-x-auto snap-x snap-mandatory pb-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D4C8BA] [&::-webkit-scrollbar-thumb]:rounded-full">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={`lto-${item}`} className="snap-start h-full">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D4C8BA] flex flex-col hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="h-56 bg-[#997855] flex items-center justify-center text-[#EAE3D9]/70 font-medium">
                  image
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-[#5C3A21]">Special Item {item}</h3>
                    <span className="font-bold text-[#8A6B52]">₱350.00</span>
                  </div>
                  <p className="text-sm text-[#8A6B52] mt-auto">Available until this weekend only!</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

            {/* 4. Most Ordered Section */}
      <section className="w-full bg-[#E7E2DE] rounded-t-4xl shadow-[0_-7px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          
          <h2 className="text-2xl font-bold text-[#6A4423] mb-6">Most Ordered</h2>
          
          {/* Keeping this as a standard wrap grid since you didn't ask for scroll here, but you can copy the classes above if you want it here too! */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {[1, 2, 3].map((item) => (
              <FoodCard key={`popular-${item}`} />
            ))}
          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="w-full bg-[#3a3028] text-[#DCD1C4] py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-2xl font-bold text-white">Brand</span>
            <p className="text-sm opacity-80">
              &copy; {new Date().getFullYear()} Brand Inc. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Reusable UI Component for standard food items
function FoodCard() {
  return (
    <div className="h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D4C8BA] flex flex-col hover:shadow-md transition-shadow cursor-pointer">
      {/* Image Placeholder */}
      <div className="h-48 bg-[#997855] flex items-center justify-center text-[#EAE3D9]/70 font-medium shrink-0">
        image
      </div>
      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-[#5C3A21]">Food Name</h3>
          <span className="font-bold text-[#8A6B52]">₱120.00</span>
        </div>
        <p className="text-xs text-[#8A6B52] line-clamp-2 mt-auto">
          short description of the food item goes right here.
        </p>
      </div>
    </div>
  );
}