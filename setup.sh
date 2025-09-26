#!/bin/bash

echo "🚀 Setting up AI Tagged Notes MCP Server..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "📋 Next steps:"
    echo "   1. The system works without any AI setup (uses rule-based enrichment)"
    echo "   2. To enable AI features, choose one of these options:"
    echo "      • Ollama (Free, Local): Install from https://ollama.ai"
    echo "      • Groq (Free Tier): Get API key from https://console.groq.com/keys"
    echo "      • Hugging Face (Free Tier): Get token from https://huggingface.co/settings/tokens"
    echo "      • OpenAI (Paid): Get API key from https://platform.openai.com/api-keys"
    echo "   3. Edit .env and configure your chosen AI provider"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Build the project
echo "🔨 Building the project..."
npm run build:all

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Development mode:"
echo "     npm run dev          # Backend API"
echo "     npm run dev:frontend # React frontend"
echo ""
echo "   Production mode:"
echo "     npm start            # Serves both API and frontend"
echo ""
echo "🌐 Access the application:"
echo "   Development: http://localhost:3000"
echo "   Production:  http://localhost:8080"
echo ""
echo "📚 For more information, see README.md"