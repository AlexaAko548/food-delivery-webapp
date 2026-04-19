"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import { auth } from "../../firebase/clientApp";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err:any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err:any) {
      setError("Google sign-in failed. Please try again.");
    }
  }; 


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F1] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-md p-8 border border-[#EAE0D5]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5c4033] mb-2">Welcome Back</h1>
          <p className="text-[#8c7361]">What are you craving today?</p>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form className="space-y-5" onSubmit={handleLogin}>
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[#5c4033]">Password</label>
              <Link href="/forgot-password" className="text-sm text-[#b08968] hover:text-[#8c7361] font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-[#EAE0D5] bg-[#F8F5F1] text-[#5c4033] focus:outline-none focus:ring-2 focus:ring-[#b08968] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-[#a67c52] hover:bg-[#8c6239] text-white rounded-full font-bold text-lg transition-colors shadow-sm"
          >
            Log In
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-[#EAE0D5]" />
          <span className="mx-4 text-sm text-[#8c7361]">or</span>
          <hr className="flex-grow border-t border-[#EAE0D5]" />
        </div>

        <button
          type="button"
          className="w-full py-3 mb-4 flex items-center justify-center gap-3 border border-[#EAE0D5] rounded-full font-bold text-[#5c4033] bg-white hover:bg-[#F8F5F1] transition-colors shadow-sm"
          onClick={handleGoogleLogin}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

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