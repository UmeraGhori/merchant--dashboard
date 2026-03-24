import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/stores')

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[360px] h-[360px] bg-blue-600 rounded-full opacity-20 blur-[100px]" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[280px] h-[280px] bg-indigo-500 rounded-full opacity-20 blur-[80px]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">M</div>
          <span className="text-white font-semibold text-xl">Merchant Dashboard</span>
        </div>

        {/* Center feature cards */}
        <div className="relative space-y-4">
          {[
            { icon: '🏪', title: 'Multi-Store Management', desc: 'Manage all your stores from one place' },
            { icon: '📦', title: 'Product Catalog', desc: 'Add, edit and control product availability' },
            { icon: '🛒', title: 'Order Tracking', desc: 'Track and update orders in real time' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-white font-medium text-sm">{f.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-slate-400 text-sm italic">"Built for food delivery merchants who mean business."</p>
        </div>
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back 👋</h1>
              <p className="text-slate-500 mt-1.5 text-sm">
                Sign in to manage your stores and products.
              </p>
            </div>

            <LoginForm />

            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 font-medium hover:underline">Sign up free</a>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 rounded-xl bg-white border border-dashed border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Demo credentials</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-slate-700">demo-a@merchant.com</p>
                <p className="font-mono text-xs text-slate-400">demo1234</p>
              </div>
              <span className="text-xl">🔑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
