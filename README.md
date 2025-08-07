# 🤟 Sign Language Learning App

> **Learn to spell your name in American Sign Language with real-time AI-powered hand tracking**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge&logo=vercel)](https://spell-your-name.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-View%20Source-black?style=for-the-badge&logo=github)](https://github.com/davidagustin/spell-your-name)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-Next.js%20%7C%20React%20%7C%20AI-blue?style=for-the-badge)](https://spell-your-name.vercel.app/)

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.4.5-black?style=for-the-badge&logo=next.js" alt="Next.js 15.4.5" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3-blue?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MediaPipe-Hands-orange?style=for-the-badge&logo=google" alt="MediaPipe Hands" />
</div>

---

## ✨ Features

### 🎯 **Interactive Learning Experience**
- **Personalized Learning**: Enter your name and learn to spell it letter by letter
- **Real-time Feedback**: Instant AI-powered gesture recognition and feedback
- **Visual Progress Tracking**: See your progress through each letter of your name
- **Hand Stability Detection**: AI monitors hand steadiness for better accuracy

### 🤖 **Advanced AI Technology**
- **Computer Vision**: Real-time hand tracking using MediaPipe Hands API
- **LLM-Powered Analysis**: AI evaluates gesture accuracy with detailed feedback
- **3D Hand Analysis**: Advanced finger position detection using 3D coordinates
- **Smart Recognition**: Learns from your hand movements and provides personalized tips

### 🎨 **Beautiful User Interface**
- **Modern Design**: Clean, responsive interface with smooth animations
- **Visual Guides**: Clear hand positioning guides and target indicators
- **Real-time Feedback**: Color-coded status indicators and progress bars
- **Accessibility**: High contrast design and clear visual cues

### 📚 **Comprehensive Learning Tools**
- **ASL Alphabet Guide**: Complete reference with visual hand sign images
- **Step-by-Step Instructions**: Clear guidance for each letter
- **Practice Mode**: Repeat letters until you master them
- **Achievement System**: Celebrate completion with congratulations screen

---

## 🚀 Live Demo

**Experience the app right now:**

[![Try the App](https://img.shields.io/badge/Try%20the%20App-Live%20Demo-green?style=for-the-badge&logo=vercel)](https://spell-your-name.vercel.app/)

**What you'll experience:**
- ✨ Real-time hand gesture recognition
- 🤖 AI-powered feedback and analysis
- 📱 Responsive design that works on all devices
- 🎯 Interactive learning with visual guides
- 🏆 Progress tracking and completion celebration

---

## 🛠️ Technology Stack

### **Frontend Framework**
- **Next.js 15.4.5** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - CSS transitions and transforms

### **Computer Vision & AI**
- **MediaPipe Hands** - Real-time hand tracking API
- **Custom Gesture Recognition** - Advanced ASL pattern matching
- **LLM Integration** - AI-powered gesture evaluation
- **3D Coordinate Analysis** - Precise finger position detection

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing
- **Vercel** - Deployment and hosting

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser with camera access

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone https://github.com/davidagustin/spell-your-name.git
   cd spell-your-name
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### **Environment Setup**
No environment variables required! The app works out of the box with:
- Camera permissions (granted by user)
- Internet connection (for MediaPipe CDN)

---

## 🎮 How to Use

### **Getting Started**
1. **Enter Your Name**: Type your name in the input field
2. **Grant Camera Access**: Allow camera permissions when prompted
3. **Position Your Hand**: Place your hand in the center circle
4. **Follow the Guide**: Use the ASL alphabet reference for each letter
5. **Practice & Improve**: Get real-time AI feedback and tips

### **Learning Process**
1. **Letter by Letter**: Learn to spell your name one letter at a time
2. **Visual Feedback**: See real-time hand tracking and gesture recognition
3. **AI Analysis**: Receive detailed feedback on your hand positioning
4. **Progress Tracking**: Monitor your progress through each letter
5. **Completion**: Celebrate when you successfully spell your entire name!

### **Tips for Best Results**
- 📹 **Good Lighting**: Ensure your hand is well-lit
- 🖐️ **Clear Background**: Use a plain background for better detection
- 📏 **Proper Distance**: Keep your hand 12-18 inches from the camera
- 🎯 **Stay Steady**: Hold your hand still for better recognition
- 🔄 **Practice**: Repeat letters until you feel confident

---

## 🏗️ Project Structure

```
spell-your-name/
├── app/                          # Next.js App Router
│   ├── components/               # React components
│   │   ├── CameraComponent.tsx   # Main camera & AI logic
│   │   ├── AlphabetGuide.tsx     # ASL alphabet reference
│   │   └── NameInput.tsx         # Name input component
│   ├── services/                 # AI & utility services
│   │   └── llmEvaluation.ts      # LLM gesture evaluation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── public/                       # Static assets
│   └── signs/                    # ASL hand sign images
├── scripts/                      # Build scripts
│   └── create-realistic-signs.js # SVG generation
└── package.json                  # Dependencies & scripts
```

---

## 🔧 Key Components

### **CameraComponent.tsx**
- Real-time hand tracking with MediaPipe
- AI-powered gesture recognition
- Visual feedback and progress indicators
- Hand stability detection

### **AlphabetGuide.tsx**
- Complete ASL alphabet reference
- Visual hand sign images
- Interactive letter highlighting
- Educational descriptions

### **llmEvaluation.ts**
- AI gesture evaluation service
- 3D coordinate analysis
- Detailed feedback generation
- Confidence scoring

---

## 🎯 Features in Detail

### **Real-time Hand Tracking**
- **MediaPipe Integration**: Advanced hand landmark detection
- **21-Point Tracking**: Precise finger and joint positioning
- **3D Analysis**: Depth-aware gesture recognition
- **Stability Monitoring**: Hand movement detection

### **AI-Powered Recognition**
- **Custom Algorithms**: Tailored ASL pattern matching
- **LLM Evaluation**: Intelligent gesture analysis
- **Confidence Scoring**: Accuracy measurement
- **Personalized Feedback**: Specific improvement tips

### **Visual Learning Aids**
- **Hand Positioning Guides**: Clear visual indicators
- **Progress Tracking**: Real-time completion status
- **Color-coded Feedback**: Intuitive status indicators
- **Responsive Design**: Works on all screen sizes

---

## 🚀 Deployment

### **Vercel (Recommended)**
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Automatic Deployment**: Push to main branch for auto-deploy
3. **Custom Domain**: Add your domain (optional)

### **Other Platforms**
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with environment variables
- **AWS Amplify**: Enterprise-grade hosting

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Areas for Contribution**
- 🎨 UI/UX improvements
- 🤖 AI algorithm enhancements
- 📱 Mobile optimization
- 🌐 Internationalization
- 🧪 Testing and bug fixes
- 📚 Documentation improvements

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **MediaPipe Team** - For the amazing hand tracking technology
- **Next.js Team** - For the excellent React framework
- **Tailwind CSS** - For the beautiful utility-first CSS
- **ASL Community** - For preserving and sharing sign language knowledge

---

## 📞 Support & Contact

- **Live Demo**: [https://spell-your-name.vercel.app/](https://spell-your-name.vercel.app/)
- **GitHub**: [https://github.com/davidagustin/spell-your-name](https://github.com/davidagustin/spell-your-name)
- **Issues**: [GitHub Issues](https://github.com/davidagustin/spell-your-name/issues)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/davidagustin">David Agustin</a></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>
