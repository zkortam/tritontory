"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";

export default function LogoTestPage() {
  const [logoStatus, setLogoStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({});

  const logoSources = useMemo(() => [
    "/logo-small.png",
    "/logo-small.webp",
    "/logo.png",
    "/logo.svg"
  ], []);

  const testLogo = (src: string) => {
    return new Promise<boolean>((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        setLogoStatus(prev => ({ ...prev, [src]: 'success' }));
        resolve(true);
      };
      img.onerror = () => {
        setLogoStatus(prev => ({ ...prev, [src]: 'error' }));
        resolve(false);
      };
      img.src = src;
    });
  };

  useEffect(() => {
    const runTests = async () => {
      setLogoStatus({});
      
      for (const src of logoSources) {
        setLogoStatus(prev => ({ ...prev, [src]: 'loading' }));
        await testLogo(src);
      }
    };

    runTests();
  }, [logoSources]);

  const getStatusColor = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Logo Loading Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Logo Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Logo Component</h2>
          <div className="p-4 border border-gray-700 rounded-lg">
            <Logo size="lg" />
          </div>
        </div>

        {/* Logo Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Logo File Status</h2>
          <div className="space-y-2">
            {logoSources.map((src) => (
              <div key={src} className="flex items-center space-x-2">
                <span className={getStatusColor(logoStatus[src] || 'loading')}>
                  {getStatusIcon(logoStatus[src] || 'loading')}
                </span>
                <span className="text-sm font-mono">{src}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Image Tests */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Direct Image Tests</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {logoSources.map((src) => (
            <div key={src} className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-mono mb-2">{src}</h3>
              <Image 
                src={src} 
                alt={`Test ${src}`}
                width={200}
                height={80}
                className="w-full h-20 object-contain"
                onLoad={() => console.log(`Direct img loaded: ${src}`)}
                onError={() => console.error(`Direct img failed: ${src}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 