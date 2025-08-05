const path = require('path');
const { createServer } = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Import services
const SpeechAnalyzer = require('../src/services/SpeechAnalyzer');
const TOEFLAnalyzer = require('../src/services/TOEFLAnalyzer');
const ImprovementPlanner = require('../src/services/ImprovementPlanner');

const app = express();
const server = createServer(app);

// Initialize services
const speechAnalyzer = new SpeechAnalyzer();
const toeflAnalyzer = new TOEFLAnalyzer();
const improvementPlanner = new ImprovementPlanner();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Routes
app.get('/api/questions', (req, res) => {
  const questions = [
    "Tell me about your typical day and daily routine.",
    "Describe your work or studies and what you enjoy about them.",
    "What are your hobbies and how do you spend your free time?",
    "Tell me about your hometown or the place where you live.",
    "Describe a memorable experience or trip you've had.",
    "What are your future plans and aspirations?",
    "Tell me about your family and friends.",
    "Describe your favorite book, movie, or TV show.",
    "What's something you've learned recently?",
    "Tell me about a challenge you've overcome.",
    "Describe your ideal vacation or weekend.",
    "What's your opinion on technology in daily life?",
    "Tell me about a skill you'd like to develop.",
    "Describe your hobbies and interests.",
    "What are your goals for the next few years?",
    "Tell me about a recent challenge you faced and how you handled it.",
    "What's your favorite way to spend your free time?",
    "Describe your family and living situation.",
    "What motivates you in life?"
  ];
  res.json({ questions });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { audioData, question, transcript } = req.body;
    const sessionId = uuidv4();
    
    // Save audio file
    const audioPath = path.join(uploadsDir, `${sessionId}.wav`);
    fs.writeFileSync(audioPath, Buffer.from(audioData, 'base64'));
    
    // Analyze speech
    const speechAnalysis = await speechAnalyzer.analyze(audioPath, transcript);
    
    // TOEFL assessment
    const toeflScore = await toeflAnalyzer.assess(transcript, speechAnalysis);
    
    // Generate improvement plan
    const improvementPlan = await improvementPlanner.createPlan(speechAnalysis, toeflScore);
    
    res.json({
      sessionId,
      speechAnalysis,
      toeflScore,
      improvementPlan
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze recording' });
  }
});

module.exports = app;
