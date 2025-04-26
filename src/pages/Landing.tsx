
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Gavel, FileText } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-teal-700 to-teal-500 bg-clip-text text-transparent">
            Specter
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Empower your class action journey with privacy-first AI assistance
          </p>
          <Link to="/app">
            <Button className="bg-amber text-white hover:bg-amber-600 px-8 py-6 text-lg rounded-lg">
              Start Your Claim
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Privacy-First</h3>
              <p className="text-muted-foreground">
                Your evidence never leaves your device. Complete privacy, guaranteed.
              </p>
            </div>
            <div className="text-center p-6">
              <Gavel className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-muted-foreground">
                Smart analysis and matching for stronger class actions.
              </p>
            </div>
            <div className="text-center p-6">
              <FileText className="w-12 h-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Court-Ready</h3>
              <p className="text-muted-foreground">
                Generate professional legal documents in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Specter. For informational purposes only. Not legal advice.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
