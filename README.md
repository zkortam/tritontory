# 🎓 Triton Tory Media

**Your Complete Campus Media Source** - A comprehensive media platform for UC San Diego featuring news, videos, research, and legal analysis.

## 🌟 Features

### 📰 **Triton Tory News**
- Campus-focused journalism covering UCSD events, student government, sports, and more
- From local happenings to global impacts, get the full story

### 🎥 **Triton Today**
- Vertical short-form news videos
- 30-60 second updates on the most important campus events

### 🔬 **Science Journal**
- Highlighting groundbreaking research and scientific discoveries
- Coverage across UC San Diego departments and labs

### ⚖️ **Law Review**
- Student-led legal analysis on campus policies
- Broader legal developments and their implications for the university community

## 🚀 Tech Stack

- **Framework**: Next.js 15.4.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **UI Components**: Radix UI + Shadcn/ui
- **Deployment**: Netlify

## 📁 Project Structure

```
triton-tory/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── triton-tory/       # News articles
│   │   ├── triton-science/    # Research articles
│   │   ├── triton-law/        # Legal articles
│   │   └── triton-today/      # Video content
│   ├── components/            # Reusable UI components
│   │   ├── admin/            # Admin-specific components
│   │   ├── common/           # Shared components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Base UI components
│   └── lib/                  # Utility libraries
│       ├── firebase.ts       # Firebase configuration
│       ├── firebase-service.ts # Firebase services
│       ├── auth-context.tsx  # Authentication context
│       └── models.ts         # TypeScript interfaces
├── public/                   # Static assets
│   └── icons/               # SVG icons
├── firestore.rules          # Firestore security rules
└── netlify.toml            # Netlify configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zkortam/tritontory.git
   cd tritontory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

- **Admin Portal**: `/admin`
- **Login**: `/admin/login`
- **Features**:
  - Content management (articles, videos, research, legal)
  - User management
  - Analytics dashboard
  - Settings configuration

## 🎨 Customization

### Colors
The project uses a custom color palette defined in `tailwind.config.ts`:
- **Tory Blue**: Primary brand color
- **Today Purple**: Video content
- **Science Green**: Research content  
- **Law Red**: Legal content

### Icons
Custom SVG icons are located in `public/icons/`:
- `newspaper.svg` - News content
- `video.svg` - Video content
- `microscope.svg` - Research content
- `scale.svg` - Legal content

## 📊 Analytics

The platform includes comprehensive analytics tracking:
- Page views and engagement
- Content performance metrics
- User behavior analysis
- Real-time data visualization

## 🔒 Security

- **Firestore Rules**: Comprehensive security rules for data access
- **Authentication**: Role-based access control (RBAC)
- **Environment Variables**: Secure configuration management
- **Input Validation**: Form validation and sanitization

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Zakaria Kortam** - Co-Founder & Lead Developer
- **Dylan Archer** - Co-Founder & Content Director

## 📞 Contact

- **Email**: contact@tritontory.com
- **Website**: [tritontory.com](https://tritontory.com)
- **GitHub**: [@zkortam](https://github.com/zkortam)

---

**Built with ❤️ for the UC San Diego community** 