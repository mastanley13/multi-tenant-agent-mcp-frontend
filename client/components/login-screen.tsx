'use client'

import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardElevated, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Zap, Shield, Users, ArrowRight, Sparkles } from 'lucide-react'

export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-subtle">
      {/* Subtle background enhancement */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Marketing Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2"
              >
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-primary font-medium">AI-Powered CRM Assistant</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold leading-tight text-foreground"
              >
                Transform Your
                <span className="text-primary">
                  {" "}GoHighLevel
                </span>
                <br />Experience
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground leading-relaxed"
              >
                Unlock the full potential of your CRM with intelligent automation, 
                personalized insights, and seamless workflow management.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Lightning Fast</div>
                  <div className="text-sm text-muted-foreground">Instant responses</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Secure</div>
                  <div className="text-sm text-muted-foreground">Enterprise-grade</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Users className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Team Ready</div>
                  <div className="text-sm text-muted-foreground">Multi-user support</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <CardElevated className="w-full max-w-md glass">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                
                <CardTitle className="text-2xl font-bold">
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Connect your GoHighLevel account to access your personalized AI assistant
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={() => signIn('oauth')}
                    className="w-full group"
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
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <p className="text-xs text-muted-foreground">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-primary hover:text-primary/80 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:text-primary/80 underline">
                      Privacy Policy
                    </a>
                  </p>
                </motion.div>
              </CardContent>
            </CardElevated>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 