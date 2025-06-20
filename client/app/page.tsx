'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  MessageSquare, 
  Zap, 
  BarChart3, 
  Users, 
  Smartphone, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Target,
  Globe,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const { data: session } = useSession()

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Intelligent Conversations",
      description: "AI-powered chat that understands context and provides meaningful responses to your GoHighLevel queries."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Get instant answers and automate workflows with our optimized AI engine built for speed."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Gain insights into your CRM performance with AI-driven analytics and recommendations."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Lead Management",
      description: "Automatically qualify, score, and nurture leads with intelligent automation."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Multi-Channel Support",
      description: "Seamlessly integrate across SMS, email, social media, and more."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Targeting",
      description: "AI-powered audience segmentation and personalized messaging for better conversions."
    }
  ]

  const benefits = [
    "Increase conversion rates by up to 40%",
    "Reduce response time from hours to seconds",
    "Automate 80% of routine customer interactions",
    "Scale your operations without hiring more staff",
    "24/7 intelligent customer support",
    "Seamless GoHighLevel integration"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-20" />
      
      {/* Navigation */}
      <nav className="relative z-50 glass-card m-4 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Bot className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">GHL AI Assistant</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {session ? (
              <Link href="/chat">
                <Button className="btn-gradient-primary">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button className="btn-gradient-primary">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-40 px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-purple-200 text-sm font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                GoHighLevel
              </span>
              {' '}Experience
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Supercharge your CRM with AI-powered automation, intelligent lead management, 
              and 24/7 customer support that grows your business while you sleep.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            {session ? (
              <Link href="/chat">
                <Button size="lg" className="btn-gradient-primary text-lg px-8 py-4">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg" className="btn-gradient-primary text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
            )}
            
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 glass border-white/20 text-white hover:bg-white/10">
              <Globe className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300 text-sm ml-4">GHL AI Assistant</span>
                </div>
                <div className="bg-slate-800/50 rounded p-4 text-left">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">You</span>
                    </div>
                    <div className="bg-blue-500/20 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">Show me today's lead conversion rates</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 flex-1">
                      <p className="text-white text-sm mb-2">📊 Today's conversion rate is 24.5% (↑ 8.2% from yesterday)</p>
                      <p className="text-slate-300 text-xs">Top performing campaign: "Summer Sale" with 31% conversion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-40 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Modern CRM
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to automate, optimize, and scale your GoHighLevel operations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-6 hover:shadow-colored transition-all duration-300"
              >
                <div className="text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-40 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose Our{' '}
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Assistant?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Join thousands of businesses that have transformed their operations with our intelligent automation platform.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-slate-200">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8">
                <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">40%</div>
                      <div className="text-sm text-slate-300">Conversion Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">80%</div>
                      <div className="text-sm text-slate-300">Tasks Automated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">24/7</div>
                      <div className="text-sm text-slate-300">AI Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">5x</div>
                      <div className="text-sm text-slate-300">Faster Response</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-70 float"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-xl opacity-70 float-delayed"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-40 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-purple-300" />
              <span className="text-purple-200 text-sm font-medium">Secure & Reliable</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful businesses using our AI assistant to automate their GoHighLevel operations and boost conversions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/chat">
                  <Button size="lg" className="btn-gradient-primary text-lg px-8 py-4">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signin">
                  <Button size="lg" className="btn-gradient-primary text-lg px-8 py-4">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
              )}
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 glass border-white/20 text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
            
            <p className="text-sm text-slate-400 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-40 px-4 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-semibold text-white">GHL AI Assistant</span>
          </div>
          <p className="text-slate-400 mb-4">
            Transforming GoHighLevel experiences with intelligent automation
          </p>
          <p className="text-sm text-slate-500">
            © 2024 GHL AI Assistant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 