
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Gavel, FileText, ArrowRight, Github, Upload, Brain, Users, Download } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
              Class-Action Copilot
            </span>
            <span className="text-4xl block mt-2 text-muted-foreground">
              Justice, On Your Device
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Upload your evidence, find others with the same grievance, and walk away with a court-ready class-action complaint — all without your data ever leaving your computer.
          </p>
          <div className="flex gap-4 justify-center items-center">
            <Link to="/app">
              <Button className="bg-amber text-white hover:bg-amber-600 px-8 py-6 text-lg rounded-lg">
                Get Started — It's Free & Private
              </Button>
            </Link>
            <Button variant="ghost" className="text-lg">
              Watch the 90-Second Demo <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-teal-50/50 py-16">
        <div className="container mx-auto px-4">
          <blockquote className="text-center max-w-3xl mx-auto">
            <p className="text-2xl font-semibold italic text-teal-800 mb-6">
              "If you want to go fast, go alone. If you want to go far, file together."
            </p>
            <p className="text-muted-foreground">
              We're a student-built project from <span className="font-semibold">RiverHacks 2025</span> using webAI's privacy-first platform to put collective legal power in everyone's hands.
            </p>
          </blockquote>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Upload, title: "Drop Your Docs", desc: "Drag any bills, emails, photos or PDFs into the browser." },
              { icon: Brain, title: "Private AI Extraction", desc: "Our on-device AI (no cloud!) OCRs, classifies, and pulls key facts." },
              { icon: Users, title: "Secure Matchmaking", desc: "We share only an anonymized fingerprint to discover people harmed in the same way." },
              { icon: Download, title: "Instant Complaint Packet", desc: "One click generates a ready-to-file PDF bundle and evidence index." }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-center p-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-teal-700" />
                    </div>
                    {i < 3 && <div className="hidden md:block absolute top-8 left-[calc(100%-2rem)] w-[calc(100%-4rem)] h-[2px] bg-teal-100" />}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8 italic">
            All processing stays on your laptop or phone. Zero PII leaves your device.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-teal-50/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Shield className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Privacy-First</h3>
              <p className="text-muted-foreground">
                Your evidence never leaves your device. Complete privacy, guaranteed.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Gavel className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-muted-foreground">
                Smart analysis and matching for stronger class actions.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <FileText className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Court-Ready</h3>
              <p className="text-muted-foreground">
                Generate professional legal documents in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-teal-900 to-teal-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to stand together?</h2>
          <p className="text-xl mb-8 text-teal-100">
            Join the beta today and draft your first complaint in under five minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/app">
              <Button className="bg-amber text-white hover:bg-amber-600 px-8 py-6 text-lg rounded-lg">
                Get Started
              </Button>
            </Link>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Read the Docs
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>Class-Action Copilot © 2025 · Built at RiverHacks · Not legal advice</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-700">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:hello@classactioncopilot.dev" className="hover:text-teal-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
