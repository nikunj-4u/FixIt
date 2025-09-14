# FixIT - Student Complaint Management System

A comprehensive web-based platform for managing student complaints in hostels, built with React frontend and Node.js/Express backend.

## 🚀 Features

### For Students
- **User Registration & Authentication**: Secure login system with role-based access
- **Complaint Filing**: Create complaints with detailed descriptions, categories, and priority levels
- **Complaint Tracking**: View status updates and track resolution progress
- **Image Attachments**: Upload images to support complaint descriptions
- **Real-time Updates**: Receive notifications on complaint status changes
- **Profile Management**: Update personal information and view account details

### For Administrators
- **Dashboard Overview**: Comprehensive statistics and analytics
- **Complaint Management**: View, filter, and manage all complaints
- **Assignment System**: Assign complaints to technicians and wardens
- **Status Updates**: Update complaint status and add resolution details
- **User Management**: Manage user accounts and permissions
- **Reporting**: Generate reports and view complaint trends

### System Features
- **Role-based Access Control**: Different interfaces for students, technicians, wardens, and admins
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Communication**: Comments and status updates
- **Category Management**: Organize complaints by type (mess, internet, water, etc.)
- **Priority System**: Urgent, high, medium, and low priority levels
- **Search & Filtering**: Advanced filtering options for efficient complaint management

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Material-UI (MUI)**: Beautiful and responsive UI components
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Recharts**: Data visualization for analytics
- **Context API**: State management

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Express Validator**: Input validation
- **CORS**: Cross-origin resource sharing

## 📁 Project Structure

```
fixIt/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── users.js
│   │   └── categories.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── ComplaintContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Complaints.js
│   │   │   ├── CreateComplaint.js
│   │   │   ├── ComplaintDetails.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminComplaints.js
│   │   │   ├── AdminUsers.js
│   │   │   └── Profile.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fixIt
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fixit
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

5. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

6. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`

7. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Complaints
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Create new complaint
- `PATCH /api/complaints/:id/status` - Update complaint status
- `PATCH /api/complaints/:id/assign` - Assign complaint
- `POST /api/complaints/:id/comments` - Add comment
- `GET /api/complaints/stats/overview` - Get complaint statistics

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/staff` - Get staff members
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/:id/status` - Update user status (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PATCH /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

## 🔐 User Roles

### Student
- Create and manage their own complaints
- View complaint status and updates
- Add comments to their complaints
- Update profile information

### Technician
- View assigned complaints
- Update complaint status
- Add comments and resolution details
- Access to complaint management tools

### Warden
- Full complaint management access
- Assign complaints to technicians
- View all complaints and statistics
- User management capabilities

### Admin
- Complete system access
- User management and role assignment
- System configuration
- Analytics and reporting

## 🎨 UI/UX Features

- **Material Design**: Clean and modern interface following Material Design principles
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Customizable theme options
- **Interactive Components**: Smooth animations and transitions
- **Data Visualization**: Charts and graphs for analytics
- **Real-time Updates**: Live status updates and notifications

## 🔧 Configuration

### Backend Configuration
- Database connection settings in `.env`
- JWT secret and expiration settings
- Email configuration for notifications
- CORS settings for frontend integration

### Frontend Configuration
- API base URL configuration
- Theme customization
- Route protection settings
- State management configuration

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure environment variables
3. Deploy to platforms like Heroku, DigitalOcean, or AWS
4. Set up process management with PM2

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3
3. Configure environment variables for production
4. Set up custom domain and SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common issues

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added admin dashboard and user management
- **v1.2.0** - Enhanced UI/UX and mobile responsiveness
- **v1.3.0** - Added analytics and reporting features

## 📞 Contact

- **Project Lead**: [Your Name]
- **Email**: [your.email@example.com]
- **GitHub**: [your-github-username]

---

**FixIT** - Streamlining hostel complaint management for better student experience.
