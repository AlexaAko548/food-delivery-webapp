"use client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F1] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-md p-8 border border-[#EAE0D5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5c4033] mb-2">Reset Password</h1>
          <p className="text-[#8c7361] text-sm">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>
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

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-[#a67c52] hover:bg-[#8c6239] text-white rounded-full font-bold text-lg transition-colors shadow-sm"
          >
            Send Reset Link
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="text-[#a67c52] font-bold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}