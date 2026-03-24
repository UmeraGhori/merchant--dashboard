import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignupForm from '@/components/auth/SignupForm'

export default async function SignupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/stores')

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[360px] h-[360px] bg-indigo-600 rounded-full opacity-20 blur-[100px]" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] bg-blue-500 rounded-full opacity-20 blur-[80px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">M</div>
          <span className="text-white font-semibold text-xl">Merchant Dashboard</span>
        </div>

        {/* Steps */}
        <div className="relative space-y-6">
          <p className="text-white text-xl font-semibold leading-snug">Get started in minutes.<br />No credit card required.</p>
          {[
            { step: '01', text: 'Create your free account' },
            { step: '02', text: 'Add your first store' },
            { step: '03', text: 'Start managing products & orders' },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-4">
              <span className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                {s.step}
              </span>
              <p className="text-slate-300 text-sm">{s.text}</p>
            </div>
          ))}
        </div>

        <p className="relative text-slate-500 text-xs">© 2026 Merchant Dashboard. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">M</div>
            <span className="font-semibold text-lg">Merchant Dashboard</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account ✨</h1>
              <p className="text-slate-500 mt-1.5 text-sm">
                Start managing your stores and products today.
              </p>
            </div>

            <SignupForm />

            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 font-medium hover:underline">Sign in</a>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
