const natural = require('natural');
const nlp = require('compromise');

class SpeechAnalyzer {
  constructor() {
    this.fillerWords = [
      'um', 'uh', 'er', 'ah', 'like', 'you know', 'i mean', 'basically', 
      'actually', 'literally', 'sort of', 'kind of', 'right', 'okay',
      'well', 'so', 'then', 'now', 'just', 'really', 'very', 'quite'
    ];
    
    this.vagueWords = [
      'thing', 'stuff', 'something', 'anything', 'everything', 'nothing',
      'somewhere', 'anywhere', 'everywhere', 'nowhere', 'somehow', 'anyhow',
      'whatever', 'whenever', 'wherever', 'whoever', 'whichever'
    ];
    
    this.weakWords = [
      'maybe', 'perhaps', 'possibly', 'probably', 'might', 'could', 'would',
      'should', 'seems', 'appears', 'looks like', 'sort of', 'kind of'
    ];
  }

  async analyze(audioPath, transcript) {
    const words = transcript.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    
    // Calculate speech rate (words per minute)
    const duration = await this.getAudioDuration(audioPath);
    const wordsPerMinute = Math.round((totalWords / duration) * 60);
    
    // Analyze filler words
    const fillerAnalysis = this.analyzeFillerWords(transcript);
    
    // Analyze diction and vocabulary
    const dictionAnalysis = this.analyzeDiction(transcript);
    
    // Analyze sentence structure
    const structureAnalysis = this.analyzeSentenceStructure(transcript);
    
    // Analyze clarity and precision
    const clarityAnalysis = this.analyzeClarity(transcript);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      fillerAnalysis,
      dictionAnalysis,
      structureAnalysis,
      clarityAnalysis,
      wordsPerMinute
    });

    return {
      wordsPerMinute,
      duration,
      totalWords,
      fillerAnalysis,
      dictionAnalysis,
      structureAnalysis,
      clarityAnalysis,
      overallScore,
      recommendations: this.generateRecommendations({
        fillerAnalysis,
        dictionAnalysis,
        structureAnalysis,
        clarityAnalysis,
        wordsPerMinute
      })
    };
  }

  async getAudioDuration(audioPath) {
    // Simulate audio duration analysis
    // In a real implementation, you would use a library like ffprobe
    // For now, we'll return a random duration between 60-120 seconds to simulate different recording lengths
    const minDuration = 60; // 1 minute
    const maxDuration = 120; // 2 minutes
    return Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;
  }

  analyzeFillerWords(transcript) {
    const words = transcript.toLowerCase().split(/\s+/);
    const fillerCounts = {};
    let totalFillers = 0;

    this.fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        fillerCounts[filler] = matches.length;
        totalFillers += matches.length;
      }
    });

    const fillerPercentage = (totalFillers / words.length) * 100;

    return {
      totalFillers,
      fillerPercentage: Math.round(fillerPercentage * 100) / 100,
      fillerBreakdown: fillerCounts,
      score: this.scoreFillerWords(fillerPercentage)
    };
  }

  analyzeDiction(transcript) {
    const words = transcript.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const vocabularyDiversity = uniqueWords.size / words.length;
    
    // Count vague words
    let vagueCount = 0;
    this.vagueWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) vagueCount += matches.length;
    });

    // Count weak words
    let weakCount = 0;
    this.weakWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) weakCount += matches.length;
    });

    return {
      vocabularyDiversity: Math.round(vocabularyDiversity * 1000) / 1000,
      vagueWords: vagueCount,
      weakWords: weakCount,
      score: this.scoreDiction(vocabularyDiversity, vagueCount, weakCount)
    };
  }

  analyzeSentenceStructure(transcript) {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, sentence) => {
      return sum + sentence.trim().split(/\s+/).length;
    }, 0) / sentences.length;

    // Analyze sentence variety
    const shortSentences = sentences.filter(s => s.trim().split(/\s+/).length <= 10).length;
    const mediumSentences = sentences.filter(s => {
      const length = s.trim().split(/\s+/).length;
      return length > 10 && length <= 20;
    }).length;
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 20).length;

    return {
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      sentenceVariety: { short: shortSentences, medium: mediumSentences, long: longSentences },
      score: this.scoreSentenceStructure(avgSentenceLength, sentences.length)
    };
  }

  analyzeClarity(transcript) {
    const words = transcript.toLowerCase().split(/\s+/);
    
    // Check for repetition
    const wordFrequency = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const repetitiveWords = Object.entries(wordFrequency)
      .filter(([word, count]) => count > 3 && word.length > 3)
      .map(([word, count]) => ({ word, count }));

    // Check for incomplete thoughts
    const incompleteThoughts = (transcript.match(/but\s|however\s|although\s|though\s/gi) || []).length;

    return {
      repetitiveWords,
      incompleteThoughts,
      score: this.scoreClarity(repetitiveWords.length, incompleteThoughts)
    };
  }

  scoreFillerWords(percentage) {
    if (percentage < 2) return 5;
    if (percentage < 5) return 4;
    if (percentage < 10) return 3;
    if (percentage < 15) return 2;
    return 1;
  }

  scoreDiction(diversity, vagueCount, weakCount) {
    let score = 5;
    
    if (diversity < 0.3) score -= 2;
    else if (diversity < 0.5) score -= 1;
    
    if (vagueCount > 5) score -= 1;
    if (weakCount > 3) score -= 1;
    
    return Math.max(1, score);
  }

  scoreSentenceStructure(avgLength, sentenceCount) {
    let score = 5;
    
    if (avgLength < 8 || avgLength > 25) score -= 1;
    if (sentenceCount < 3) score -= 1;
    
    return Math.max(1, score);
  }

  scoreClarity(repetitiveCount, incompleteCount) {
    let score = 5;
    
    if (repetitiveCount > 2) score -= 1;
    if (incompleteCount > 1) score -= 1;
    
    return Math.max(1, score);
  }

  calculateOverallScore(analysis) {
    const scores = [
      analysis.fillerAnalysis.score,
      analysis.dictionAnalysis.score,
      analysis.structureAnalysis.score,
      analysis.clarityAnalysis.score
    ];
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Adjust for speech rate
    let rateAdjustment = 0;
    if (analysis.wordsPerMinute < 120) rateAdjustment = -0.5;
    else if (analysis.wordsPerMinute > 200) rateAdjustment = -0.5;
    
    return Math.max(1, Math.min(5, Math.round((avgScore + rateAdjustment) * 10) / 10));
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.fillerAnalysis.fillerPercentage > 5) {
      recommendations.push("Reduce filler words like 'um', 'uh', 'like', and 'you know'");
    }
    
    if (analysis.dictionAnalysis.vagueWords > 3) {
      recommendations.push("Use more specific words instead of vague terms like 'thing' or 'stuff'");
    }
    
    if (analysis.dictionAnalysis.weakWords > 2) {
      recommendations.push("Replace weak words like 'maybe' and 'sort of' with more confident language");
    }
    
    if (analysis.structureAnalysis.avgSentenceLength < 10) {
      recommendations.push("Vary sentence length to create more engaging speech patterns");
    }
    
    if (analysis.wordsPerMinute < 120) {
      recommendations.push("Try speaking at a slightly faster pace to maintain listener engagement");
    } else if (analysis.wordsPerMinute > 200) {
      recommendations.push("Slow down your speech rate to improve clarity and comprehension");
    }
    
    return recommendations;
  }
}

module.exports = SpeechAnalyzer; 