"use client";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F1] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-md p-8 border border-[#EAE0D5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5c4033] mb-2">Welcome Back</h1>
          <p className="text-[#8c7361]">What are you craving today?</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-[#5c4033] mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[#5c4033]">Password</label>
              <Link href="/forgot-password" className="text-sm text-[#b08968] hover:text-[#8c7361] font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-[#a67c52] hover:bg-[#8c6239] text-white rounded-full font-bold text-lg transition-colors shadow-sm"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-[#8c7361] mt-8">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#a67c52] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}