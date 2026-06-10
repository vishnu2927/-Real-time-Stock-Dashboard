import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';

const schema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password')
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

/**
 * Registration page with auto-login.
 */
export default function Register() {
  const navigate = useNavigate();
  const { register: signUp } = useAuth();
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  /**
   * Submits the registration form.
   * @param {z.infer<typeof schema>} values
   */
  async function onSubmit(values) {
    const { confirmPassword, ...payload } = values;
    await signUp(payload);
    navigate('/dashboard');
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0F1629] p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <h1 className="text-3xl font-semibold text-white">Create account</h1>
      <p className="mt-2 text-sm text-slate-400">Join the dashboard and start tracking markets in real time.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Name</span>
          <input {...register('name')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Your name" />
          {errors.name ? <p className="mt-1 text-sm text-rose-300">{errors.name.message}</p> : null}
        </label>

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

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Confirm password</span>
          <input {...register('confirmPassword')} type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="••••••••" />
          {errors.confirmPassword ? <p className="mt-1 text-sm text-rose-300">{errors.confirmPassword.message}</p> : null}
        </label>

        <button disabled={isSubmitting} className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-70">
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-emerald-300 hover:text-emerald-200">Login</Link>
      </p>
    </section>
  );
}
