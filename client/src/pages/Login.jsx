import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

/**
 * Login page with validation and password toggle.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  /**
   * Submits the login form.
   * @param {z.infer<typeof schema>} values
   */
  async function onSubmit(values) {
    await login(values);
    navigate('/dashboard');
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0F1629] p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to access your real-time dashboard.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Email</span>
          <input {...register('email')} type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="you@example.com" />
          {errors.email ? <p className="mt-1 text-sm text-rose-300">{errors.email.message}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Password</span>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <input {...register('password')} type={visible ? 'text' : 'password'} className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="••••••••" />
            <button type="button" onClick={() => setVisible((current) => !current)} className="text-xs text-slate-400">
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password ? <p className="mt-1 text-sm text-rose-300">{errors.password.message}</p> : null}
        </label>

        <button disabled={isSubmitting} className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70">
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        New here? <Link to="/register" className="text-emerald-300 hover:text-emerald-200">Create an account</Link>
      </p>
    </section>
  );
}
