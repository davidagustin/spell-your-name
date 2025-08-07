# Sign Language Spell Your Name

An interactive web application that teaches you how to spell your name in American Sign Language (ASL) using computer vision and real-time hand gesture recognition.

## Features

- **Name Input**: Enter your name to start learning
- **Real-time Camera Recognition**: Uses MediaPipe Hands to detect hand gestures
- **Interactive Learning**: Step-by-step guidance through each letter of your name
- **Visual Alphabet Guide**: Complete ASL alphabet with hand gesture images
- **Progress Tracking**: Visual progress indicator showing completed letters
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Enter Your Name**: Type your name in the input field
2. **Camera Setup**: Allow camera access for hand gesture recognition
3. **Learn Each Letter**: The app guides you through each letter of your name
4. **Practice Signs**: Use the visual guide to learn the correct hand position
5. **Get Feedback**: Real-time feedback when you make the correct sign
6. **Track Progress**: See your progress as you complete each letter

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Computer Vision**: MediaPipe Hands API
- **Hand Gesture Recognition**: Custom gesture classification algorithm
- **Images**: SVG-based sign language illustrations

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern web browser with camera access
- Good lighting for hand gesture recognition

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spell-your-name
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Start Learning**: Enter your name and click "Start Learning"
2. **Camera Permission**: Allow camera access when prompted
3. **Follow Instructions**: Look at the current letter and its sign guide
4. **Make the Sign**: Position your hand according to the visual guide
5. **Get Feedback**: The app will detect when you make the correct sign
6. **Continue**: Move to the next letter automatically or manually

## Sign Language Tips

- **Good Lighting**: Ensure your hand is well-lit for better recognition
- **Clear Background**: Use a plain background for better hand detection
- **Steady Hand**: Keep your hand steady and clearly visible to the camera
- **Proper Distance**: Position your hand 12-18 inches from the camera
- **Practice**: Try each sign a few times before attempting recognition

## Alphabet Guide

The app includes a complete ASL alphabet with:
- Visual hand gesture illustrations
- Step-by-step instructions
- Helpful tips for each letter
- Interactive grid view

## Camera Requirements

- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)
- **Camera Access**: Must allow camera permissions
- **HTTPS**: Required for camera access in production
- **Performance**: Works best with good lighting and clear hand visibility

## Development

### Project Structure

```
spell-your-name/
├── app/
│   ├── components/
│   │   ├── AlphabetGuide.tsx    # ASL alphabet display
│   │   ├── CameraComponent.tsx  # Hand gesture recognition
│   │   └── NameInput.tsx        # Name input form
│   ├── page.tsx                 # Main application page
│   └── layout.tsx              # App layout
├── public/
│   └── signs/                  # SVG sign language images
├── scripts/
│   └── generate-signs.js       # SVG generation script
└── package.json
```

### Key Components

- **CameraComponent**: Handles MediaPipe integration and gesture recognition
- **AlphabetGuide**: Displays the ASL alphabet with visual guides
- **NameInput**: Manages user name input and validation

### Customization

You can customize the app by:
- Modifying the gesture recognition algorithm in `CameraComponent.tsx`
- Adding new sign language images in `public/signs/`
- Updating the alphabet guide in `AlphabetGuide.tsx`
- Styling changes using Tailwind CSS classes

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Check browser compatibility
- Try refreshing the page
- Verify HTTPS connection (for production)

### Recognition Issues
- Improve lighting conditions
- Clear background behind your hand
- Keep hand steady and visible
- Position hand at proper distance

### Performance Issues
- Close other camera-using applications
- Use a modern browser
- Ensure good internet connection for MediaPipe loading

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- MediaPipe for hand tracking technology
- American Sign Language community
- Next.js and React teams
- Tailwind CSS for styling

## Support

For issues or questions:
- Check the troubleshooting section
- Review browser compatibility
- Ensure proper setup and permissions
- Contact the development team

---

**Note**: This application is for educational purposes. For formal ASL learning, consider taking classes with certified instructors.
