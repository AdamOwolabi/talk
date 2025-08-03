class TOEFLAnalyzer {
  constructor() {
    this.toeflCriteria = {
      fluency: {
        weight: 0.25,
        factors: ['speechRate', 'pauses', 'smoothness']
      },
      pronunciation: {
        weight: 0.20,
        factors: ['clarity', 'intonation', 'stress']
      },
      vocabulary: {
        weight: 0.20,
        factors: ['diversity', 'appropriateness', 'precision']
      },
      grammar: {
        weight: 0.20,
        factors: ['accuracy', 'complexity', 'consistency']
      },
      coherence: {
        weight: 0.15,
        factors: ['organization', 'logicalFlow', 'completeness']
      }
    };
  }

  async assess(transcript, speechAnalysis) {
    const fluencyScore = this.assessFluency(speechAnalysis);
    const pronunciationScore = this.assessPronunciation(speechAnalysis);
    const vocabularyScore = this.assessVocabulary(speechAnalysis);
    const grammarScore = this.assessGrammar(transcript);
    const coherenceScore = this.assessCoherence(transcript);

    const overallScore = this.calculateTOEFLScore({
      fluency: fluencyScore,
      pronunciation: pronunciationScore,
      vocabulary: vocabularyScore,
      grammar: grammarScore,
      coherence: coherenceScore
    });

    const level = this.determineLevel(overallScore);
    const detailedFeedback = this.generateDetailedFeedback({
      fluency: fluencyScore,
      pronunciation: pronunciationScore,
      vocabulary: vocabularyScore,
      grammar: grammarScore,
      coherence: coherenceScore
    });

    // Add debugging information
    console.log('TOEFL Assessment Debug Info:');
    console.log('Transcript length:', transcript.length);
    console.log('Speech analysis:', {
      wordsPerMinute: speechAnalysis.wordsPerMinute,
      fillerPercentage: speechAnalysis.fillerAnalysis.fillerPercentage,
      vocabularyDiversity: speechAnalysis.dictionAnalysis.vocabularyDiversity
    });
    console.log('Individual scores:', {
      fluency: fluencyScore,
      pronunciation: pronunciationScore,
      vocabulary: vocabularyScore,
      grammar: grammarScore,
      coherence: coherenceScore
    });
    console.log('Overall score:', overallScore);

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      level,
      breakdown: {
        fluency: fluencyScore,
        pronunciation: pronunciationScore,
        vocabulary: vocabularyScore,
        grammar: grammarScore,
        coherence: coherenceScore
      },
      detailedFeedback,
      toeflEquivalent: this.getTOEFLEquivalent(overallScore)
    };
  }

  assessFluency(speechAnalysis) {
    let score = 5;
    
    // Speech rate assessment
    if (speechAnalysis.wordsPerMinute < 100) score -= 1;
    else if (speechAnalysis.wordsPerMinute > 180) score -= 0.5;
    
    // Filler words impact
    if (speechAnalysis.fillerAnalysis.fillerPercentage > 8) score -= 1;
    else if (speechAnalysis.fillerAnalysis.fillerPercentage > 5) score -= 0.5;
    
    // Smoothness based on sentence structure
    if (speechAnalysis.structureAnalysis.avgSentenceLength < 8) score -= 0.5;
    
    return Math.max(1, Math.min(5, score));
  }

  assessPronunciation(speechAnalysis) {
    let score = 5;
    
    // This would typically use audio analysis
    // For now, we'll base it on speech clarity indicators
    
    // Clarity based on repetitive words and incomplete thoughts
    if (speechAnalysis.clarityAnalysis.repetitiveWords.length > 3) score -= 1;
    if (speechAnalysis.clarityAnalysis.incompleteThoughts > 2) score -= 1;
    
    // Speech rate impact on pronunciation
    if (speechAnalysis.wordsPerMinute > 200) score -= 0.5;
    
    return Math.max(1, Math.min(5, score));
  }

  assessVocabulary(speechAnalysis) {
    let score = 5;
    
    // Vocabulary diversity
    if (speechAnalysis.dictionAnalysis.vocabularyDiversity < 0.4) score -= 1;
    else if (speechAnalysis.dictionAnalysis.vocabularyDiversity < 0.6) score -= 0.5;
    
    // Vague words penalty
    if (speechAnalysis.dictionAnalysis.vagueWords > 4) score -= 1;
    else if (speechAnalysis.dictionAnalysis.vagueWords > 2) score -= 0.5;
    
    // Weak words penalty
    if (speechAnalysis.dictionAnalysis.weakWords > 3) score -= 0.5;
    
    return Math.max(1, Math.min(5, score));
  }

  assessGrammar(transcript) {
    let score = 5;
    
    // Basic grammar checks
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check for basic subject-verb agreement patterns
    const subjectVerbErrors = this.countSubjectVerbErrors(transcript);
    if (subjectVerbErrors > 2) score -= 1;
    else if (subjectVerbErrors > 1) score -= 0.5;
    
    // Check for article usage
    const articleErrors = this.countArticleErrors(transcript);
    if (articleErrors > 3) score -= 0.5;
    
    // Check for tense consistency
    const tenseErrors = this.countTenseErrors(transcript);
    if (tenseErrors > 2) score -= 0.5;
    
    return Math.max(1, Math.min(5, score));
  }

  assessCoherence(transcript) {
    let score = 5;
    
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check for logical connectors
    const connectors = (transcript.match(/\b(and|but|or|however|therefore|because|although|while|since|as)\b/gi) || []).length;
    if (connectors < sentences.length * 0.3) score -= 0.5;
    
    // Check for topic consistency
    const topicShifts = this.countTopicShifts(transcript);
    if (topicShifts > 2) score -= 1;
    
    // Check for completeness
    const incompleteSentences = sentences.filter(s => 
      s.trim().endsWith('but') || 
      s.trim().endsWith('however') || 
      s.trim().endsWith('although')
    ).length;
    
    if (incompleteSentences > 1) score -= 0.5;
    
    return Math.max(1, Math.min(5, score));
  }

  countSubjectVerbErrors(transcript) {
    // Simplified subject-verb agreement check
    const errors = (transcript.match(/\b(he|she|it)\s+(are|were|have)\b/gi) || []).length;
    return errors;
  }

  countArticleErrors(transcript) {
    // Simplified article usage check
    const errors = (transcript.match(/\b(a\s+[aeiou]|an\s+[^aeiou])\b/gi) || []).length;
    return errors;
  }

  countTenseErrors(transcript) {
    // Simplified tense consistency check
    const presentTense = (transcript.match(/\b(am|is|are|do|does)\b/gi) || []).length;
    const pastTense = (transcript.match(/\b(was|were|did|had)\b/gi) || []).length;
    
    // If both present and past tense are used frequently, it might indicate inconsistency
    if (presentTense > 3 && pastTense > 3) return 1;
    return 0;
  }

  countTopicShifts(transcript) {
    // Count abrupt topic changes
    const topicShifters = (transcript.match(/\b(anyway|by the way|speaking of|on another note)\b/gi) || []).length;
    return topicShifters;
  }

  calculateTOEFLScore(scores) {
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(this.toeflCriteria).forEach(([criterion, config]) => {
      totalScore += scores[criterion] * config.weight;
      totalWeight += config.weight;
    });
    
    return totalScore / totalWeight;
  }

  determineLevel(score) {
    if (score >= 4.5) return 'Advanced';
    if (score >= 3.5) return 'Upper Intermediate';
    if (score >= 2.5) return 'Intermediate';
    if (score >= 1.5) return 'Lower Intermediate';
    return 'Beginner';
  }

  getTOEFLEquivalent(score) {
    // Convert to TOEFL iBT Speaking section equivalent (0-30)
    const toeflScore = Math.round((score / 5) * 30);
    
    if (toeflScore >= 27) return { score: toeflScore, level: 'Excellent' };
    if (toeflScore >= 23) return { score: toeflScore, level: 'Good' };
    if (toeflScore >= 18) return { score: toeflScore, level: 'Fair' };
    if (toeflScore >= 13) return { score: toeflScore, level: 'Limited' };
    return { score: toeflScore, level: 'Weak' };
  }

  generateDetailedFeedback(scores) {
    const feedback = {};
    
    Object.entries(scores).forEach(([criterion, score]) => {
      feedback[criterion] = this.getCriterionFeedback(criterion, score);
    });
    
    return feedback;
  }

  getCriterionFeedback(criterion, score) {
    const feedbacks = {
      fluency: {
        5: "Excellent fluency with natural speech flow and appropriate pacing.",
        4: "Good fluency with minor interruptions and generally smooth delivery.",
        3: "Fair fluency with some hesitations and uneven pacing.",
        2: "Limited fluency with frequent pauses and choppy delivery.",
        1: "Poor fluency with excessive hesitations and very slow speech."
      },
      pronunciation: {
        5: "Clear pronunciation with excellent intonation and stress patterns.",
        4: "Good pronunciation with minor clarity issues.",
        3: "Fair pronunciation with some unclear words and basic intonation.",
        2: "Limited pronunciation with many unclear words.",
        1: "Poor pronunciation with significant clarity problems."
      },
      vocabulary: {
        5: "Rich vocabulary with precise word choice and appropriate usage.",
        4: "Good vocabulary with some variety and generally appropriate usage.",
        3: "Fair vocabulary with basic word choice and some inappropriate usage.",
        2: "Limited vocabulary with repetitive word choice.",
        1: "Poor vocabulary with very basic and often inappropriate word choice."
      },
      grammar: {
        5: "Excellent grammar with complex structures and high accuracy.",
        4: "Good grammar with minor errors and some complex structures.",
        3: "Fair grammar with noticeable errors but generally understandable.",
        2: "Limited grammar with frequent errors affecting comprehension.",
        1: "Poor grammar with many errors making speech difficult to understand."
      },
      coherence: {
        5: "Excellent organization with logical flow and complete thoughts.",
        4: "Good organization with clear structure and mostly complete thoughts.",
        3: "Fair organization with some logical connections and some incomplete thoughts.",
        2: "Limited organization with unclear structure and many incomplete thoughts.",
        1: "Poor organization with no clear structure and mostly incomplete thoughts."
      }
    };
    
    return feedbacks[criterion][Math.round(score)] || feedbacks[criterion][3];
  }
}

module.exports = TOEFLAnalyzer; 