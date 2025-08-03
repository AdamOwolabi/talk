const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const SpeechAnalyzer = require('./src/services/SpeechAnalyzer');
const TOEFLAnalyzer = require('./src/services/TOEFLAnalyzer');
const ImprovementPlanner = require('./src/services/ImprovementPlanner');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize services
const speechAnalyzer = new SpeechAnalyzer();
const toeflAnalyzer = new TOEFLAnalyzer();
const improvementPlanner = new ImprovementPlanner();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/questions', (req, res) => {
  const questions = [
    "Tell me about your typical day from morning to evening.",
    "What does your work or study routine look like?",
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
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('startRecording', () => {
    socket.emit('recordingStarted');
  });
  
  socket.on('stopRecording', (data) => {
    socket.emit('recordingStopped');
  });
  
  socket.on('analyzing', () => {
    socket.emit('analysisStarted');
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Talk server running on port ${PORT}`);
}); 