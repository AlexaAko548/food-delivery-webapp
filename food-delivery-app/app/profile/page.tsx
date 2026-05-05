"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/clientApp"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

const orders = [
  { id: 1, items: 4, date: "15 Apr 2026, 19:03", total: "$13.42" },
  { id: 2, items: 7, date: "02 Apr 2026, 13:57", total: "$22.78" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0EBE3] font-sans">
      {/* Cover + Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-45 w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 h-45 bg-black/20" />
        </div>

        {/* Top Nav */}
        <div className="absolute top-3 right-3 flex items-center gap-3">
          <Link href="/home">
            <button className="w-9 h-9 flex items-center justify-center text-white cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </button>
          </Link>
          <button className="px-4 py-1.5 rounded-full bg-[#7B4F2E] text-white text-sm font-semibold shadow hover:bg-[#6a4226] transition">
            Edit Profile
          </button>
        </div>

        {/* Avatar + Name row */}
        <div className="bg-[#EDE5DA] px-10 pt-3 pb-5 flex items-center gap-4">
          <div className="w-35 h-35 rounded-full border-4 border-[#EDE5DA] overflow-hidden -mt-10 shadow-md flex-shrink-0">
            <img
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#5C3010]">
              {user?.displayName || "User"}
            </h1>
            <p className="text-sm text-[#8B6246]">
              {user?.email}
            </p>
            <p className="text-sm text-[#8B6246]">
              123 Main St, Anytown, USA 12345
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#EDE5DA]/60 px-10 py-5">
        <div className="flex gap-3">
          {/* Mastercard Card */}
          <div className="bg-white rounded-2xl border border-[#D9CEBC] p-4 w-40 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              {/* Mastercard logo */}
              <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="13" cy="12" r="10" fill="#EB001B" />
                <circle cx="23" cy="12" r="10" fill="#F79E1B" />
                <path d="M18 5.4a10 10 0 0 1 0 13.2A10 10 0 0 1 18 5.4z" fill="#FF5F00" />
              </svg>
              <span className="text-[10px] font-semibold text-[#8B6246] border border-[#C4B49A] rounded-full px-2 py-0.5">
                Default
              </span>
            </div>
            <p className="text-xs font-medium text-[#5C3010]">Mastercard</p>
            <p className="text-xs text-[#8B6246]">37**********465</p>
          </div>

          {/* Add Payment */}
          <div className="bg-white rounded-2xl border border-dashed border-[#C4B49A] p-4 w-40 flex flex-col items-center justify-center gap-2 shadow-sm cursor-pointer hover:bg-[#FAF7F3] transition">
            <div className="w-9 h-9 rounded-full bg-[#EDE5DA] flex items-center justify-center text-[#8B6246] text-xl font-light">
              +
            </div>
            <p className="text-xs text-[#8B6246] text-center leading-tight">
              Add a different<br />payment method
            </p>
          </div>
        </div>
      </div>

      {/* Past Orders */}
      <div className="bg-[#F0EBE3] px-10 pt-6 pb-10">
        <h2 className="text-lg font-bold text-[#5C3010] mb-4">Past</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-[#E4D8C8]"
            >
              {/* Coffee icon */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&q=80"
                  alt="Coffee"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#5C3010]">{order.items} items</p>
                <p className="text-xs text-[#A08060]">{order.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#5C3010]">{order.total}</p>
                <button className="text-xs text-[#7B4F2E] underline underline-offset-2 font-medium hover:text-[#5C3010] transition mt-0.5">
                  Reorder →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}