class TalkApp {
    constructor() {
        this.socket = io();
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingTimer = null;
        this.recordingStartTime = null;
        this.currentQuestion = '';
        this.questions = [];
        
        // Real-time transcription
        this.recognition = null;
        this.transcript = '';
        this.fillerWords = [
            'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'basically', 
            'actually', 'literally', 'sort of', 'kind of', 'right', 'okay',
            'well', 'so', 'then', 'now', 'just', 'really', 'very', 'quite'
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
        this.initializeSpeechRecognition();
    }

    initializeElements() {
        // Screens
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            question: document.getElementById('question-screen'),
            recording: document.getElementById('recording-screen'),
            analysis: document.getElementById('analysis-screen'),
            results: document.getElementById('results-screen')
        };

        // Buttons
        this.buttons = {
            start: document.getElementById('start-btn'),
            backToWelcome: document.getElementById('back-to-welcome'),
            backToQuestions: document.getElementById('back-to-questions'),
            startRecording: document.getElementById('start-recording'),
            stopRecording: document.getElementById('stop-recording'),
            retakeAssessment: document.getElementById('retake-assessment'),
            downloadReport: document.getElementById('download-report')
        };

        // Elements
        this.elements = {
            questionGrid: document.getElementById('question-grid'),
            currentQuestion: document.getElementById('current-question'),
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text'),
            timer: document.getElementById('timer'),
            progressFill: document.getElementById('progress-fill'),
            progressSteps: document.querySelectorAll('.progress-steps .step'),
            overallScore: document.getElementById('overall-score'),
            levelBadge: document.getElementById('level-badge'),
            toeflEquivalent: document.getElementById('toefl-equivalent'),
            metricsGrid: document.getElementById('metrics-grid'),
            planContent: document.getElementById('plan-content'),
            loadingOverlay: document.getElementById('loading-overlay'),
            transcriptionDisplay: document.getElementById('transcription-display')
        };
    }

    bindEvents() {
        // Navigation buttons
        this.buttons.start.addEventListener('click', () => this.showScreen('question'));
        this.buttons.backToWelcome.addEventListener('click', () => this.showScreen('welcome'));
        this.buttons.backToQuestions.addEventListener('click', () => this.showScreen('question'));
        this.buttons.retakeAssessment.addEventListener('click', () => this.resetApp());
        this.buttons.downloadReport.addEventListener('click', () => this.downloadReport());

        // Recording buttons
        this.buttons.startRecording.addEventListener('click', () => this.startRecording());
        this.buttons.stopRecording.addEventListener('click', () => this.stopRecording());

        // Socket events
        this.socket.on('recordingStarted', () => this.onRecordingStarted());
        this.socket.on('recordingStopped', () => this.onRecordingStopped());
        this.socket.on('analysisStarted', () => this.onAnalysisStarted());
    }

    async loadQuestions() {
        try {
            const response = await fetch('/api/questions');
            const data = await response.json();
            this.questions = data.questions;
            this.renderQuestions();
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                console.log('Speech recognition started');
            };
            
            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
            
            this.recognition.onend = () => {
                console.log('Speech recognition ended');
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    handleSpeechResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            this.transcript += finalTranscript + ' ';
            console.log('Final transcript added:', finalTranscript);
            this.updateTranscriptionDisplay();
        }
        
        if (interimTranscript) {
            console.log('Interim transcript:', interimTranscript);
            this.updateTranscriptionDisplay(interimTranscript);
        }
    }

    updateTranscriptionDisplay(interimText = '') {
        const fullText = this.transcript + interimText;
        const words = fullText.trim().split(/\s+/);
        
        if (words.length === 0 || (words.length === 1 && words[0] === '')) {
            this.elements.transcriptionDisplay.innerHTML = '<p class="transcription-placeholder">Start speaking to see your transcription here...</p>';
            return;
        }
        
        const highlightedWords = words.map(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
            
            if (this.fillerWords.includes(cleanWord)) {
                return `<span class="transcription-word filler">${word}</span>`;
            }
            
            // Check for potential mispronunciations (simplified detection)
            if (this.detectMispronunciation(word)) {
                return `<span class="transcription-word mispronunciation">${word}</span>`;
            }
            
            return `<span class="transcription-word">${word}</span>`;
        });
        
        this.elements.transcriptionDisplay.innerHTML = `<p class="transcription-text">${highlightedWords.join(' ')}</p>`;
        
        // Auto-scroll to bottom
        this.elements.transcriptionDisplay.scrollTop = this.elements.transcriptionDisplay.scrollHeight;
    }

    detectMispronunciation(word) {
        // Simplified mispronunciation detection
        // In a real implementation, this would use more sophisticated analysis
        const suspiciousPatterns = [
            /[aeiou]{3,}/, // Multiple vowels in a row
            /[bcdfghjklmnpqrstvwxyz]{4,}/, // Too many consonants in a row
            /^[^aeiou]+$/, // No vowels at all
            /[aeiou]{0,1}[bcdfghjklmnpqrstvwxyz]{5,}/ // Too many consonants
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(word.toLowerCase()));
    }

    renderQuestions() {
        this.elements.questionGrid.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question-item';
            questionElement.innerHTML = `
                <div class="question-text">${question}</div>
            `;
            
            questionElement.addEventListener('click', () => {
                this.selectQuestion(question, questionElement);
            });
            
            this.elements.questionGrid.appendChild(questionElement);
        });
    }

    selectQuestion(question, element) {
        // Remove previous selection
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        element.classList.add('selected');
        
        // Store selected question and proceed
        this.currentQuestion = question;
        this.elements.currentQuestion.textContent = question;
        
        setTimeout(() => {
            this.showScreen('recording');
        }, 500);
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        this.screens[screenName].classList.add('active');
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Start speech recognition for real-time transcription
            if (this.recognition) {
                this.transcript = ''; // Reset transcript
                this.recognition.start();
            }
            
            this.updateRecordingUI(true);
            this.startTimer();
            
            this.socket.emit('startRecording');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Unable to access microphone. Please check your permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopTimer();
            
            // Stop speech recognition
            if (this.recognition) {
                this.recognition.stop();
            }
            
            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            this.socket.emit('stopRecording');
        }
    }

    updateRecordingUI(recording) {
        if (recording) {
            this.buttons.startRecording.style.display = 'none';
            this.buttons.stopRecording.style.display = 'inline-flex';
            this.elements.statusIndicator.classList.add('recording');
            this.elements.statusText.textContent = 'Recording...';
        } else {
            this.buttons.startRecording.style.display = 'inline-flex';
            this.buttons.stopRecording.style.display = 'none';
            this.elements.statusIndicator.classList.remove('recording');
            this.elements.statusText.textContent = 'Ready to record';
        }
    }

    startTimer() {
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            this.elements.timer.textContent = 
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    async processRecording() {
        this.showScreen('analysis');
        this.startAnalysisProgress();
        
        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const audioData = await this.blobToBase64(audioBlob);
            
            // Use the actual real-time transcript instead of simulation
            const transcript = this.transcript.trim() || await this.simulateSpeechToText();
            console.log('Using transcript for analysis:', transcript.substring(0, 100) + '...');
            console.log('Transcript length:', transcript.length);
            
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audioData,
                    question: this.currentQuestion,
                    transcript
                })
            });
            
            const results = await response.json();
            this.displayResults(results);
            
        } catch (error) {
            console.error('Error processing recording:', error);
            alert('Error processing your recording. Please try again.');
            this.showScreen('recording');
        }
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async simulateSpeechToText() {
        // Simulate speech-to-text processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return a sample transcript for demonstration (fallback when real-time transcription fails)
        const sampleTranscripts = [
            "Well, um, my typical day starts around 7 AM when I wake up and, you know, I usually have breakfast and then I head to work. I work as a software developer, so I spend most of my day coding and, like, attending meetings. Sometimes I have lunch with colleagues and we discuss various projects and stuff. After work, I usually go to the gym or maybe meet friends for dinner. I try to read a bit before bed, you know, to relax and learn new things.",
            "I'm a student, so my routine is pretty much centered around classes and studying. I wake up early, around 6:30, and I have breakfast while checking my emails and stuff. Then I go to campus for my classes. I'm studying business, so I have courses in marketing, finance, and management. Between classes, I usually study in the library or grab coffee with friends. In the evenings, I might have group projects or study sessions. I try to maintain a good balance between academics and social life.",
            "My day is quite busy because I run my own business. I wake up at 6 AM and immediately check my phone for any urgent messages or emails. Then I have a quick breakfast and start working on the most important tasks of the day. I spend a lot of time in meetings with clients and my team, discussing projects and strategies. I also handle administrative tasks like budgeting and planning. In the afternoon, I might attend networking events or work on new business opportunities. Evenings are usually for family time, though I often check emails before bed.",
            "I work from home as a freelance writer, so my schedule is quite flexible. I usually start my day around 8 AM with a cup of coffee and checking my emails. I spend the morning working on writing assignments and research. Around noon, I take a break for lunch and maybe go for a short walk. In the afternoon, I continue with more writing projects and sometimes have video calls with clients. I try to finish my work by 6 PM so I can spend time with my family. In the evening, I might read or watch some TV to relax.",
            "I'm a teacher, so my day is very structured. I wake up at 6 AM and get ready for school. I arrive at school by 7:30 to prepare for my classes. I teach English to high school students, so my day is filled with different classes and grading papers. During lunch break, I usually eat with other teachers and we discuss lesson plans and student progress. After school, I stay for meetings or help students with extra work. I get home around 4 PM and spend the evening preparing lessons for the next day or relaxing with my family."
        ];
        
        console.log('Using simulated transcript (real-time transcription may not have captured speech)');
        return sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
    }

    startAnalysisProgress() {
        let currentStep = 0;
        const totalSteps = 4;
        
        const progressInterval = setInterval(() => {
            currentStep++;
            const progress = (currentStep / totalSteps) * 100;
            
            this.elements.progressFill.style.width = `${progress}%`;
            
            // Update step indicators
            this.elements.progressSteps.forEach((step, index) => {
                if (index < currentStep) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else if (index === currentStep) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            if (currentStep >= totalSteps) {
                clearInterval(progressInterval);
            }
        }, 1000);
    }

    displayResults(results) {
        // Update overall score
        this.elements.overallScore.textContent = results.toeflScore.overallScore;
        this.elements.levelBadge.textContent = results.toeflScore.level;
        this.elements.toeflEquivalent.textContent = `TOEFL: ${results.toeflScore.toeflEquivalent.score}/30`;

        // Display metrics
        this.displayMetrics(results.speechAnalysis, results.toeflScore);

        // Display improvement plan
        this.displayImprovementPlan(results.improvementPlan);

        this.showScreen('results');
    }

    displayMetrics(speechAnalysis, toeflScore) {
        const metrics = [
            {
                name: 'Fluency',
                icon: 'fas fa-tachometer-alt',
                score: toeflScore.breakdown.fluency,
                details: `Speech rate: ${speechAnalysis.wordsPerMinute} WPM • Fillers: ${speechAnalysis.fillerAnalysis.fillerPercentage}%`
            },
            {
                name: 'Pronunciation',
                icon: 'fas fa-volume-up',
                score: toeflScore.breakdown.pronunciation,
                details: toeflScore.detailedFeedback.pronunciation
            },
            {
                name: 'Vocabulary',
                icon: 'fas fa-book',
                score: toeflScore.breakdown.vocabulary,
                details: `Diversity: ${(speechAnalysis.dictionAnalysis.vocabularyDiversity * 100).toFixed(1)}% • Vague words: ${speechAnalysis.dictionAnalysis.vagueWords}`
            },
            {
                name: 'Grammar',
                icon: 'fas fa-language',
                score: toeflScore.breakdown.grammar,
                details: toeflScore.detailedFeedback.grammar
            },
            {
                name: 'Coherence',
                icon: 'fas fa-project-diagram',
                score: toeflScore.breakdown.coherence,
                details: toeflScore.detailedFeedback.coherence
            }
        ];

        this.elements.metricsGrid.innerHTML = '';

        metrics.forEach(metric => {
            const metricElement = document.createElement('div');
            metricElement.className = 'metric-card';
            metricElement.innerHTML = `
                <div class="metric-header">
                    <i class="${metric.icon}"></i>
                    <span class="metric-name">${metric.name}</span>
                </div>
                <div class="metric-score">${metric.score}/5</div>
                <div class="metric-details">${metric.details}</div>
            `;
            this.elements.metricsGrid.appendChild(metricElement);
        });
    }

    displayImprovementPlan(plan) {
        this.elements.planContent.innerHTML = '';

        // Display priority areas
        plan.priorityAreas.forEach(area => {
            const areaElement = document.createElement('div');
            areaElement.className = 'priority-area';
            areaElement.innerHTML = `
                <div class="priority-header">
                    <span class="priority-badge ${area.priority}">${area.priority}</span>
                    <h4>${this.capitalizeFirst(area.area)}</h4>
                </div>
                <p>${area.reason}</p>
                <div class="exercises-section">
                    <h5>Daily Exercises:</h5>
                    <ul class="exercises-list">
                        ${plan.exercises[area.area]?.daily?.map(exercise => `<li>${exercise}</li>`).join('') || ''}
                    </ul>
                </div>
            `;
            this.elements.planContent.appendChild(areaElement);
        });

        // Display timeline
        const timelineElement = document.createElement('div');
        timelineElement.className = 'timeline-section';
        timelineElement.innerHTML = `
            <h4>Your Learning Journey</h4>
            <p><strong>Current Level:</strong> ${plan.currentLevel}</p>
            <p><strong>Target Level:</strong> ${plan.nextLevel}</p>
            <p><strong>Estimated Time:</strong> ${plan.timeline.transitionTime} months</p>
        `;
        this.elements.planContent.appendChild(timelineElement);

        // Display motivation tips
        const motivationElement = document.createElement('div');
        motivationElement.className = 'motivation-section';
        motivationElement.innerHTML = `
            <h4>Motivation Tips</h4>
            <ul class="exercises-list">
                ${plan.motivationTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
        this.elements.planContent.appendChild(motivationElement);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    resetApp() {
        this.currentQuestion = '';
        this.audioChunks = [];
        this.isRecording = false;
        this.stopTimer();
        this.elements.timer.textContent = '00:00';
        this.updateRecordingUI(false);
        
        // Clear selections
        document.querySelectorAll('.question-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        this.showScreen('welcome');
    }

    downloadReport() {
        // Create a simple text report
        const report = `
Talk - Communication Skills Assessment Report

Overall Score: ${this.elements.overallScore.textContent}/5
Level: ${this.elements.levelBadge.textContent}
TOEFL Equivalent: ${this.elements.toeflEquivalent.textContent}

Assessment Date: ${new Date().toLocaleDateString()}
Question: ${this.currentQuestion}

This report was generated by Talk - your AI-powered communication skills improvement platform.
        `;
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'talk-assessment-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Socket event handlers
    onRecordingStarted() {
        console.log('Recording started');
    }

    onRecordingStopped() {
        console.log('Recording stopped');
    }

    onAnalysisStarted() {
        console.log('Analysis started');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TalkApp();
}); 