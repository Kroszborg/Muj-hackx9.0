'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import dynamic from 'next/dynamic'

const ModeToggle = dynamic(() => import("./components/mode-toggle").then(mod => mod.ModeToggle), { ssr: false })
const MultiWalletConnect = dynamic(() => import("@/components/ui/multi-wallet-connect").then(mod => mod.MultiWalletConnect), { ssr: false })

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

function AnimatedSection({ children, className, id }: { children: React.ReactNode, className?: string, id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <motion.section
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={fadeIn}
      className={className}
      id={id}
    >
      {children}
    </motion.section>
  )
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.header 
        className="border-b"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Template Project</h1>
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="#projects" className="hover:underline">Projects</Link>
            <Link href="#about" className="hover:underline">About</Link>
            <Link href="#team" className="hover:underline">Team</Link>
            <Link href="#contact" className="hover:underline">Contact Us</Link>
            <MultiWalletConnect />
            <ModeToggle />
          </nav>
          <div className="md:hidden flex items-center">
            <MultiWalletConnect />
            <ModeToggle />
            <button onClick={toggleMenu} className="ml-4 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <nav className="flex flex-col items-center space-y-4 py-4">
              <Link href="#projects" className="hover:underline">Projects</Link>
              <Link href="#about" className="hover:underline">About</Link>
              <Link href="#team" className="hover:underline">Team</Link>
              <Link href="#contact" className="hover:underline">Contact Us</Link>
            </nav>
          </div>
        )}
      </motion.header>

      <main className="container mx-auto px-4 py-8 space-y-16">
        <AnimatedSection id="projects" className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Our Projects</h2>
          <motion.div className="md:grid-cols-2 gap-8" variants={staggerChildren}>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Project 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Description of Project 1
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection id="about" className="space-y-8">
          <h2 className="text-3xl font-bold text-center">About Us</h2>
          <motion.div className="grid md:grid-cols-2 gap-8" variants={staggerChildren}>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Description of your Mission
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Description of your Vision
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection id="team" className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Our Team</h2>
          <motion.div className="grid md:grid-cols-2 gap-8" variants={staggerChildren}>
            <motion.div variants={fadeIn}>
              <Card>
                <CardContent>
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Team Member 1"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-t-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center">Abhiman Panwar</h3>
                  <p className="text-center">Front-end Developer</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardContent>
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Team Member 2"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-t-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center">Shresth Shroff</h3>
                  <p className="text-center">Back-end Developer</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardContent>
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Team Member 3"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-t-lg"
                    /> 
                  </div>
                  <h3 className="text-xl font-semibold text-center">Aditya Jha</h3>
                  <p className="text-center">Lead Researcher</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card>
                <CardContent>
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src="/placeholder.svg?height=192&width=384"
                      alt="Team Member 4"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-t-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center">Aditya Anjana</h3>
                  <p className="text-center">Lead Researcher</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection id="contact" className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Contact Us</h2>
          <motion.div 
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="mailto:contact@vlrgroup.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                <Mail className="mr-2 h-4 w-4" /> Contact Us
              </Button>
            </Link>
          </motion.div>
        </AnimatedSection>
      </main>

      <motion.footer 
        className="border-t mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6 text-center">
          <p>&copy; 2024 VLR Group. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  )
}