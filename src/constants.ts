import { Challenge, ColleagueCheckScenario } from './types';

export const SHARED_CHALLENGES: Challenge[] = [
  {
    id: 'shared-phishing',
    topic: 'Phishing',
    title: 'Placeholder',
    briefing:
      'Phishing is when someone tries to trick you into giving information by pretending to be a trusted source. It can come through many channels, like email, texts, phone calls, or social media.',
    missionText:
      'The criminals are trying to gain access to KONE systems. If they did, they could steal vital information about our company, our employees, or our customers. They could also cause damage to our operations.',
    scenario: '',
    options: [],
  },
  {
    id: 'shared-passwords',
    topic: 'Passwords',
    title: 'Placeholder',
    briefing: 'Strong passwords ensure that no one but you can access your accounts.',
    missionText:
      'The criminals are trying to hack our accounts by targeting weak login details. Stop them by setting up strong password practices.',
    scenario: 'Create a password for your KONE account, then complete the multi-factor authentication step just like a real login.',
    options: [],
  },
  {
    id: 'shared-physical-security',
    topic: 'Physical security',
    title: 'Placeholder',
    briefing: "Our information doesn't live only in the cyberspace. We have important information also inside our walls.",
    missionText: 'The criminals are trying to gain information in KONE facilities. Make sure everything inside is correct.',
    scenario: '',
    options: [],
  },
  {
    id: 'shared-devices',
    topic: 'Devices',
    title: 'Placeholder',
    briefing: 'Our devices contain important information.',
    missionText: 'Criminals are trying to access our devices. Secure the devices to keep our information safe.',
    scenario: '',
    options: [],
  },
];

export const OFFICE_CHALLENGES: Challenge[] = [
  {
    id: 'office-confidentiality',
    topic: 'Confidentiality',
    title: 'Placeholder',
    briefing:
      'Every day we handle documents containing vital information. Much of this information is passed through documents, emails, and internal communication channels.',
    missionText: 'The criminals are trying to get their hands on our information. Stop our documents from ending up in the wrong hands.',
    scenario: '',
    options: [],
  },
  {
    id: 'office-computer-use',
    topic: 'Computer use',
    title: 'Placeholder',
    briefing: 'Most of our work happens with our computers. Protecting them is important.',
    missionText: 'Criminals are trying to gain access to your computer. Protect your computer.',
    scenario: '',
    options: [],
  },
];

export const FACTORY_CHALLENGES: Challenge[] = [];

export const FIELD_CHALLENGES: Challenge[] = [];

export const COLLEAGUE_CHECK_SCENARIOS: ColleagueCheckScenario[] = [
  {
    id: 'shared-passwords-colleague-check',
    challengeId: 'shared-passwords',
    title: 'Check in with a colleague',
    instructions: "Talk with your colleague to see how they're managing cybersecure practices.",
    colleagueName: 'Alex',
    colleagueRole: 'Project coordinator',
    dialogueOptions: ['Show me your passwords', 'How are you making sure your accounts are safe?'],
    colleagueResponse: "I have a great system, I write all my passwords on this post-it so that I don't forget them.",
    question: 'Is this the correct way to act?',
    answers: [
      {
        text: 'Yes',
        isCorrect: false,
        feedback:
          'This is not a safe way to store your passwords. If you notice your colleagues not taking proper care of their accounts, talk to them about it.',
      },
      {
        text: 'No',
        isCorrect: true,
        feedback:
          'This is not a safe way to store your passwords. If you notice your colleagues not taking proper care of their accounts, talk to them about it.',
      },
    ],
  },
  {
    id: 'shared-physical-security-colleague-check',
    challengeId: 'shared-physical-security',
    title: 'Check in with a colleague',
    instructions: 'Review how your colleague is handling a work document and decide whether it is safe.',
    colleagueName: 'Mia',
    colleagueRole: 'Office colleague',
    surface: 'teams',
    dialogueOptions: [],
    colleagueResponse: "Hey, I've got that document for you. I left it on my desk. Should be easy to find :).",
    question: 'Is this the correct way to act?',
    answers: [
      {
        text: 'Yes',
        isCorrect: false,
        feedback:
          'This is not a safe way to handle a work document. Important documents should not be left openly on a desk for others to find.',
      },
      {
        text: 'No',
        isCorrect: true,
        feedback:
          'This is not a safe way to handle a work document. Important documents should not be left openly on a desk for others to find.',
      },
    ],
  },
];
