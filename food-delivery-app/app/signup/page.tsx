"use client";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/clientApp";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err:any) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F1] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-md p-8 border border-[#EAE0D5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5c4033] mb-2">Create Account</h1>
          <p className="text-[#8c7361]">Join us to start ordering.</p>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm font-medium text-[#5c4033] mb-1">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5c4033] mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5c4033] mb-1">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5c4033] mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-6 bg-[#a67c52] hover:bg-[#8c6239] text-white rounded-full font-bold text-lg transition-colors shadow-sm"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-[#8c7361] mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-[#a67c52] font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}