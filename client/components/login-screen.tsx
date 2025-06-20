'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Zap, Shield, Users, ArrowRight, Sparkles, Star, Rocket, Brain } from 'lucide-react'

export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Multiple gradient overlays for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.2),transparent_50%)]" />
        
        {/* Animated mesh pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mesh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#mesh)" />
          </svg>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-purple-400/20' : i % 3 === 1 ? 'bg-pink-400/20' : 'bg-blue-400/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Enhanced Marketing Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-10"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-3"
              >
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-purple-400/20">
                  <Sparkles className="w-6 h-6 text-purple-300" />
                </div>
                <span className="text-purple-300 font-semibold text-lg">AI-Powered CRM Revolution</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl xl:text-7xl font-black leading-tight tracking-tight"
              >
                Transform Your
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  GoHighLevel
                </span>
                <span className="block text-4xl xl:text-6xl text-slate-300">Experience</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl xl:text-2xl text-slate-300 leading-relaxed max-w-2xl"
              >
                Unlock the full potential of your CRM with intelligent automation, 
                personalized insights, and seamless workflow management powered by cutting-edge AI.
              </motion.p>
            </div>

            {/* Enhanced Feature Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <div className="font-bold text-lg">Lightning Fast</div>
                  <div className="text-sm text-slate-400">AI-powered instant responses</div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-400/30 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="font-bold text-lg">Enterprise Secure</div>
                  <div className="text-sm text-slate-400">Bank-level security standards</div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-xl">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <div className="font-bold text-lg">Team Collaboration</div>
                  <div className="text-sm text-slate-400">Seamless multi-user experience</div>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-400/30 transition-all duration-300"
              >
                <div className="p-3 bg-gradient-to-r from-pink-500/30 to-pink-600/30 rounded-xl">
                  <Brain className="w-6 h-6 text-pink-300" />
                </div>
                <div>
                  <div className="font-bold text-lg">Smart Analytics</div>
                  <div className="text-sm text-slate-400">Predictive business insights</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-8 pt-6"
            >
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-slate-300 text-sm">5.0 Rating</span>
              </div>
              <div className="h-6 w-px bg-slate-600" />
              <div className="text-slate-300 text-sm">
                <span className="font-bold text-white">10,000+</span> Active Users
              </div>
              <div className="h-6 w-px bg-slate-600" />
              <div className="text-slate-300 text-sm">
                <span className="font-bold text-white">99.9%</span> Uptime
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
              <CardHeader className="text-center space-y-6 pb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 group"
                >
                  <Rocket className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                </motion.div>
                
                <div className="space-y-3">
                  <CardTitle className="text-3xl font-bold text-white">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg leading-relaxed">
                    Connect your GoHighLevel account to access your personalized AI assistant and unlock unlimited possibilities
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8 pb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="space-y-4"
                >
                  <Button
                    onClick={() => signIn('oauth')}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/40 group relative overflow-hidden"
                    size="lg"
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    
                    <span className="flex items-center justify-center space-x-3 relative z-10">
                      <span className="text-lg">Sign in with GoHighLevel</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </Button>

                  {/* Additional CTA */}
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-3">
                      New to our platform? Start your journey today
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span>Free Trial</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span>No Credit Card</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span>Instant Setup</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center border-t border-white/10 pt-6"
                >
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
                      Privacy Policy
                    </a>
                    <br />
                    <span className="text-slate-500 text-xs mt-2 block">
                      🔒 Your data is encrypted and secure
                    </span>
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