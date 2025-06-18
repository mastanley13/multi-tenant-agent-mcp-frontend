'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Zap, Shield, Users, ArrowRight, Sparkles } from 'lucide-react'

export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2),transparent_50%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Marketing Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-2"
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-purple-300 font-medium">AI-Powered CRM Assistant</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl lg:text-6xl font-bold leading-tight"
              >
                Transform Your
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {" "}GoHighLevel
                </span>
                <br />Experience
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-slate-300 leading-relaxed"
              >
                Unlock the full potential of your CRM with intelligent automation, 
                personalized insights, and seamless workflow management.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">Lightning Fast</div>
                  <div className="text-sm text-slate-400">Instant responses</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold">Secure</div>
                  <div className="text-sm text-slate-400">Enterprise-grade</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">Team Ready</div>
                  <div className="text-sm text-slate-400">Multi-user support</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                
                <CardTitle className="text-2xl font-bold text-white">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Connect your GoHighLevel account to access your personalized AI assistant
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={() => signIn('oauth')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                    size="lg"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Sign in with GoHighLevel</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center"
                >
                  <p className="text-xs text-slate-400">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                      Privacy Policy
                    </a>
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 