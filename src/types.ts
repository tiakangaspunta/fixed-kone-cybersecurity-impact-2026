export type Role = 'office' | 'factory' | 'field' | null;

export interface Challenge {
  id: string;
  title: string;
  topic: string;
  briefing?: string;
  missionText?: string;
  scenario: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface Module {
  id: string;
  title: string;
  challenges: Challenge[];
  isLocked: boolean;
  isCompleted: boolean;
}

export interface ColleagueCheckScenario {
  id: string;
  challengeId: string;
  title: string;
  instructions: string;
  colleagueName: string;
  colleagueRole: string;
  dialogueOptions: string[];
  colleagueResponse: string;
  question: string;
  answers: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export type AppState =
  | 'intro'
  | 'villain-intro'
  | 'mission-intro'
  | 'role-selection'
  | 'dashboard'
  | 'challenge'
  | 'colleague-check'
  | 'victory';
