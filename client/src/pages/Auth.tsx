import { useState } from "react";
import { useLearning } from "../lib/stores/useLearning";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Spline from '@splinetool/react-spline';
// import CursorTrail from '../components/CursorTrail';

interface AuthProps {
  onNavigate: (page: string) => void;
}

export default function Auth({ onNavigate }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useLearning();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
        onNavigate("home");
      } else {
        await signup(username, password, email);
        onNavigate("home");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* <CursorTrail /> */}
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="flex min-h-screen">
        {/* Left Side - Spline Robot */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-full h-full max-w-2xl">
            <Spline scene="https://prod.spline.design/rU2-Ks0SC0T5od9B/scene.splinecode" />
          </div>
        </div>
        
        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl border border-green-400/30 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </h1>
                <p className="text-gray-300">
                  {isLogin ? 'Welcome back to Mantrix' : 'Join the Mantrix'}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-gray-300 text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                    placeholder="your.username@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                    placeholder="Enter your password"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                      placeholder="Enter your email"
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/20 border border-red-400/50 text-red-200 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                </Button>

                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-green-400 hover:text-green-300 text-sm transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <div className="text-center text-sm text-gray-400">
                  By continuing, you agree to our{' '}
                  <span className="text-green-400 hover:underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-green-400 hover:underline cursor-pointer">Privacy Policy</span>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
