"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Users, 
  Lightbulb, 
  Heart, 
  ArrowLeft,
  Send,
  CheckCircle,
  MessageSquare,
  DollarSign,
  Globe,
  Newspaper,
  Video,
  Brain
} from "lucide-react";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'join' | 'tips' | 'sponsor'>('join');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: 'join'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '', category: activeTab });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    {
      id: 'join',
      title: 'Join Our Team',
      description: 'Interested in student journalism?',
      icon: <Users className="h-5 w-5" />,
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'tips',
      title: 'Submit Tips',
      description: 'Have a story to share?',
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'from-green-400 to-emerald-400',
      bgColor: 'bg-green-500/20'
    },
    {
      id: 'sponsor',
      title: 'Sponsorship',
      description: 'Support student media',
      icon: <Heart className="h-5 w-5" />,
      color: 'from-purple-400 to-violet-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  const getTabConfig = (id: string) => tabs.find(tab => tab.id === id) || tabs[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-tory-400 to-blue-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Get in touch with Triton Tory Media
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              className={`${
                activeTab === tab.id 
                  ? 'bg-tory-500 text-white border-0' 
                  : 'bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-500'
              } transition-all duration-200`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setFormData(prev => ({ ...prev, category: tab.id }));
              }}
            >
              {tab.icon}
              <span className="ml-2">{tab.title}</span>
            </Button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${getTabConfig(activeTab).bgColor}`}>
                  {getTabConfig(activeTab).icon}
                </div>
              </div>
              <CardTitle className="text-xl">
                {getTabConfig(activeTab).title}
              </CardTitle>
              <p className="text-gray-400 text-sm">
                {getTabConfig(activeTab).description}
              </p>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-400 mb-2">Message Sent!</h3>
                  <p className="text-gray-300">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm text-gray-300">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-gray-800/30 border-gray-600 text-white placeholder-gray-400 focus:border-tory-500"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-gray-800/30 border-gray-600 text-white placeholder-gray-400 focus:border-tory-500"
                        placeholder="your.email@ucsd.edu"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm text-gray-300">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="bg-gray-800/30 border-gray-600 text-white placeholder-gray-400 focus:border-tory-500 min-h-[100px]"
                      placeholder={
                        activeTab === 'join' 
                          ? "Tell us about your interest in journalism..."
                          : activeTab === 'tips'
                          ? "Share your story idea or tip..."
                          : "Tell us about your organization..."
                      }
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-tory-500 hover:bg-tory-600 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-tory-400" />
                <span>contact@tritontory.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-tory-400" />
                <span>UC San Diego</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 