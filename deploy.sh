#!/bin/bash

echo "🚀 Starting deployment preparation..."

# Check if all logo files exist
echo "📁 Checking logo files..."
if [ ! -f "public/logo-small.png" ]; then
    echo "❌ logo-small.png not found!"
    exit 1
fi

if [ ! -f "public/logo-small.webp" ]; then
    echo "❌ logo-small.webp not found!"
    exit 1
fi

if [ ! -f "public/logo.png" ]; then
    echo "❌ logo.png not found!"
    exit 1
fi

echo "✅ All logo files found"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Check if .next directory exists
if [ -d ".next" ]; then
    echo "✅ .next directory created"
else
    echo "❌ .next directory not found"
    exit 1
fi

echo "🎉 Deployment preparation complete!"
echo "📝 Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Fix logo rendering issues'"
echo "2. Push to your repository: git push"
echo "3. Deploy to Vercel: vercel --prod" 