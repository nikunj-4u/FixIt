#!/bin/bash

# FixIT - Student Complaint Management System Setup Script
# This script sets up the development environment for the FixIT project

echo "🚀 Setting up FixIT - Student Complaint Management System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB v4.4 or higher."
    echo "   Visit: https://docs.mongodb.com/manual/installation/"
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create .env file for backend
echo ""
echo "⚙️  Setting up environment configuration..."
cd ../backend

if [ ! -f .env ]; then
    cat > .env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fixit
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EOL
    echo "✅ Created .env file for backend"
    echo "⚠️  Please update the .env file with your actual configuration values"
else
    echo "✅ .env file already exists"
fi

# Create .env file for frontend
cd ../frontend
if [ ! -f .env ]; then
    cat > .env << EOL
REACT_APP_API_URL=http://localhost:5000/api
EOL
    echo "✅ Created .env file for frontend"
else
    echo "✅ .env file already exists"
fi

# Go back to root directory
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB service:"
echo "   - macOS: brew services start mongodb-community"
echo "   - Ubuntu: sudo systemctl start mongod"
echo "   - Windows: net start MongoDB"
echo ""
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend development server:"
echo "   cd frontend && npm start"
echo ""
echo "4. Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "🔧 Configuration:"
echo "- Backend API: http://localhost:5000"
echo "- Frontend: http://localhost:3000"
echo "- Database: MongoDB (localhost:27017/fixit)"
echo ""
echo "📚 For more information, check the README.md file"
echo ""
echo "Happy coding! 🚀"
