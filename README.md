# Talk - AI-Powered Communication Skills Improvement Platform

Talk is a comprehensive web application designed to help users improve their communication skills through intelligent speech analysis, TOEFL-style assessment, and personalized improvement plans.

## Features

### Core Functionality
- **90-Second Speech Recording**: Users record themselves answering open-ended questions about their daily life
- **Advanced Speech Analysis**: Analyzes filler words, diction, sentence structure, and clarity
- **TOEFL-Style Assessment**: Provides standardized scoring across fluency, pronunciation, vocabulary, grammar, and coherence
- **Personalized Improvement Plans**: Generates customized exercises and resources based on individual needs
- **Progress Tracking**: Shows current level, target level, and estimated timeline for improvement

### Technical Features
- **Real-time Recording**: Live audio capture with visual feedback
- **Speech-to-Text Processing**: Converts speech to text for detailed analysis
- **AI-Powered Analysis**: Uses natural language processing for comprehensive assessment
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with microphone access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdamOwolabi/talk.git
   cd talk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Project Structure

```
talk/
├── public/                 # Frontend assets
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── app.js            # Frontend JavaScript
├── src/
│   └── services/         # Backend services
│       ├── SpeechAnalyzer.js      # Speech analysis logic
│       ├── TOEFLAnalyzer.js       # TOEFL assessment
│       └── ImprovementPlanner.js  # Improvement plan generation
├── uploads/              # Audio file storage
├── node_modules/         # Installed dependencies (auto-generated)
├── .gitignore           # Git ignore rules
├── server.js            # Express server
├── package.json         # Dependencies and scripts
├── package-lock.json    # Locked dependency versions
└── README.md           # This file
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

### Audio Processing
The application supports various audio formats. For production use, consider:
- Implementing proper audio compression
- Adding audio format validation
- Setting up cloud storage for audio files

## How It Works

### 1. Question Selection
Users choose from a curated list of open-ended questions about their daily life, work, hobbies, or goals.

### 2. Speech Recording
- 90-second recording session with real-time visual feedback
- Automatic speech-to-text conversion
- Audio quality monitoring

### 3. Analysis Process
The system analyzes multiple aspects:

**Speech Analysis:**
- Filler word detection and counting
- Vocabulary diversity assessment
- Sentence structure analysis
- Speech rate calculation
- Clarity and precision evaluation

**TOEFL Assessment:**
- Fluency scoring (25% weight)
- Pronunciation evaluation (20% weight)
- Vocabulary assessment (20% weight)
- Grammar analysis (20% weight)
- Coherence scoring (15% weight)

### 4. Improvement Plan Generation
Based on analysis results, the system creates:
- Priority areas for improvement
- Daily, weekly, and monthly exercises
- Recommended resources and tools
- Timeline and milestones
- Motivation tips

## UI/UX Features

### Modern Design
- Clean, minimalist interface
- Smooth animations and transitions
- Responsive design for all devices
- Accessibility considerations

### Interactive Elements
- Real-time recording visualization
- Progress indicators
- Animated score displays
- Interactive improvement plans

## Analysis Metrics

### Speech Rate
- Optimal: 120-180 words per minute
- Too slow: < 100 WPM
- Too fast: > 200 WPM

### Filler Words
- Excellent: < 2% of total words
- Good: 2-5%
- Needs improvement: > 5%

### Vocabulary Diversity
- Measured by unique words ratio
- Target: > 60% diversity
- Considers vague and weak word usage

### Grammar Accuracy
- Subject-verb agreement
- Article usage
- Tense consistency
- Sentence structure

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Interactive functionality
- **Socket.IO**: Real-time communication

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **Natural**: Natural language processing
- **Compromise**: Text analysis

### Audio Processing
- **Web Audio API**: Browser-based audio capture
- **MediaRecorder API**: Audio recording
- **WAV format**: Audio file handling

## Security Considerations

- Audio files are stored locally (consider cloud storage for production)
- No sensitive data is transmitted without encryption
- Input validation on all user inputs
- CORS configuration for API endpoints

## Deployment

### Heroku
```bash
heroku create your-talk-app
git push heroku main
```

### Docker
```bash
docker build -t talk-app .
docker run -p 3000:3000 talk-app
```

### Vercel/Netlify
Configure for Node.js applications with proper build settings.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- TOEFL for assessment criteria inspiration
- Natural language processing community
- Web Audio API documentation
- Modern CSS and JavaScript communities

## Support

For support, email support@talk-app.com or create an issue in the GitHub repository.

---

**Talk** - Empowering better communication through AI. 🎤✨ 