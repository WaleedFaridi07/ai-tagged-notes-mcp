#!/bin/bash

echo "🚀 Setting up AI Tagged Notes MCP Server..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "📋 Next steps:"
    echo "   1. The system works immediately with Direct Llama (free, local AI)"
    echo "   2. To use other AI providers, edit .env and choose one:"
    echo "      • Direct Llama (Default): AI_PROVIDER=llama (zero setup)"
    echo "      • Groq (Fast): Get API key from https://console.groq.com/keys"
    echo "      • OpenAI (Premium): Get API key from https://platform.openai.com/api-keys"
    echo "      • Ollama (Advanced): Install from https://ollama.ai"
    echo "   3. No additional configuration needed for Direct Llama!"
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
echo "   Web UI: http://localhost:8080"
echo "   API:    http://localhost:8080/api"
echo "   Health: http://localhost:8080/api/health"
echo ""
echo "📚 For more information, see README.md"