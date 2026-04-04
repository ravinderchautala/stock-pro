import React from 'react';
import { supabase, isPlaceholder } from '../lib/supabase';
import { cn } from '../lib/utils';
import { AlertCircle, ExternalLink } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isPlaceholder) {
      setError('Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the project settings.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Network error: Could not connect to Supabase. Please check your internet connection or verify your Supabase URL in settings.');
      } else {
        setError(err.message || err.error_description || err.error || 'An unexpected error occurred. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Start managing your inventory today'}
          </p>
        </div>

        {isPlaceholder && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">Supabase Configuration Required</p>
            </div>
            <p className="text-xs text-amber-600">
              To use this application, you need to connect it to your Supabase project.
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
              >
                1. Create a Supabase project <ExternalLink size={12} />
              </a>
              <p className="text-xs text-amber-600">
                2. Go to Project Settings &gt; API and copy the <b>Project URL</b> and <b>anon key</b>.
              </p>
              <p className="text-xs text-amber-600">
                3. Add them to this project's <b>Settings &gt; Environment Variables</b> as:
              </p>
              <code className="text-[10px] bg-amber-100 p-1.5 rounded block">
                VITE_SUPABASE_URL=your_url<br/>
                VITE_SUPABASE_ANON_KEY=your_key
              </code>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className={cn(
              "p-3 rounded-lg text-sm",
              error.includes('confirmation') ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
