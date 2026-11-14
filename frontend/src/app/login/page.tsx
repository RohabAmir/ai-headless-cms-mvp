"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("admin@cms.com")
  const [password, setPassword] = useState("Admin@123")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success("Welcome to Headly")
      router.replace("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh bg-black lg:grid-cols-2">
      <div className="relative flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-[#c026a0] via-[#7c3aed] to-[#1e3a8a] text-sm font-bold">
            H
          </div>
        </div>

        <div className="mx-auto w-full max-w-md py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Welcome to Headly Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Login &amp; simplify your website management.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Write your email"
                className="h-11 border-white/10 bg-zinc-950"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 border-white/10 bg-zinc-950 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#4c47ad] to-[#b02e8d] text-white hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login →"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Demo: <span className="text-zinc-300">admin@cms.com</span> /{" "}
            <span className="text-zinc-300">Admin@123</span>
          </p>
        </div>

        <p className="text-xs text-zinc-600">Headly © 2026 All Rights Reserved.</p>
      </div>

      <div className="relative hidden overflow-hidden p-6 lg:block">
        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_top,_#3b0764_0%,_#0a0a0b_55%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(192,38,160,0.25)_50%,transparent_80%)]" />
          <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-[#7c3aed]/30 blur-3xl" />
          <div className="absolute top-16 right-10 h-48 w-48 rounded-full bg-[#c026a0]/25 blur-3xl" />
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c026a0] via-[#7c3aed] to-[#1e3a8a] text-2xl font-bold shadow-2xl shadow-[#c026a0]/40">
              H
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              Headly®
            </h2>
            <p className="mt-2 text-sm tracking-[0.35em] text-zinc-300 uppercase">
              ai headless cms
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
