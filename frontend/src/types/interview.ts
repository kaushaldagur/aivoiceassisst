export interface InterviewEvaluation {
  strengths: string[];
  weaknesses: string[];
  correctExplanation: string;
  improvedAnswer: string;
  score: number;
}

export interface InterviewReport {
  id: string;
  topic: string;
  difficulty: string;
  overallScore: number;
  topicWiseScore: Record<string, number>;
  strengths: string[];
  weakAreas: string[];
  recommendations: string[];
  turns: Array<Record<string, unknown>>;
  createdAt: string;
}
