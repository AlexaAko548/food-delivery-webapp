"use client";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/clientApp"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#D4C8BA] p-8">
        <Link href="/home" className="text-[#8A6B52] hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-[#5C3A21] mb-6">Your Profile</h1>
        
        <div className="flex items-center gap-6 mb-8">
          <img 
            src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
            className="w-24 h-24 rounded-full border-4 border-[#DCD1C4]"
            alt="Profile"
          />
          <div>
            <h2 className="text-xl font-bold text-[#6A4423]">{user?.displayName || "User"}</h2>
            <p className="text-[#8A6B52]">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#FAF8F6] rounded-lg">
            <p className="text-sm font-bold text-[#5C3A21]">Account Status</p>
            <p className="text-sm text-[#8A6B52]">Verified Customer</p>
          </div>
        </div>
      </div>
    </div>
  );
}