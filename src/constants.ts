import { Challenge, ColleagueCheckScenario } from './types';

export const SHARED_CHALLENGES: Challenge[] = [
  {
    id: 'shared-phishing',
    topic: 'Phishing',
    title: 'Placeholder',
    briefing: 'Phishing is when someone tries to trick you into giving information by pretending to be a trusted source. It can come through many channels, like email, texts, phone calls, or social media.',
    missionText: 'The criminals are trying to gain access to KONE systems. If they did, they could steal vital information about our company, our employees, or our customers. They could also cause damage to our operations.',
    scenario: '',
    options: []
  },
  {
    id: 'shared-passwords',
    topic: 'Passwords',
    title: 'Placeholder',
    briefing: 'Strong passwords ensure that no one but you can access your accounts.',
    missionText: 'The criminals are trying to hack our accounts by targeting weak login details. Stop them by setting up strong password practices.',
    scenario: 'Create a password for your KONE account, then complete the multi-factor authentication step just like a real login.',
    options: []
  },
  {
    id: 'shared-physical-security',
    topic: 'Physical security',
    title: 'Placeholder',
    briefing: 'Our information doesn’t live only in the cyberspace. We have important information also inside our walls.',
    missionText: 'The criminals are trying to gain information in KONE facilities. Make sure everything inside is correct.',
    scenario: 'You need to step away from your workstation for a 5-minute break. What should you do?',
    options: [
      { text: "Leave it as it is; you'll only be gone for a moment.", isCorrect: false, feedback: 'Even a few minutes is enough for unauthorized access. Always secure your workstation before stepping away.' },
      { text: 'Lock the workstation or log out before leaving.', isCorrect: true, feedback: 'Correct. Physical security is part of cybersecurity, and securing your device protects company information.' }
    ]
  },
  {
    id: 'shared-devices',
    topic: 'Devices',
    title: 'Placeholder',
    briefing: 'Our work devices carry important company information wherever they go. Keeping them secure helps protect KONE even outside the office.',
    missionText: 'The criminals are looking for weak points through lost or exposed devices. Act quickly to protect the device and its data.',
    scenario: 'You realize your work device is missing after a visit. It has sensitive company information on it.',
    options: [
      { text: 'Wait until tomorrow to see if it turns up.', isCorrect: false, feedback: 'Every minute counts. A missing device should be reported immediately so protective actions can be taken.' },
      { text: 'Report it immediately to IT so they can protect the device and its data.', isCorrect: true, feedback: 'Correct. Rapid reporting helps IT secure the device and reduce the risk of data exposure.' }
    ]
  }
];

export const OFFICE_CHALLENGES: Challenge[] = [
  {
    id: 'office-confidentiality',
    topic: 'Confidentiality',
    title: 'Placeholder',
    briefing: 'Every day we handle documents containing vital information. Much of this information is passed through documents, emails, and internal communication channels.',
    missionText: 'The criminals are trying to get their hands on our information. Stop our documents from ending up in the wrong hands.',
    scenario: '',
    options: []
  },
  {
    id: 'office-computer-use',
    topic: 'Computer use',
    title: 'Placeholder',
    briefing: 'The software and systems we use every day can either protect KONE or expose it. Safe computer use starts with careful choices.',
    missionText: 'The criminals are looking for a way into our systems through unsafe software and risky actions. Use only trusted tools and keep the environment secure.',
    scenario: 'You found a useful free app online that asks for administrator permissions to install on your work computer. What do you do?',
    options: [
      { text: 'Install it because it looks useful and is free.', isCorrect: false, feedback: 'Unapproved software can introduce malware or other security risks. Only use company-approved software.' },
      { text: 'Check with IT or use only approved software for your work device.', isCorrect: true, feedback: 'Correct. Safe computer use means only using software that has been approved for company use.' }
    ]
  }
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
    dialogueOptions: [
      'Show me your passwords',
      'How are you making sure your accounts are safe?',
    ],
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
];
