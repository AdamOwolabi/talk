class ImprovementPlanner {
  constructor() {
    this.improvementAreas = {
      fluency: {
        exercises: [
          "Practice speaking at a consistent pace using a metronome",
          "Record yourself and identify filler word patterns",
          "Practice tongue twisters to improve articulation",
          "Read aloud for 10 minutes daily to build speaking stamina",
          "Use breathing exercises to control speech rhythm"
        ],
        resources: [
          "TED Talks for listening to natural speech patterns",
          "Podcasts with clear speakers",
          "Speech rate control apps",
          "Breathing and relaxation techniques"
        ]
      },
      pronunciation: {
        exercises: [
          "Practice minimal pairs (ship/sheep, bit/beat)",
          "Record and compare your pronunciation with native speakers",
          "Use pronunciation apps like ELSA or Speechling",
          "Practice stress patterns in multi-syllable words",
          "Work on intonation patterns for questions and statements"
        ],
        resources: [
          "YouTube pronunciation channels",
          "IPA (International Phonetic Alphabet) guides",
          "Pronunciation dictionaries",
          "Speech therapy apps"
        ]
      },
      vocabulary: {
        exercises: [
          "Learn 5-10 new words daily and use them in sentences",
          "Practice synonyms and antonyms",
          "Read diverse materials to encounter new vocabulary",
          "Keep a vocabulary journal with context and usage",
          "Practice describing objects without using common words"
        ],
        resources: [
          "Vocabulary building apps (Quizlet, Memrise)",
          "Academic word lists",
          "Contextual reading materials",
          "Word of the day subscriptions"
        ]
      },
      grammar: {
        exercises: [
          "Practice specific grammar points with exercises",
          "Write sentences using different tenses",
          "Study sentence structure patterns",
          "Practice subject-verb agreement",
          "Work on article usage (a/an/the)"
        ],
        resources: [
          "Grammar practice websites (Grammarly, Purdue OWL)",
          "Grammar workbooks",
          "Online grammar courses",
          "Language exchange partners"
        ]
      },
      coherence: {
        exercises: [
          "Practice organizing thoughts before speaking",
          "Use transition words and phrases",
          "Practice telling stories with clear structure",
          "Work on topic sentences and supporting details",
          "Practice summarizing information clearly"
        ],
        resources: [
          "Public speaking courses",
          "Storytelling workshops",
          "Logic and reasoning exercises",
          "Debate clubs or discussion groups"
        ]
      }
    };

    this.levels = {
      'Beginner': {
        focus: ['basic_pronunciation', 'simple_vocabulary', 'basic_grammar'],
        timeline: '3-6 months',
        goals: [
          'Speak clearly with basic pronunciation',
          'Use simple but correct grammar',
          'Build basic vocabulary (500-1000 words)',
          'Speak in complete sentences'
        ]
      },
      'Lower Intermediate': {
        focus: ['fluency', 'vocabulary_expansion', 'grammar_accuracy'],
        timeline: '6-12 months',
        goals: [
          'Reduce filler words significantly',
          'Expand vocabulary to 2000-3000 words',
          'Improve grammar accuracy',
          'Speak with more confidence'
        ]
      },
      'Intermediate': {
        focus: ['advanced_vocabulary', 'complex_grammar', 'coherence'],
        timeline: '12-18 months',
        goals: [
          'Use advanced vocabulary appropriately',
          'Master complex grammar structures',
          'Organize thoughts logically',
          'Speak naturally and fluently'
        ]
      },
      'Upper Intermediate': {
        focus: ['native_like_fluency', 'academic_vocabulary', 'precise_expression'],
        timeline: '18-24 months',
        goals: [
          'Achieve near-native fluency',
          'Master academic vocabulary',
          'Express ideas precisely and eloquently',
          'Handle complex topics confidently'
        ]
      },
      'Advanced': {
        focus: ['refinement', 'specialized_vocabulary', 'public_speaking'],
        timeline: 'Ongoing',
        goals: [
          'Refine pronunciation to near-native level',
          'Master specialized vocabulary for your field',
          'Excel in public speaking and presentations',
          'Serve as a language model for others'
        ]
      }
    };
  }

  async createPlan(speechAnalysis, toeflScore) {
    const currentLevel = toeflScore.level;
    const nextLevel = this.getNextLevel(currentLevel);
    
    const priorityAreas = this.identifyPriorityAreas(speechAnalysis, toeflScore);
    const exercises = this.generateExercises(priorityAreas);
    const timeline = this.createTimeline(currentLevel, nextLevel);
    const milestones = this.createMilestones(currentLevel, nextLevel);
    const resources = this.recommendResources(priorityAreas);

    return {
      currentLevel,
      nextLevel,
      priorityAreas,
      exercises,
      timeline,
      milestones,
      resources,
      estimatedProgress: this.estimateProgress(speechAnalysis, toeflScore),
      weeklyPlan: this.createWeeklyPlan(priorityAreas),
      motivationTips: this.getMotivationTips(currentLevel)
    };
  }

  identifyPriorityAreas(speechAnalysis, toeflScore) {
    const areas = [];
    
    // Analyze speech analysis results
    if (speechAnalysis.fillerAnalysis.fillerPercentage > 5) {
      areas.push({ area: 'fluency', priority: 'high', reason: 'High filler word usage' });
    }
    
    if (speechAnalysis.dictionAnalysis.vocabularyDiversity < 0.5) {
      areas.push({ area: 'vocabulary', priority: 'high', reason: 'Limited vocabulary diversity' });
    }
    
    if (speechAnalysis.dictionAnalysis.vagueWords > 3) {
      areas.push({ area: 'vocabulary', priority: 'medium', reason: 'Overuse of vague words' });
    }
    
    if (speechAnalysis.clarityAnalysis.repetitiveWords.length > 2) {
      areas.push({ area: 'vocabulary', priority: 'medium', reason: 'Word repetition' });
    }
    
    // Analyze TOEFL scores
    Object.entries(toeflScore.breakdown).forEach(([criterion, score]) => {
      if (score < 3) {
        areas.push({ 
          area: criterion, 
          priority: 'high', 
          reason: `Low ${criterion} score (${score}/5)` 
        });
      } else if (score < 4) {
        areas.push({ 
          area: criterion, 
          priority: 'medium', 
          reason: `Moderate ${criterion} score (${score}/5)` 
        });
      }
    });
    
    // Remove duplicates and sort by priority
    const uniqueAreas = [];
    const seen = new Set();
    
    areas.forEach(area => {
      if (!seen.has(area.area)) {
        seen.add(area.area);
        uniqueAreas.push(area);
      }
    });
    
    return uniqueAreas.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  generateExercises(priorityAreas) {
    const exercises = {};
    
    priorityAreas.forEach(({ area, priority }) => {
      exercises[area] = {
        priority,
        daily: this.improvementAreas[area].exercises.slice(0, 2),
        weekly: this.improvementAreas[area].exercises.slice(2, 4),
        monthly: this.improvementAreas[area].exercises.slice(4)
      };
    });
    
    return exercises;
  }

  createTimeline(currentLevel, nextLevel) {
    const currentLevelInfo = this.levels[currentLevel];
    const nextLevelInfo = this.levels[nextLevel];
    
    return {
      currentLevel: {
        name: currentLevel,
        timeline: currentLevelInfo.timeline,
        goals: currentLevelInfo.goals
      },
      nextLevel: {
        name: nextLevel,
        timeline: nextLevelInfo.timeline,
        goals: nextLevelInfo.goals
      },
      transitionTime: this.calculateTransitionTime(currentLevel, nextLevel)
    };
  }

  createMilestones(currentLevel, nextLevel) {
    const milestones = [];
    const currentLevelIndex = Object.keys(this.levels).indexOf(currentLevel);
    const nextLevelIndex = Object.keys(this.levels).indexOf(nextLevel);
    
    for (let i = currentLevelIndex; i <= nextLevelIndex; i++) {
      const level = Object.keys(this.levels)[i];
      const levelInfo = this.levels[level];
      
      milestones.push({
        level,
        goals: levelInfo.goals,
        estimatedTime: levelInfo.timeline,
        checkpoints: this.createCheckpoints(level)
      });
    }
    
    return milestones;
  }

  createCheckpoints(level) {
    let checkpoints = [];
    
    switch (level) {
      case 'Beginner':
        checkpoints = [
          'Can pronounce basic sounds clearly',
          'Uses simple present tense correctly',
          'Has basic vocabulary of 500+ words',
          'Speaks in complete sentences'
        ];
        break;
      case 'Lower Intermediate':
        checkpoints = [
          'Reduced filler words by 50%',
          'Vocabulary expanded to 2000+ words',
          'Uses past and future tenses',
          'Speaks with more confidence'
        ];
        break;
      case 'Intermediate':
        checkpoints = [
          'Uses complex sentences naturally',
          'Vocabulary of 3000+ words',
          'Good grammar accuracy',
          'Organizes thoughts logically'
        ];
        break;
      case 'Upper Intermediate':
        checkpoints = [
          'Near-native fluency',
          'Academic vocabulary mastery',
          'Precise expression',
          'Handles complex topics'
        ];
        break;
      case 'Advanced':
        checkpoints = [
          'Native-like pronunciation',
          'Specialized vocabulary',
          'Excellent public speaking',
          'Can teach others'
        ];
        break;
    }
    
    return checkpoints;
  }

  recommendResources(priorityAreas) {
    const resources = {};
    
    priorityAreas.forEach(({ area }) => {
      resources[area] = this.improvementAreas[area].resources;
    });
    
    return resources;
  }

  estimateProgress(speechAnalysis, toeflScore) {
    const currentScore = toeflScore.overallScore;
    const targetScore = this.getTargetScore(toeflScore.level);
    
    const progressPercentage = (currentScore / targetScore) * 100;
    
    return {
      currentScore,
      targetScore,
      progressPercentage: Math.round(progressPercentage),
      timeToTarget: this.estimateTimeToTarget(currentScore, targetScore),
      confidence: this.calculateConfidence(speechAnalysis, toeflScore)
    };
  }

  createWeeklyPlan(priorityAreas) {
    const weeklyPlan = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };
    
    priorityAreas.forEach(({ area, priority }) => {
      const exercises = this.improvementAreas[area].exercises;
      
      if (priority === 'high') {
        weeklyPlan.monday.push(exercises[0]);
        weeklyPlan.wednesday.push(exercises[1]);
        weeklyPlan.friday.push(exercises[2]);
      } else if (priority === 'medium') {
        weeklyPlan.tuesday.push(exercises[0]);
        weeklyPlan.thursday.push(exercises[1]);
      }
    });
    
    return weeklyPlan;
  }

  getMotivationTips(level) {
    const tips = {
      'Beginner': [
        "Every expert was once a beginner. Focus on progress, not perfection.",
        "Practice for just 10 minutes daily - consistency beats intensity.",
        "Celebrate small wins like pronouncing a new word correctly.",
        "Remember that making mistakes is how we learn and improve."
      ],
      'Lower Intermediate': [
        "You're building a strong foundation. Keep pushing through challenges.",
        "Your vocabulary is growing - notice how many more words you know now.",
        "Fluency comes with practice. Trust the process.",
        "Compare yourself to who you were yesterday, not to others."
      ],
      'Intermediate': [
        "You're becoming more confident. Let that confidence show in your speech.",
        "Complex grammar is within your reach. Break it down into smaller parts.",
        "Your communication skills are opening new opportunities.",
        "You're developing your unique voice in English."
      ],
      'Upper Intermediate': [
        "You're approaching advanced levels. Your hard work is paying off.",
        "Precision in expression sets you apart. Focus on the details.",
        "You can handle complex topics. Trust your abilities.",
        "You're becoming a role model for other learners."
      ],
      'Advanced': [
        "You're refining excellence. Every detail matters now.",
        "Your skills can help others. Consider mentoring or teaching.",
        "You're mastering the nuances that make speech truly natural.",
        "You've achieved what many aspire to. Keep pushing your boundaries."
      ]
    };
    
    return tips[level] || tips['Intermediate'];
  }

  getNextLevel(currentLevel) {
    const levels = Object.keys(this.levels);
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  getTargetScore(level) {
    const targetScores = {
      'Beginner': 1.5,
      'Lower Intermediate': 2.5,
      'Intermediate': 3.5,
      'Upper Intermediate': 4.5,
      'Advanced': 5.0
    };
    
    return targetScores[level] || 3.5;
  }

  calculateTransitionTime(currentLevel, nextLevel) {
    const timeEstimates = {
      'Beginner': 6,
      'Lower Intermediate': 12,
      'Intermediate': 18,
      'Upper Intermediate': 24,
      'Advanced': 36
    };
    
    const currentTime = timeEstimates[currentLevel] || 12;
    const nextTime = timeEstimates[nextLevel] || 18;
    
    return Math.round((nextTime - currentTime) / 2);
  }

  estimateTimeToTarget(currentScore, targetScore) {
    const scoreDifference = targetScore - currentScore;
    const monthsPerPoint = 3; // Average time to improve by 1 point
    
    return Math.round(scoreDifference * monthsPerPoint);
  }

  calculateConfidence(speechAnalysis, toeflScore) {
    // Calculate confidence based on consistency of scores
    const scores = Object.values(toeflScore.breakdown);
    const variance = this.calculateVariance(scores);
    
    if (variance < 0.5) return 'high';
    if (variance < 1.0) return 'medium';
    return 'low';
  }

  calculateVariance(scores) {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDifferences = scores.map(score => Math.pow(score - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / scores.length;
  }
}

module.exports = ImprovementPlanner; 