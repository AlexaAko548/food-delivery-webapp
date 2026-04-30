"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/clientApp";
import { useCart } from "../../context/CartContext";

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { totalItems, setCartOpen } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserName(user.displayName || "User");
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="fixed top-0 left-0 w-full px-6 py-4 z-30 flex items-center justify-between bg-transparent">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <span className="text-white font-black text-xl tracking-[1.2px]">Brand</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <div className="relative">
          <button
            className="text-white hover:text-[#DCD1C4] transition-colors focus:outline-none relative cursor-pointer"
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsProfileOpen(false);
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#3a3028]" />
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-[#D4C8BA] overflow-hidden z-50">
              <div className="p-4 border-b border-[#D4C8BA] bg-[#FAF8F6]">
                <h3 className="font-bold text-[#5C3A21]">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-3xl mb-2 opacity-50">📭</div>
                    <p className="text-sm font-medium text-[#8A6B52]">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif: any, idx: number) => (
                    <div key={idx} className="p-4 border-b border-[#EAE3D9] hover:bg-[#FAF8F6] cursor-pointer transition-colors">
                      <p className="text-sm text-[#5C3A21] font-medium">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart Button — between bell and profile */}
        <button
          onClick={() => {
            setCartOpen(true);
            setIsProfileOpen(false);
            setIsNotificationOpen(false);
          }}
          className="relative text-white hover:text-[#DCD1C4] transition-colors focus:outline-none cursor-pointer"
          aria-label="Open cart"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {totalItems}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationOpen(false);
            }}
          >
            <div className="w-10 h-10 bg-[#A68A72] rounded-full border-2 border-white flex items-center justify-center text-white font-bold overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
            <span className="text-white font-medium">{userName} ▾</span>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-4 w-72 bg-[#EAE3D9] rounded-xl shadow-2xl border border-[#D4C8BA] overflow-hidden z-50">
              <div className="bg-[#997855] p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-s font-bold leading-tight tracking-wide">{userName}</span>
                  <Link href="/profile" className="text-white/90 text-sm hover:text-white underline decoration-1 underline-offset-2 mt-1">
                    View profile
                  </Link>
                </div>
              </div>
              <div className="flex flex-col py-2">
                <Link href="/help" className="px-6 py-2 text-s font-bold text-[#5C3A21] hover:bg-[#DCD1C4]">Help Center</Link>
                <Link href="/feedback" className="px-6 py-2 text-s font-bold text-[#5C3A21] hover:bg-[#DCD1C4]">Send Feedback</Link>
                <button onClick={handleLogout} className="w-full text-left px-6 py-2 text-s font-bold text-[#CD5C5C] hover:bg-[#DCD1C4]">
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}