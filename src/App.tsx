/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Briefcase,
  Factory,
  Smartphone,
  ChevronRight,
  AlertTriangle,
  Trophy,
  ArrowLeft,
  Globe,
  FolderLock,
  HardDrive,
} from 'lucide-react';
import { Role, Challenge, AppState, ColleagueCheckScenario } from './types';
import {
  SHARED_CHALLENGES,
  OFFICE_CHALLENGES,
  FACTORY_CHALLENGES,
  FIELD_CHALLENGES,
  COLLEAGUE_CHECK_SCENARIOS,
} from './constants';
import koneLogo from './assets/kone-logo.svg';
import philippeDelormePhoto from './assets/philippe delorme ceo.jpg';

const CONFIDENTIALITY_LABELS = [
  { id: 'Public', accent: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Internal', accent: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'Confidential', accent: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'Secret', accent: 'bg-slate-900 text-white border-slate-900' },
] as const;

const CONFIDENTIALITY_TARGETS = [
  { id: 'website', correctLabel: 'Public', title: 'Cybersecurity in KONE products and services website', surface: 'website' },
  { id: 'instructions', correctLabel: 'Internal', title: 'Document classification instructions', surface: 'document' },
  { id: 'email', correctLabel: 'Confidential', title: 'Email', surface: 'email' },
  { id: 'rnd-results', correctLabel: 'Secret', title: 'R&D testing results', surface: 'report' },
] as const;

const CONFIDENTIALITY_CHANNELS = [
  { id: 'onedrive', label: 'OneDrive', correctBucket: 'approved' },
  { id: 'email', label: 'email', correctBucket: 'approved' },
  { id: 'teams', label: 'Teams', correctBucket: 'approved' },
  { id: 'sharepoint', label: 'SharePoint', correctBucket: 'approved' },
  { id: 'computer', label: 'My computer', correctBucket: 'not-approved' },
  { id: 'personal-email', label: 'My personal email', correctBucket: 'not-approved' },
] as const;

type ConfidentialityLabelId = (typeof CONFIDENTIALITY_LABELS)[number]['id'];
type ConfidentialityTargetId = (typeof CONFIDENTIALITY_TARGETS)[number]['id'];
type ConfidentialityChannelId = (typeof CONFIDENTIALITY_CHANNELS)[number]['id'];
type ConfidentialityBucketId = 'approved' | 'not-approved';

const createEmptyLabelAssignments = (): Record<ConfidentialityTargetId, ConfidentialityLabelId | null> => ({
  website: null,
  instructions: null,
  email: null,
  'rnd-results': null,
});

const createEmptyChannelAssignments = (): Record<ConfidentialityChannelId, ConfidentialityBucketId | null> => ({
  onedrive: null,
  email: null,
  teams: null,
  sharepoint: null,
  computer: null,
  'personal-email': null,
});

type MessageClassification = 'legitimate' | 'fake';

type PhishingScenario = {
  id: string;
  title: string;
  surface: 'email' | 'sms' | 'linkedin';
  expectedClassification: MessageClassification;
  promptLabel: string;
  clueTitle: string;
  clueInstruction: string;
  classificationError: string;
  clues: { id: string; label: string }[];
};
const PHISHING_PROMPT_LABEL = 'Is this legitimate or fake?';
const PHISHING_SCENARIOS: PhishingScenario[] = [
  {
    id: 'email-fake',
    title: 'Email check',
    surface: 'email',
    expectedClassification: 'fake',
    promptLabel: PHISHING_PROMPT_LABEL,
    clueTitle: 'Spot the warning signs',
    clueInstruction: 'There are 4 warning signs in this email. Click all 4 warning signs you spot.',
    classificationError:
      'This email is fake. Urgency, a suspicious sender, a strange link, and an unusual signature are warning signs.',
    clues: [
      { id: 'sender', label: 'Suspicious sender address' },
      { id: 'subject', label: 'Urgent subject line' },
      { id: 'link', label: 'Unsafe verification link' },
      { id: 'signature', label: 'Unusual signature' },
    ],
  },
  {
    id: 'sms-ceo',
    title: 'Text message check',
    surface: 'sms',
    expectedClassification: 'fake',
    promptLabel: PHISHING_PROMPT_LABEL,
    clueTitle: 'Spot the warning signs',
    clueInstruction: 'There are 4 warning signs in this text message. Click all 4 warning signs you spot.',
    classificationError:
      'This text message is fake. It uses impersonation, an odd request, and social engineering to try to get your account.',
    clues: [
      { id: 'sender', label: 'Unusual sender' },
      { id: 'request', label: 'Odd request' },
      { id: 'pressure', label: 'Social engineering' },
      { id: 'signature', label: 'Badly written signature' },
    ],
  },
  {
    id: 'email-legitimate',
    title: 'Email check',
    surface: 'email',
    expectedClassification: 'legitimate',
    promptLabel: PHISHING_PROMPT_LABEL,
    clueTitle: 'Spot the trustworthy signs',
    clueInstruction: 'There are 4 signs that show this email is legitimate. Click all 4 signs you spot.',
    classificationError:
      'This email is legitimate. The KONE address, normal meeting request, clear signature, and complete footer all support that.',
    clues: [
      { id: 'sender', label: 'KONE email address' },
      { id: 'request', label: 'Normal meeting request' },
      { id: 'signature', label: 'Professional signature' },
      { id: 'footer', label: 'Complete company details' },
    ],
  },
  {
    id: 'linkedin-fake',
    title: 'LinkedIn message check',
    surface: 'linkedin',
    expectedClassification: 'fake',
    promptLabel: PHISHING_PROMPT_LABEL,
    clueTitle: 'Spot the warning signs',
    clueInstruction: 'There are 4 warning signs in this LinkedIn message. Click all 4 warning signs you spot.',
    classificationError:
      'This LinkedIn message is fake. It mixes urgency, impersonation, and an external sign-in request.',
    clues: [
      { id: 'channel', label: 'Unusual outreach channel' },
      { id: 'urgency', label: 'Urgency' },
      { id: 'signin', label: 'Sign-in request' },
      { id: 'domain', label: 'Suspicious domain' },
    ],
  },
];

const IntegrityHeader = ({ level, max }: { level: number; max: number }) => {
  const percentage = Math.round((level / max) * 100);

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <div className="text-[10px] tracking-widest text-black/60 font-mono font-bold">Protection level</div>
        <div className="text-sm font-mono font-black text-brand-blue">{percentage}%</div>
      </div>
      <div className="w-24 h-2 bg-black/10 rounded-full overflow-hidden border border-black/15">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full bg-brand-blue shadow-[0_0_8px_rgba(20,80,245,0.2)]"
        />
      </div>
    </div>
  );
};

const ConfidentialitySimulator = ({
  challenge,
  step,
  onSetStep,
  onAnswer,
  onClearFeedback,
  feedback,
  currentLevel,
  maxLevel,
  onContinue,
  resetKey,
}: {
  challenge: Challenge;
  step: 'intro' | 'mission' | 'activity';
  onSetStep: (step: 'intro' | 'mission' | 'activity') => void;
  onAnswer: (isCorrect: boolean, feedback: string) => void;
  onClearFeedback: () => void;
  feedback: { text: string; isCorrect: boolean } | null;
  currentLevel: number;
  maxLevel: number;
  onContinue: () => void;
  resetKey: string;
}) => {
  const [activityStep, setActivityStep] = useState<'labels' | 'channels'>('labels');
  const [labelAssignments, setLabelAssignments] = useState(createEmptyLabelAssignments);
  const [channelAssignments, setChannelAssignments] = useState(createEmptyChannelAssignments);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setActivityStep('labels');
    setLabelAssignments(createEmptyLabelAssignments());
    setChannelAssignments(createEmptyChannelAssignments());
    setDraggingId(null);
  }, [resetKey]);

  const percentage = Math.round((currentLevel / maxLevel) * 100);

  const findLabelMeta = (labelId: ConfidentialityLabelId | null) =>
    CONFIDENTIALITY_LABELS.find((label) => label.id === labelId) ?? null;

  const placeLabel = (labelId: ConfidentialityLabelId, targetId: ConfidentialityTargetId) => {
    setLabelAssignments((prev) => {
      const next = { ...prev };
      (Object.keys(next) as ConfidentialityTargetId[]).forEach((key) => {
        if (next[key] === labelId) {
          next[key] = null;
        }
      });
      next[targetId] = labelId;
      return next;
    });
    onClearFeedback();
  };

  const returnLabelToBank = (labelId: ConfidentialityLabelId) => {
    setLabelAssignments((prev) => {
      const next = { ...prev };
      (Object.keys(next) as ConfidentialityTargetId[]).forEach((key) => {
        if (next[key] === labelId) {
          next[key] = null;
        }
      });
      return next;
    });
    onClearFeedback();
  };

  const placeChannel = (channelId: ConfidentialityChannelId, bucketId: ConfidentialityBucketId) => {
    setChannelAssignments((prev) => ({ ...prev, [channelId]: bucketId }));
    onClearFeedback();
  };

  const returnChannelToBank = (channelId: ConfidentialityChannelId) => {
    setChannelAssignments((prev) => ({ ...prev, [channelId]: null }));
    onClearFeedback();
  };

  const handleLabelSubmit = () => {
    const allPlaced = Object.values(labelAssignments).every(Boolean);

    if (!allPlaced) {
      onAnswer(false, 'Drag all four sensitivity labels into place before you continue.');
      return;
    }

    const isCorrect = CONFIDENTIALITY_TARGETS.every((target) => labelAssignments[target.id] === target.correctLabel);
    if (!isCorrect) {
      onAnswer(false, 'Not quite. Review the KONE sensitivity labels and try placing them again.');
      return;
    }

    setActivityStep('channels');
    onClearFeedback();
  };

  const handleChannelSubmit = () => {
    const allPlaced = Object.values(channelAssignments).every(Boolean);

    if (!allPlaced) {
      onAnswer(false, 'Sort all communication and storage options before checking your answer.');
      return;
    }

    const isCorrect = CONFIDENTIALITY_CHANNELS.every((item) => channelAssignments[item.id] === item.correctBucket);
    if (!isCorrect) {
      onAnswer(false, 'Some options are still in the wrong place. Use only approved channels and storage locations.');
      return;
    }

    onAnswer(
      true,
      "That's right! You stopped important information from ending up in the criminals' hands. Our protection level has increased.",
    );
  };

  const resetActiveExercise = () => {
    if (activityStep === 'labels') {
      setLabelAssignments(createEmptyLabelAssignments());
    } else {
      setChannelAssignments(createEmptyChannelAssignments());
    }
    setDraggingId(null);
    onClearFeedback();
  };

  const handleFeedbackAction = () => {
    if (feedback?.isCorrect) {
      onContinue();
      return;
    }

    resetActiveExercise();
  };

  const renderLabelChip = (labelId: ConfidentialityLabelId) => {
    const labelMeta = findLabelMeta(labelId);
    if (!labelMeta) return null;

    return (
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/confidentiality-label', labelId);
          setDraggingId(labelId);
        }}
        onDragEnd={() => setDraggingId(null)}
        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold shadow-sm cursor-grab active:cursor-grabbing ${
          labelMeta.accent
        } ${draggingId === labelId ? 'opacity-60' : ''}`}
      >
        {labelId}
      </div>
    );
  };

  const renderChannelChip = (channelId: ConfidentialityChannelId) => {
    const channel = CONFIDENTIALITY_CHANNELS.find((item) => item.id === channelId);
    if (!channel) return null;

    return (
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/confidentiality-channel', channelId);
          setDraggingId(channelId);
        }}
        onDragEnd={() => setDraggingId(null)}
        className={`inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-black shadow-sm cursor-grab active:cursor-grabbing ${
          draggingId === channelId ? 'opacity-60' : ''
        }`}
      >
        {channel.label}
      </div>
    );
  };

  const allowDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const availableLabels = CONFIDENTIALITY_LABELS.filter(
    (label) => !Object.values(labelAssignments).includes(label.id),
  );
  const unassignedChannels = CONFIDENTIALITY_CHANNELS.filter((item) => channelAssignments[item.id] === null);

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">CONFIDENTIALITY MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Confidentiality briefing</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('mission')}
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'mission') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">CONFIDENTIALITY MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Confidentiality briefing</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold"
              >
                Got it
              </button>
            </div>

            <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
              <h3 className="text-sm xl:text-base font-bold text-black">Your mission</h3>
              <p className="body-copy text-black/75">{challenge.missionText}</p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('activity')}
                className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/10"
              >
                Prepare defenses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (feedback?.isCorrect) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">CONFIDENTIALITY MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Mission complete</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-6">
            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-5 space-y-4 text-brand-blue">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <p className="font-medium">{feedback.text}</p>
              </div>
            </div>

            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-black">Protection level</p>
                <p className="text-xs font-mono text-brand-blue">{percentage}%</p>
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-black/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="h-full bg-brand-blue"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleFeedbackAction}
                className="px-6 py-2 xl:px-7 xl:py-3 rounded-lg bg-brand-blue hover:opacity-90 text-white text-sm xl:text-base font-bold transition-colors"
              >
                Continue mission
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (feedback?.isCorrect) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">PASSWORD MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Mission complete</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-6">
            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-5 space-y-4 text-brand-blue">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <p className="font-medium whitespace-pre-line">{feedback.text}</p>
              </div>
            </div>

            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-black">Protection level</p>
                <p className="text-xs font-mono text-brand-blue">{Math.round((100 * currentLevel) / maxLevel)}%</p>
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-black/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((100 * currentLevel) / maxLevel)}%` }}
                  className="h-full bg-brand-blue"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleFeedbackAction}
                className="px-6 py-2 xl:px-7 xl:py-3 rounded-lg bg-brand-blue hover:opacity-90 text-white text-sm xl:text-base font-bold transition-colors"
              >
                Continue mission
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activityStep === 'labels' ? (
        <div className="space-y-4 xl:space-y-6">
          <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm xl:text-base font-bold text-black">Sensitivity labels</p>
              <p className="body-copy text-black/75">
                Classifying your work with the KONE sensitivity labels informs people on how confidential it is.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CONFIDENTIALITY_LABELS.map((label) => (
                <span key={label.id} className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${label.accent}`}>
                  {label.id}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 p-5 xl:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg xl:text-xl font-bold text-black">Part 1: Place the correct label</h3>
                <p className="text-sm xl:text-base text-black/70">
                  Drag each label to the correct location. Documents use the upper-right corner and email uses the Sensitivity menu.
                </p>
              </div>
              <div
                onDragOver={allowDrop}
                onDrop={(event) => {
                  event.preventDefault();
                  const labelId = event.dataTransfer.getData('text/confidentiality-label') as ConfidentialityLabelId;
                  if (!labelId) return;
                  returnLabelToBank(labelId);
                  setDraggingId(null);
                }}
                className="min-w-[180px] rounded-xl border border-dashed border-black/20 bg-black/[0.03] px-4 py-3 text-sm text-black/60"
              >
                Drag here to remove a label
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-4">
              <p className="text-xs font-mono tracking-widest text-black/50 mb-3">LABEL BANK</p>
              <div className="flex flex-wrap gap-3 min-h-11">
                {availableLabels.length > 0 ? (
                  availableLabels.map((label) => <div key={label.id}>{renderLabelChip(label.id)}</div>)
                ) : (
                  <p className="text-sm text-black/50">All labels are currently placed.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-5">
              {CONFIDENTIALITY_TARGETS.map((target) => {
                const assignedLabel = labelAssignments[target.id];
                const assignedMeta = findLabelMeta(assignedLabel);
                const dropZone = (
                  <div
                    onDragOver={allowDrop}
                    onDrop={(event) => {
                      event.preventDefault();
                      const labelId = event.dataTransfer.getData('text/confidentiality-label') as ConfidentialityLabelId;
                      if (!labelId) return;
                      placeLabel(labelId, target.id);
                      setDraggingId(null);
                    }}
                    className={`flex min-h-11 min-w-[120px] items-center justify-center rounded-full border border-dashed px-3 py-2 text-xs font-bold ${
                      assignedLabel ? 'border-transparent bg-transparent p-0' : 'border-black/20 bg-white/85 text-black/45'
                    }`}
                  >
                    {assignedLabel && assignedMeta ? renderLabelChip(assignedLabel) : 'Drop label here'}
                  </div>
                );

                if (target.surface === 'website') {
                  return (
                    <div key={target.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
                      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
                            <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
                          </div>
                          <span className="text-[10px] font-mono tracking-widest text-white/65">kone.com</span>
                        </div>
                        {dropZone}
                      </div>
                      <div className="p-5 bg-gradient-to-br from-sky-50 via-white to-slate-100 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 font-bold text-brand-blue">
                            <Globe className="w-4 h-4" />
                            KONE
                          </div>
                          <div className="flex gap-4 text-black/55 text-xs font-semibold uppercase tracking-wide">
                            <span>Products</span>
                            <span>Services</span>
                            <span>Support</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm">
                          <p className="text-xs font-mono tracking-[0.2em] text-brand-blue">CYBERSECURITY</p>
                          <h4 className="mt-2 text-xl font-black text-black">Cybersecurity in KONE products and services</h4>
                          <p className="mt-3 text-sm text-black/70">
                            Learn how KONE builds secure digital experiences and supports customer trust.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (target.surface === 'email') {
                  return (
                    <div key={target.id} className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
                      <div className="px-4 py-3 border-b border-black/10 bg-slate-50 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-mono tracking-widest text-black/45">EMAIL</p>
                          <h4 className="text-lg font-bold text-black">{target.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2">
                          <span className="text-xs font-bold text-black/55 uppercase tracking-wide">Sensitivity</span>
                          {dropZone}
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="rounded-xl border border-black/10 bg-white">
                          <div className="px-4 py-3 border-b border-black/10 space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="w-12 text-black/45 font-mono text-xs">To</span>
                              <span className="text-black">product.team@kone.com</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-12 text-black/45 font-mono text-xs">Cc</span>
                              <span className="text-black/50">Optional</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-12 text-black/45 font-mono text-xs">Subject</span>
                              <span className="text-black">Customer elevator issue follow-up</span>
                            </div>
                          </div>
                          <div className="p-4 text-sm text-black/70 space-y-3 leading-relaxed">
                            <p>Hello team,</p>
                            <p>Please review the latest customer case details before tomorrow&apos;s call.</p>
                            <p>Best regards,</p>
                            <p>Project coordinator</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const isReport = target.surface === 'report';
                return (
                  <div
                    key={target.id}
                    className={`rounded-2xl border border-[#d7d0c2] bg-[#f7f1e4] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] ${
                      isReport ? 'rotate-0' : '-rotate-[0.6deg]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-mono tracking-[0.18em] text-black/45">{isReport ? 'LAB REPORT' : 'PRINTED DOCUMENT'}</p>
                        <h4 className="mt-2 text-xl font-black text-black">{target.title}</h4>
                      </div>
                      {dropZone}
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-black/70">
                      {isReport ? (
                        <>
                          <div className="rounded-xl border border-black/10 bg-white/70 p-3 flex items-center justify-between">
                            <span className="font-semibold text-black">Brake module stress test</span>
                            <span className="text-xs font-mono text-black/45">RUN 28A</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg bg-white/70 p-3">
                              <p className="text-xs font-mono text-black/45">STATUS</p>
                              <p className="mt-1 font-bold text-black">Pending review</p>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3">
                              <p className="text-xs font-mono text-black/45">SITE</p>
                              <p className="mt-1 font-bold text-black">Espoo lab</p>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3">
                              <p className="text-xs font-mono text-black/45">RESULT</p>
                              <p className="mt-1 font-bold text-black">Prototype data</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-2 rounded-full bg-black/10" />
                          <div className="h-2 rounded-full bg-black/10 w-11/12" />
                          <div className="h-2 rounded-full bg-black/10 w-10/12" />
                          <div className="mt-5 rounded-xl border border-black/10 bg-white/70 p-4">
                            <p className="font-semibold text-black">Document handling checklist</p>
                            <p className="mt-2">
                              Add the correct sensitivity label before sharing information internally.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLabelSubmit}
              className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
            >
              Check labels
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 xl:space-y-6">
          <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
            <h3 className="text-sm xl:text-base font-bold text-black">Part 2: Approved places to work with information</h3>
            <p className="body-copy text-black/75">
              Sort each option into the correct area. Keep KONE information in approved communication channels and storage places.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 p-5 xl:p-6 space-y-5">
            <div
              onDragOver={allowDrop}
              onDrop={(event) => {
                event.preventDefault();
                const channelId = event.dataTransfer.getData('text/confidentiality-channel') as ConfidentialityChannelId;
                if (!channelId) return;
                returnChannelToBank(channelId);
                setDraggingId(null);
              }}
              className="rounded-2xl border border-dashed border-black/20 bg-black/[0.02] p-4"
            >
              <p className="text-xs font-mono tracking-widest text-black/50 mb-3">UNSORTED OPTIONS</p>
              <div className="flex flex-wrap gap-3 min-h-11">
                {unassignedChannels.length > 0 ? (
                  unassignedChannels.map((item) => <div key={item.id}>{renderChannelChip(item.id)}</div>)
                ) : (
                  <p className="text-sm text-black/50">All options have been placed. Drag here to remove one.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'approved' as const,
                  title: 'Approved for KONE information',
                  description: 'Use these tools to communicate or store work information.',
                  icon: FolderLock,
                  tone: 'border-emerald-200 bg-emerald-50/70',
                },
                {
                  id: 'not-approved' as const,
                  title: 'Not approved',
                  description: 'Do not use these places for work information.',
                  icon: HardDrive,
                  tone: 'border-rose-200 bg-rose-50/70',
                },
              ].map((bucket) => {
                const bucketItems = CONFIDENTIALITY_CHANNELS.filter((item) => channelAssignments[item.id] === bucket.id);

                return (
                  <div
                    key={bucket.id}
                    onDragOver={allowDrop}
                    onDrop={(event) => {
                      event.preventDefault();
                      const channelId = event.dataTransfer.getData('text/confidentiality-channel') as ConfidentialityChannelId;
                      if (!channelId) return;
                      placeChannel(channelId, bucket.id);
                      setDraggingId(null);
                    }}
                    className={`rounded-2xl border p-5 space-y-4 ${bucket.tone}`}
                  >
                    <div className="flex items-start gap-3">
                      <bucket.icon className="w-5 h-5 mt-0.5 text-black/70" />
                      <div>
                        <h4 className="text-lg font-bold text-black">{bucket.title}</h4>
                        <p className="text-sm text-black/70">{bucket.description}</p>
                      </div>
                    </div>
                    <div className="min-h-32 rounded-xl border border-dashed border-black/15 bg-white/70 p-4">
                      <div className="flex flex-wrap gap-3">
                        {bucketItems.length > 0 ? (
                          bucketItems.map((item) => <div key={item.id}>{renderChannelChip(item.id)}</div>)
                        ) : (
                          <p className="text-sm text-black/45">Drop items here</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleChannelSubmit}
              className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
            >
              Check handling choices
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border ${
              feedback.isCorrect ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-black border-black text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <ShieldCheck className="w-6 h-6 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 shrink-0" />
              )}
              <div className="space-y-4">
                <p className="font-medium">{feedback.text}</p>
                {feedback.isCorrect && (
                  <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-black">Protection level</p>
                      <p className="text-xs font-mono text-brand-blue">{percentage}%</p>
                    </div>
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-black/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-brand-blue"
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleFeedbackAction}
                  className={`px-6 py-2 xl:px-7 xl:py-3 rounded-lg text-sm xl:text-base font-bold transition-colors ${
                    feedback.isCorrect
                      ? 'bg-brand-blue hover:opacity-90 text-white'
                      : 'bg-white hover:bg-brand-blue/5 text-black border border-black/15'
                  }`}
                >
                  {feedback.isCorrect ? 'Continue mission' : 'Try again'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PhishingSimulator = ({
  challenge,
  step,
  onSetStep,
  onAnswer,
  onClearFeedback,
  feedback,
  currentLevel,
  maxLevel,
  onContinue,
}: {
  challenge: Challenge;
  step: 'intro' | 'mission' | 'activity';
  onSetStep: (step: 'intro' | 'mission' | 'activity') => void;
  onAnswer: (isCorrect: boolean, feedback: string) => void;
  onClearFeedback: () => void;
  feedback: { text: string; isCorrect: boolean } | null;
  currentLevel: number;
  maxLevel: number;
  onContinue: () => void;
}) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [classification, setClassification] = useState<MessageClassification | null>(null);
  const [selectedClues, setSelectedClues] = useState<string[]>([]);
  const [missionComplete, setMissionComplete] = useState(false);


  useEffect(() => {
    setScenarioIndex(0);
    setClassification(null);
    setSelectedClues([]);
    setMissionComplete(false);
  }, [challenge.id]);

  const scenario = PHISHING_SCENARIOS[scenarioIndex];
  const clueTarget = scenario.clues.length;
  const isClueSelected = (clueId: string) => selectedClues.includes(clueId);
  const percentage = Math.round((currentLevel / maxLevel) * 100);


  const resetScenario = () => {
    onSetStep('activity');
    setClassification(null);
    setSelectedClues([]);
    onClearFeedback();
  };

  const moveToNextScenario = () => {
    setScenarioIndex((prev) => prev + 1);
    setClassification(null);
    setSelectedClues([]);
    onClearFeedback();
  };

  const handleFeedbackAction = () => {
    if (feedback?.isCorrect || missionComplete) {
      onContinue();
      return;
    }

    resetScenario();
  };

  const handleClassification = (choice: MessageClassification) => {
    if (feedback) return;
    setClassification(choice);
    if (choice !== scenario.expectedClassification) {
      onAnswer(false, scenario.classificationError);
    } else {
      onClearFeedback();
    }
  };

  const toggleClue = (clueId: string) => {
    if (feedback || classification !== scenario.expectedClassification) return;
    setSelectedClues((prev) => (prev.includes(clueId) ? prev.filter((id) => id !== clueId) : [...prev, clueId]));
  };

  const submitClues = () => {
    if (classification !== scenario.expectedClassification) return;

    const isCorrect = scenario.clues.every((clue) => selectedClues.includes(clue.id));
    if (!isCorrect) {
      onAnswer(
        false,
        scenario.expectedClassification === 'fake'
          ? 'You missed one or more warning signs. Try again.'
          : 'You missed one or more signs that show this email is legitimate. Try again.',
      );
      return;
    }

    if (scenarioIndex === PHISHING_SCENARIOS.length - 1) {
      setMissionComplete(true);
      onAnswer(
        true,
        "That's right! Always check these details to make sure messages are legitimate.\n\nYou defended KONE systems with strong cybersecurity practices. Our protection level has increased.",
      );
      return;
    }

    moveToNextScenario();
  };

  const interactiveLineClass = (clueId: string) =>
    `rounded-md px-2 py-1 transition-colors ${
      classification !== scenario.expectedClassification
        ? 'cursor-default'
        : isClueSelected(clueId)
          ? 'bg-brand-blue/10 text-brand-blue'
          : 'cursor-pointer hover:bg-brand-blue/5'
    }`;

  const renderScenarioSurface = () => {
    switch (scenario.id) {
      case 'email-fake':
        return (
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden shadow-lg shadow-black/10">
            <div className="bg-black px-4 py-3 xl:px-5 xl:py-4 border-b border-brand-blue/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                </div>
                <span className="ml-4 text-[10px] font-mono text-white/70 tracking-widest">Incoming message</span>
              </div>
              <div className="text-[10px] font-mono text-white/70">ID: SEC-PX-992</div>
            </div>

            <div className="p-6 xl:p-8 space-y-6 xl:space-y-7">
              <div className="space-y-1 pb-4 border-b border-black/10">
                <div className="flex text-xs">
                  <span className="w-16 text-black/60 font-mono">FROM:</span>
                  <button type="button" onClick={() => toggleClue('sender')} className={interactiveLineClass('sender')}>
                    <span className="text-black font-medium">IT support &lt;admin-security-alert@company-it-verify.net&gt;</span>
                  </button>
                </div>
                <div className="flex text-xs">
                  <span className="w-16 text-black/60 font-mono">TO:</span>
                  <span className="text-black/80 px-2 py-1">Employee &lt;you@bitville.com&gt;</span>
                </div>
                <div className="flex text-xs">
                  <span className="w-16 text-black/60 font-mono">SUBJ:</span>
                  <button type="button" onClick={() => toggleClue('subject')} className={interactiveLineClass('subject')}>
                    <span className="text-brand-blue font-bold tracking-tight">Urgent: account suspension imminent</span>
                  </button>
                </div>
              </div>

              <div className="text-black/80 text-sm xl:text-base leading-relaxed space-y-4 xl:space-y-5 font-sans">
                <p>Dear valued employee,</p>
                <p>
                  Our automated security systems have detected suspicious login attempts from an unrecognized IP address.
                  To protect your data, your account has been flagged for <strong>immediate suspension</strong>.
                </p>
                <p>
                  To prevent lockout, you must verify your credentials within the next 60 minutes by clicking the secure
                  link below:
                </p>
                <div className="py-4">
                  <div className="inline-block px-6 py-3 xl:px-7 xl:py-4 bg-brand-blue text-white rounded font-bold text-sm xl:text-base shadow-md">
                    Verify account now
                  </div>
                  <div className="mt-2 text-[10px] text-black/60 font-mono">
                    <button type="button" onClick={() => toggleClue('link')} className={interactiveLineClass('link')}>
                      Link: http://verify-auth-bitville.secure-portal.xyz/login?token=88231
                    </button>
                  </div>
                </div>
                <p className="text-xs italic text-black/65">
                  Failure to comply will result in permanent account deletion and loss of all local files.
                </p>
                <div>
                  <p>Regards,</p>
                  <button
                    type="button"
                    onClick={() => toggleClue('signature')}
                    className={`mt-1 ${interactiveLineClass('signature')}`}
                  >
                    The global security team
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'sms-ceo':
        return (
          <div className="mx-auto max-w-sm rounded-[2rem] border-[10px] border-black bg-[#111827] p-3 shadow-xl shadow-black/25">
            <div className="rounded-[1.35rem] overflow-hidden bg-slate-50">
              <div className="bg-black text-white px-4 py-3 flex items-center justify-between text-[10px] font-mono tracking-widest">
                <span>09:41</span>
                <span>MESSAGES</span>
                <span>100%</span>
              </div>
              <div className="border-b border-black/10 px-4 py-3 bg-white flex items-center gap-3">
                <button type="button" onClick={() => toggleClue('sender')} className={`flex items-center gap-3 ${interactiveLineClass('sender')}`}>
                  <img
                    src={philippeDelormePhoto}
                    alt="Philippe Delorme"
                    className="w-11 h-11 rounded-full object-cover border border-black/10"
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-black">Philippe Delorme</p>
                    <p className="text-xs text-black/55">Mobile</p>
                  </div>
                </button>
              </div>
              <div className="p-4 bg-slate-100 space-y-3">
                <div className="max-w-[88%] rounded-[1.4rem] rounded-tl-sm bg-white px-4 py-3 text-sm text-black/80 shadow-sm border border-black/5 space-y-3">
                  <p>Dear ,</p>
                  <button type="button" onClick={() => toggleClue('request')} className={`${interactiveLineClass('request')} text-left`}>
                    I need some assistance with an urgent matter. I&apos;ve been locked out of my account. Can I use yours?
                  </button>
                  <button type="button" onClick={() => toggleClue('pressure')} className={`${interactiveLineClass('pressure')} text-left`}>
                    I will tell your supervisor that you have been very helpful.
                  </button>
                  <button type="button" onClick={() => toggleClue('signature')} className={`${interactiveLineClass('signature')} text-left`}>
                    br philip
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'linkedin-fake':
        return (
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden shadow-lg shadow-black/10">
            <div className="bg-[#0A66C2] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white text-[#0A66C2] grid place-items-center font-black text-lg">in</div>
                <div>
                  <p className="text-sm font-bold">LinkedIn</p>
                  <p className="text-[11px] text-white/80">Messaging</p>
                </div>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-white/70">DIRECT MESSAGE</p>
            </div>
            <div className="p-6 space-y-5 bg-[#f3f8fd]">
              <button type="button" onClick={() => toggleClue('channel')} className={`w-full rounded-2xl border border-black/10 bg-white p-4 text-left shadow-sm ${interactiveLineClass('channel')}`}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0A66C2] text-white grid place-items-center font-bold">LN</div>
                  <div>
                    <p className="font-bold text-black">Laura Nieminen</p>
                    <p className="text-sm text-black/60">Recruitment Partner at KONE</p>
                  </div>
                </div>
              </button>

              <div className="ml-auto max-w-[92%] rounded-[1.4rem] rounded-tr-sm bg-white border border-black/10 px-4 py-4 text-sm text-black/80 shadow-sm space-y-3">
                <button type="button" onClick={() => toggleClue('channel')} className={`${interactiveLineClass('channel')} text-left`}>
                  Hi, we are updating employee profiles for a leadership review.
                </button>
                <button type="button" onClick={() => toggleClue('signin')} className={`${interactiveLineClass('signin')} text-left`}>
                  Please open the secure form below and sign in with your work account
                </button>
                <button type="button" onClick={() => toggleClue('urgency')} className={`${interactiveLineClass('urgency')} text-left`}>
                  today so we can keep your profile active.
                </button>
                <button type="button" onClick={() => toggleClue('domain')} className={`${interactiveLineClass('domain')} text-left font-mono text-[12px] text-[#0A66C2] break-all`}>
                  https://kone-talent-review-secure.com
                </button>
              </div>
            </div>
          </div>
        );
      case 'email-legitimate':
        return (
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden shadow-lg shadow-black/10">
            <div className="bg-black px-4 py-3 xl:px-5 xl:py-4 border-b border-brand-blue/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                </div>
                <span className="ml-4 text-[10px] font-mono text-white/70 tracking-widest">KONE MAIL</span>
              </div>
              <div className="text-[10px] font-mono text-white/70">INTERNAL</div>
            </div>
            <div className="p-6 xl:p-8 space-y-6">
              <div className="space-y-1 pb-4 border-b border-black/10">
                <div className="flex text-xs">
                  <span className="w-16 text-black/60 font-mono">FROM:</span>
                  <button type="button" onClick={() => toggleClue('sender')} className={interactiveLineClass('sender')}>
                    <span className="text-black font-medium">katja.virtanen@kone.com</span>
                  </button>
                </div>
                <div className="flex text-xs">
                  <span className="w-16 text-black/60 font-mono">TO:</span>
                  <span className="text-black/80 px-2 py-1">you@kone.com</span>
                </div>
              </div>

              <div className="text-black/80 text-sm xl:text-base leading-relaxed space-y-4">
                <button type="button" onClick={() => toggleClue('request')} className={`${interactiveLineClass('request')} text-left`}>
                  Hello! Which day would be good for you for a meeting? I have time this week.
                </button>

                <button type="button" onClick={() => toggleClue('signature')} className={`${interactiveLineClass('signature')} block text-left`}>
                  <span className="whitespace-pre-line">
                    {`Best regards,
Katja Virtanen
Project Manager
Global Operations`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleClue('footer')}
                  className={`${interactiveLineClass('footer')} block w-full text-left pt-4 border-t border-black/10`}
                >
                  <span className="whitespace-pre-line text-sm text-black/70 block">
                    {`KONE Corporation
Keilasatama 3

02150 Espoo, Finland`}
                  </span>
                  <img src={koneLogo} alt="KONE" className="mt-4 h-9 w-auto" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">PHISHING MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Phishing briefing</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('mission')}
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'mission') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">PHISHING MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Phishing briefing</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold"
              >
                Got it
              </button>
            </div>

            <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
              <h3 className="text-sm xl:text-base font-bold text-black">Your mission</h3>
              <p className="body-copy text-black/75">{challenge.missionText}</p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('activity')}
                className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/10"
              >
                Prepare defenses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (missionComplete && feedback?.isCorrect) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">PHISHING MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Mission complete</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-6">
            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-5 space-y-4 text-brand-blue">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <p className="font-medium whitespace-pre-line">{feedback.text}</p>
              </div>
            </div>

            <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-black">Protection level</p>
                <p className="text-xs font-mono text-brand-blue">{percentage}%</p>
              </div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-black/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="h-full bg-brand-blue"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleFeedbackAction}
                className="px-6 py-2 xl:px-7 xl:py-3 rounded-lg bg-brand-blue hover:opacity-90 text-white text-sm xl:text-base font-bold transition-colors"
              >
                Continue mission
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 xl:space-y-6">
        <div className="bg-white rounded-xl border border-black/10 p-5 space-y-4 shadow-sm shadow-black/10">
          {feedback ? (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 space-y-3 ${
                  feedback.isCorrect ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-black text-white border-black'
                }`}
              >
                <div className="flex items-start gap-3">
                  {feedback.isCorrect ? (
                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm leading-relaxed font-medium whitespace-pre-line">{feedback.text}</p>
                </div>
              </div>

              {feedback.isCorrect && (
                <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-black">Protection level</p>
                    <p className="text-xs font-mono text-brand-blue">{percentage}%</p>
                  </div>
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-black/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-brand-blue"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleFeedbackAction}
                className={`w-full px-6 py-3 rounded-lg font-bold transition-colors ${
                  feedback.isCorrect
                    ? 'bg-brand-blue hover:opacity-90 text-white'
                    : 'bg-white hover:bg-brand-blue/5 text-black border border-black/15'
                }`}
              >
                {feedback.isCorrect ? 'Continue mission' : 'Try again'}
              </button>
            </div>
          ) : (
            <>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm xl:text-base font-bold text-black">{scenario.title}</h3>
                  <p className="text-xs font-mono text-brand-blue">
                    Scenario {scenarioIndex + 1} / {PHISHING_SCENARIOS.length}
                  </p>
                </div>
                <p className="text-sm xl:text-base text-black/70">{scenario.promptLabel}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'legitimate' as const, label: 'Legitimate' },
                  { id: 'fake' as const, label: 'Fake' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!!feedback && classification !== 'fake'}
                    onClick={() => handleClassification(option.id)}
                    className={`w-full p-4 xl:p-5 rounded-xl border text-left text-sm xl:text-base transition-all flex items-center justify-between group ${
                      classification === option.id
                        ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                        : 'bg-white border-black/10 text-black/80 hover:border-brand-blue hover:bg-brand-blue/5'
                    }`}
                  >
                    <span>{option.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-brand-blue" />
                  </button>
                ))}
              </div>

              {classification === scenario.expectedClassification && (
                <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-2">
                  <p className="text-sm xl:text-base font-bold text-black">{scenario.clueTitle}</p>
                  <p className="text-sm xl:text-base text-black/70">{scenario.clueInstruction}</p>
                  <p className="text-xs font-mono text-brand-blue">
                    {selectedClues.length} / {clueTarget} selected
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {renderScenarioSurface()}

        {classification === scenario.expectedClassification && !feedback && (
          <button
            type="button"
            onClick={submitClues}
            className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
          >
            {scenario.expectedClassification === 'fake' ? 'Check warning signs' : 'Check trustworthy signs'}
          </button>
        )}
      </div>
    </div>
  );
};

const createMfaCode = () => Math.floor(1000 + Math.random() * 9000).toString();

const PasswordLoginSimulator = ({
  challenge,
  step,
  onSetStep,
  onAnswer,
  onClearFeedback,
  feedback,
  currentLevel,
  maxLevel,
  onContinue,
  resetKey,
}: {
  challenge: Challenge;
  step: 'intro' | 'mission' | 'activity';
  onSetStep: (step: 'intro' | 'mission' | 'activity') => void;
  onAnswer: (isCorrect: boolean, feedback: string) => void;
  onClearFeedback: () => void;
  feedback: { text: string; isCorrect: boolean } | null;
  currentLevel: number;
  maxLevel: number;
  onContinue: () => void;
  resetKey: string;
}) => {
  const [loginStep, setLoginStep] = useState<'password' | 'mfa' | 'manager'>('password');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [currentMfaCode, setCurrentMfaCode] = useState(createMfaCode);

  useEffect(() => {
    setLoginStep('password');
    setPassword('');
    setMfaCode('');
    setCurrentMfaCode(createMfaCode());
  }, [resetKey]);

  const submitPassword = () => {
    if (!password.trim()) {
      onAnswer(false, 'Enter a password to continue the login practice.');
      return;
    }

    setLoginStep('mfa');
    onClearFeedback();
    setCurrentMfaCode(createMfaCode());
    setMfaCode('');
  };

  const submitMfa = () => {
    if (mfaCode.trim() === currentMfaCode) {
      setLoginStep('manager');
      onClearFeedback();
      return;
    }

    const nextCode = createMfaCode();
    setCurrentMfaCode(nextCode);
    setMfaCode('');
    onAnswer(false, 'That code was incorrect. Stay on the MFA step and use the new 4-digit code now shown on the phone.');
  };

  const handlePasswordManagerChoice = (choice: 'yes' | 'no') => {
    if (choice === 'yes') {
      onAnswer(
        true,
        'Well done! With strong passwords you protect your accounts and KONE.\n\nYou defended KONE systems with strong password practices. Our protection level has increased.',
      );
      return;
    }

    onAnswer(false, 'Password managers help keep passwords secure without needing to remember every password yourself. Try again.');
  };

  const resetPasswordManagerStep = () => {
    setLoginStep('manager');
    onClearFeedback();
  };

  const handleFeedbackAction = () => {
    if (feedback?.isCorrect) {
      onContinue();
      return;
    }

    if (loginStep === 'manager') {
      resetPasswordManagerStep();
      return;
    }

    onClearFeedback();
  };

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">PASSWORD MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Password protection</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('mission')}
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'mission') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">PASSWORD MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Password protection</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold"
              >
                Got it
              </button>
            </div>

            <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
              <h3 className="text-sm xl:text-base font-bold text-black">Your mission</h3>
              <p className="body-copy text-black/75">{challenge.missionText}</p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('activity')}
                className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/10"
              >
                Prepare defenses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loginStep === 'password' ? (
        <div className="space-y-4 xl:space-y-6">
          <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
            <h3 className="text-sm xl:text-base font-bold text-black">KONE password requirements</h3>
            <p className="body-copy text-black/75">
              Create a password that follows KONE&apos;s password requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_320px] gap-4 xl:gap-6 items-start">
            <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
              <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
                <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">KONE ACCESS</p>
                <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Create a password</h3>
              </div>

              <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password-input" className="block text-sm xl:text-base font-bold text-black">
                    New password
                  </label>
                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Type a password"
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 xl:px-5 xl:py-4 text-base xl:text-lg text-black outline-none focus:border-brand-blue"
                  />
                </div>

                <button
                  type="button"
                  onClick={submitPassword}
                  className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 p-5 xl:p-6 shadow-sm shadow-black/10 space-y-3">
              <h4 className="text-lg xl:text-xl font-bold text-black">Your password must contain</h4>
              <div className="text-sm xl:text-base text-black/70 space-y-1">
                <p>Min. 10 characters</p>
                <p>Upper case letters</p>
                <p>Lower case letters</p>
                <p>Numbers</p>
                <p>Special characters</p>
              </div>
            </div>
          </div>
        </div>
      ) : loginStep === 'mfa' ? (
        <div className="space-y-4 xl:space-y-6">
          <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
            <h3 className="text-sm xl:text-base font-bold text-black">MFA - Multi-factor authentication</h3>
            <p className="body-copy text-black/75">
              Multi-factor authentication adds more protection to your accounts. With it, you verify that it really is
              you who&apos;s trying to log in.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_360px] gap-4 xl:gap-6 items-start">
            <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
            <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
              <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">KONE ACCESS</p>
              <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Verify your login</h3>
            </div>

            <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
              <div className="space-y-2">
                <p className="text-sm xl:text-base font-bold text-black">Enter verification code</p>
                <p className="text-sm xl:text-base text-black/70">
                  We sent a 4-digit code to your registered mobile device. Enter it below to finish signing in.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="mfa-code-input" className="block text-sm xl:text-base font-bold text-black">
                  4-digit code
                </label>
                <input
                  id="mfa-code-input"
                  inputMode="numeric"
                  maxLength={4}
                  value={mfaCode}
                  onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 xl:px-5 xl:py-4 text-base xl:text-lg text-black tracking-[0.35em] outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={submitMfa}
                  className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
                >
                  Verify login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep('password');
                    setMfaCode('');
                    setPassword('');
                    onClearFeedback();
                  }}
                  className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg border border-black/15 text-black text-sm xl:text-base font-bold hover:bg-brand-blue/5 transition-colors"
                >
                  Back to password
                </button>
              </div>
            </div>
            </div>

            <div className="rounded-[2rem] xl:rounded-[2.4rem] border-[10px] xl:border-[12px] border-black bg-[#111827] p-3 xl:p-4 shadow-xl shadow-black/20">
              <div className="rounded-[1.35rem] bg-white overflow-hidden">
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between text-[10px] font-mono tracking-widest">
                  <span>09:41</span>
                  <span>PHONE</span>
                  <span>100%</span>
                </div>
                <div className="p-4 xl:p-5 bg-slate-50">
                  <div className="rounded-2xl bg-white border border-black/10 p-4 xl:p-5 shadow-sm">
                    <p className="text-xs font-mono tracking-widest text-brand-blue">KONE SECURITY</p>
                    <p className="mt-3 text-sm xl:text-base font-semibold text-black">Your verification code is:</p>
                    <p className="mt-2 text-3xl xl:text-4xl font-black tracking-[0.3em] text-black">{currentMfaCode}</p>
                    <p className="mt-3 text-xs text-black/60">Use this code to complete your sign-in. Do not share it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 xl:space-y-6">
          <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
            <h3 className="text-sm xl:text-base font-bold text-black">Password managers</h3>
            <p className="body-copy text-black/75">
              Password managers like KeePass keep your passwords safe without you having to remember all your passwords.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
            <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
              <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">KONE ACCESS</p>
              <h3 className="mt-2 text-2xl xl:text-3xl font-bold">Commit to password manager?</h3>
            </div>

            <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!!feedback}
                  onClick={() => handlePasswordManagerChoice('yes')}
                  className={`w-full p-4 xl:p-5 rounded-xl border text-left text-sm xl:text-base transition-all ${
                    feedback
                      ? 'bg-white border-black/10 text-black/45'
                      : 'bg-white border-black/10 text-black/80 hover:border-brand-blue hover:bg-brand-blue/5'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={!!feedback}
                  onClick={() => handlePasswordManagerChoice('no')}
                  className={`w-full p-4 xl:p-5 rounded-xl border text-left text-sm xl:text-base transition-all ${
                    feedback
                      ? 'bg-white border-black/10 text-black/45'
                      : 'bg-white border-black/10 text-black/80 hover:border-brand-blue hover:bg-brand-blue/5'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border ${
              feedback.isCorrect ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-black border-black text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <ShieldCheck className="w-6 h-6 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 shrink-0" />
              )}
              <div className="space-y-4">
                <p className="font-medium">{feedback.text}</p>
                {feedback.isCorrect && loginStep === 'manager' && (
                  <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-black">Protection level</p>
                      <p className="text-xs font-mono text-brand-blue">{Math.round((100 * currentLevel) / maxLevel)}%</p>
                    </div>
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden border border-black/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((100 * currentLevel) / maxLevel)}%` }}
                        className="h-full bg-brand-blue"
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleFeedbackAction}
                  className="px-6 py-2 xl:px-7 xl:py-3 rounded-lg bg-brand-blue hover:opacity-90 text-white text-sm xl:text-base font-bold transition-colors"
                >
                  {feedback.isCorrect ? 'Continue mission' : 'Try again'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ColleagueCheckSimulator = ({
  scenario,
  onComplete,
}: {
  scenario: ColleagueCheckScenario;
  onComplete: () => void;
}) => {
  const [selectedDialogue, setSelectedDialogue] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  useEffect(() => {
    setSelectedDialogue(null);
    setFeedback(null);
  }, [scenario.id]);

  const handleDialogueChoice = (choice: string) => {
    if (feedback) return;
    setSelectedDialogue(choice);
  };

  const handleAnswerChoice = (answer: ColleagueCheckScenario['answers'][number]) => {
    if (!selectedDialogue || feedback) return;

    setFeedback({
      text: answer.isCorrect ? answer.feedback : `Not quite. ${answer.feedback}`,
      isCorrect: answer.isCorrect,
    });
  };

  const resetAnswer = () => {
    setFeedback(null);
  };

  return (
    <div className="page-narrow py-12 xl:py-14 space-y-8 xl:space-y-10">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-brand-blue">
          <User className="w-5 h-5 text-brand-blue" />
          <span className="text-xs font-mono tracking-widest font-bold">Colleague check</span>
        </div>
        <h2 className="text-3xl xl:text-4xl font-black text-black tracking-tight">{scenario.title}</h2>
        <p className="text-black/75 text-base xl:text-lg">{scenario.instructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 xl:gap-8 items-start">
        <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm shadow-black/10">
          <div className="relative aspect-[0.95] bg-gradient-to-br from-brand-blue/10 via-white to-brand-blue/5 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent"
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center">
                <User className="w-14 h-14 text-black/35" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-black">{scenario.colleagueName}</p>
                <p className="text-sm text-black/60">{scenario.colleagueRole}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-black/10 p-6 xl:p-8 shadow-sm shadow-black/10 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-mono tracking-widest text-black/55">Start the conversation</p>
              <h3 className="text-xl xl:text-2xl font-bold text-black">Dialogue options</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {scenario.dialogueOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleDialogueChoice(option)}
                  className={`w-full p-4 rounded-xl border text-left text-sm xl:text-base transition-all flex items-center justify-between group ${
                    selectedDialogue === option
                      ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                      : 'bg-white border-black/10 text-black/80 hover:border-brand-blue hover:bg-brand-blue/5'
                  }`}
                >
                  <span>{option}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-brand-blue" />
                </button>
              ))}
            </div>
          </div>

          {selectedDialogue && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-black/10 p-6 xl:p-8 shadow-sm shadow-black/10 space-y-4">
                <div className="space-y-3">
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-brand-blue text-white px-4 py-3 text-sm xl:text-base">
                    {selectedDialogue}
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-black text-white px-4 py-3 text-sm xl:text-base">
                    {scenario.colleagueResponse}
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-brand-blue/5 p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-mono tracking-widest text-black/55">Reflection</p>
                    <h3 className="text-lg xl:text-xl font-bold text-black">{scenario.question}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scenario.answers.map((answer) => (
                      <button
                        key={answer.text}
                        type="button"
                        disabled={!!feedback}
                        onClick={() => handleAnswerChoice(answer)}
                        className={`w-full px-5 py-3 rounded-xl border text-sm xl:text-base font-bold transition-colors ${
                          feedback
                            ? answer.isCorrect
                              ? 'bg-brand-blue text-white border-brand-blue'
                              : 'bg-white text-black/45 border-black/10'
                            : 'bg-white text-black border-black/10 hover:border-brand-blue hover:bg-white/80'
                        }`}
                      >
                        {answer.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {feedback && (
                <div
                  className={`rounded-2xl border p-5 xl:p-6 space-y-4 ${
                    feedback.isCorrect ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-black border-black text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {feedback.isCorrect ? (
                      <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm xl:text-base leading-relaxed font-medium">{feedback.text}</p>
                  </div>

                  <button
                    type="button"
                    onClick={feedback.isCorrect ? onComplete : resetAnswer}
                    className={`w-full px-6 py-3 rounded-lg font-bold transition-colors ${
                      feedback.isCorrect
                        ? 'bg-brand-blue hover:opacity-90 text-white'
                        : 'bg-white hover:bg-brand-blue/5 text-black border border-black/15'
                    }`}
                  >
                    {feedback.isCorrect ? 'Return to dashboard' : 'Try again'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StandardChallengeSimulator = ({
  challenge,
  step,
  onSetStep,
  onAnswer,
  feedback,
  onContinue,
}: {
  challenge: Challenge;
  step: 'intro' | 'mission' | 'activity';
  onSetStep: (step: 'intro' | 'mission' | 'activity') => void;
  onAnswer: (isCorrect: boolean, feedback: string) => void;
  feedback: { text: string; isCorrect: boolean } | null;
  onContinue: () => void;
}) => {
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">{challenge.topic.toUpperCase()} MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">{challenge.topic} briefing</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('mission')}
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold hover:opacity-90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'mission') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm shadow-black/10 overflow-hidden">
          <div className="px-6 py-5 xl:px-8 xl:py-6 border-b border-black/10 bg-black text-white">
            <p className="text-[10px] font-mono tracking-[0.25em] text-white/65">{challenge.topic.toUpperCase()} MISSION</p>
            <h3 className="mt-2 text-2xl xl:text-3xl font-bold">{challenge.topic} briefing</h3>
          </div>

          <div className="p-6 xl:p-8 space-y-5 xl:space-y-6">
            <p className="body-copy text-black/80">{challenge.briefing}</p>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-6 py-3 xl:px-7 xl:py-4 rounded-lg bg-brand-blue text-white text-sm xl:text-base font-bold"
              >
                Got it
              </button>
            </div>

            <div className="bg-brand-blue/5 rounded-xl border border-brand-blue/15 p-5 space-y-3">
              <h3 className="text-sm xl:text-base font-bold text-black">Your mission</h3>
              <p className="body-copy text-black/75">{challenge.missionText}</p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSetStep('activity')}
                className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/10"
              >
                Prepare defenses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 xl:p-10 bg-white rounded-2xl border border-black/10 relative overflow-hidden shadow-sm shadow-black/10">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue" />
        <p className="text-lg xl:text-xl text-black/80 leading-relaxed italic">"{challenge.scenario}"</p>
      </div>

      <div className="space-y-3">
        {challenge.options.map((option, idx) => (
          <button
            key={idx}
            disabled={!!feedback}
            onClick={() => onAnswer(option.isCorrect, option.feedback)}
            className={`w-full p-5 xl:p-6 rounded-xl border text-left text-base xl:text-lg transition-all ${
              feedback
                ? option.isCorrect
                  ? 'bg-brand-blue/10 border-brand-blue text-brand-blue'
                  : 'bg-white border-black/10 text-black/45'
                : 'bg-white border-black/10 text-black/80 hover:border-brand-blue hover:bg-brand-blue/5'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </>
  );
};

export default function App() {
  const [view, setView] = useState<AppState>('intro');
  const [viewHistory, setViewHistory] = useState<AppState[]>([]);
  const [role, setRole] = useState<Role>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [completedColleagueScenarioIds, setCompletedColleagueScenarioIds] = useState<string[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [activeColleagueScenario, setActiveColleagueScenario] = useState<ColleagueCheckScenario | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [phishingStep, setPhishingStep] = useState<'intro' | 'mission' | 'activity'>('intro');
  const [passwordMissionStep, setPasswordMissionStep] = useState<'intro' | 'mission' | 'activity'>('intro');
  const [confidentialityMissionStep, setConfidentialityMissionStep] = useState<'intro' | 'mission' | 'activity'>('intro');
  const [standardMissionStep, setStandardMissionStep] = useState<'intro' | 'mission' | 'activity'>('intro');
  const [missionIntroStage, setMissionIntroStage] = useState<'video' | 'content'>('video');

  const getRoleChallenges = () => {
    switch (role) {
      case 'office':
        return OFFICE_CHALLENGES;
      case 'factory':
        return FACTORY_CHALLENGES;
      case 'field':
        return FIELD_CHALLENGES;
      default:
        return [];
    }
  };

  const sharedIntroChallenges = SHARED_CHALLENGES.slice(0, 2);
  const sharedCommonChallenges = SHARED_CHALLENGES.slice(2);
  const roleChallenges = getRoleChallenges();
  const confidentialityChallenge = roleChallenges.find((challenge) => challenge.topic === 'Confidentiality');
  const computerUseChallenge = roleChallenges.find((challenge) => challenge.topic === 'Computer use');
  const otherRoleChallenges = roleChallenges.filter(
    (challenge) => challenge.id !== confidentialityChallenge?.id && challenge.id !== computerUseChallenge?.id,
  );

  const allChallenges = [
    ...sharedIntroChallenges,
    ...(confidentialityChallenge ? [confidentialityChallenge] : []),
    ...sharedCommonChallenges,
    ...otherRoleChallenges,
    ...(computerUseChallenge ? [computerUseChallenge] : []),
  ];
  const availableColleagueScenarios = COLLEAGUE_CHECK_SCENARIOS.filter((scenario) =>
    allChallenges.some((challenge) => challenge.id === scenario.challengeId),
  );
  const totalProgressCount = completedIds.length + completedColleagueScenarioIds.length;
  const totalProgressMax = allChallenges.length + availableColleagueScenarios.length;

  const navigateTo = (nextView: AppState) => {
    if (nextView === 'mission-intro') {
      setMissionIntroStage('video');
    }
    setViewHistory((prev) => [...prev, view]);
    setView(nextView);
  };

  const resetChallengeSession = () => {
    setActiveChallenge(null);
    setFeedback(null);
    setPhishingStep('intro');
    setPasswordMissionStep('intro');
    setConfidentialityMissionStep('intro');
    setStandardMissionStep('intro');
  };

  const resetColleagueCheckSession = () => {
    setActiveColleagueScenario(null);
  };

  const goBack = () => {
    if (viewHistory.length > 0) {
      const prevView = viewHistory[viewHistory.length - 1];
      if (view === 'challenge') {
        resetChallengeSession();
      }
      if (view === 'colleague-check') {
        resetColleagueCheckSession();
      }
      setViewHistory((prev) => prev.slice(0, -1));
      setView(prevView);
    }
  };

  const handleStart = () => navigateTo('villain-intro');

  const selectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    navigateTo('dashboard');
  };

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setPhishingStep('intro');
    setPasswordMissionStep('intro');
    setConfidentialityMissionStep('intro');
    setStandardMissionStep('intro');
    navigateTo('challenge');
    setFeedback(null);
  };

  const startColleagueScenario = (scenario: ColleagueCheckScenario) => {
    setActiveColleagueScenario(scenario);
    navigateTo('colleague-check');
  };

  const clearFeedback = () => setFeedback(null);

  const handleAnswer = (isCorrect: boolean, feedbackText: string) => {
    setFeedback({ text: feedbackText, isCorrect });
    if (isCorrect && activeChallenge) {
      if (!completedIds.includes(activeChallenge.id)) {
        setCompletedIds([...completedIds, activeChallenge.id]);
      }
    }
  };

  const finishChallenge = () => {
    resetChallengeSession();
    if (totalProgressCount === totalProgressMax) {
      navigateTo('victory');
    } else {
      navigateTo('dashboard');
    }
  };

  const finishColleagueScenario = () => {
    if (activeColleagueScenario && !completedColleagueScenarioIds.includes(activeColleagueScenario.id)) {
      setCompletedColleagueScenarioIds((prev) => [...prev, activeColleagueScenario.id]);
    }
    resetColleagueCheckSession();
    if (totalProgressCount + 1 === totalProgressMax) {
      navigateTo('victory');
    } else {
      navigateTo('dashboard');
    }
  };

  const IntroView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-narrow text-center space-y-8 xl:space-y-10 py-20 xl:py-24"
    >
      <div className="inline-flex p-4 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-4">
        <Shield className="w-12 h-12 text-brand-blue" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl xl:text-6xl font-bold tracking-tight text-black font-serif">Cybersecurity at KONE</h1>
        <h2 className="text-3xl xl:text-4xl font-semibold text-brand-blue not-italic font-sans">Everyone&apos;s mission</h2>
      </div>
      <button
        onClick={handleStart}
        className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/20"
      >
        Begin
      </button>
    </motion.div>
  );

  const VillainIntroView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="page-narrow pt-16 xl:pt-20 pb-8 xl:pb-10 space-y-8 xl:space-y-10"
    >
      <div className="bg-white rounded-2xl p-6 md:p-10 xl:p-12 border border-black/10 shadow-sm shadow-black/10">
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <p className="text-black/80 text-base xl:text-lg leading-relaxed">
            KONE possesses valuable information that people with bad intentions try to access.
          </p>
          <p className="text-black/80 text-base xl:text-lg leading-relaxed">
            Access to our systems can harm our employees, our customers, and KONE as a company.
          </p>
          <p className="text-black/80 text-base xl:text-lg leading-relaxed">
            Cybersecurity is everyone&apos;s responsibility, and that&apos;s why it&apos;s also your responsibility to protect
            KONE.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigateTo('mission-intro')}
          className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/10"
        >
          Prepare defenses
        </button>
      </div>
    </motion.div>
  );

  const MissionIntroView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="page-narrow pt-16 xl:pt-20 pb-8 xl:pb-10 space-y-8 xl:space-y-10"
    >
      {missionIntroStage === 'video' ? (
        <div className="bg-white rounded-2xl p-4 md:p-6 xl:p-8 border border-black/10 shadow-sm shadow-black/10">
          <div className="relative overflow-hidden rounded-xl border border-black/10 bg-black shadow-lg shadow-black/10">
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={() => setMissionIntroStage('content')}
                className="px-4 py-2 rounded-full bg-white/90 text-black text-sm font-bold border border-black/10 hover:bg-white transition-colors shadow-sm"
              >
                Skip
              </button>
            </div>
            <div className="w-full aspect-video flex items-center justify-center bg-black text-white">
              <span className="text-3xl md:text-4xl xl:text-5xl font-black tracking-[0.25em]">CEO VIDEO</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-6 md:p-10 xl:p-12 border border-black/10 shadow-sm shadow-black/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-10 items-start">
              <div className="relative aspect-[0.9] bg-white rounded-xl border border-black/10 overflow-hidden flex items-center justify-center max-w-[260px] xl:max-w-[320px] w-full mx-auto">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-white"
                />
                <User className="w-20 h-20 text-black/25 relative z-10" />

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute top-3 right-3 z-20"
                >
                  <AlertTriangle className="w-10 h-10 text-brand-blue drop-shadow-sm" />
                </motion.div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl xl:text-4xl font-black text-black tracking-tight">The Mission</h2>
                <p className="body-copy text-black/80">
                  Criminals are attempting to breach our company&apos;s systems. Today, you will defend KONE against
                  criminals that are trying to hurt our company.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigateTo('role-selection')}
              className="action-button bg-brand-blue hover:opacity-90 text-white rounded-full transform hover:scale-105 shadow-lg shadow-brand-blue/10"
            >
              Let&apos;s go
            </button>
          </div>
        </>
      )}
    </motion.div>
  );

  const RoleSelectionView = () => (
    <div className="page-wide space-y-12 xl:space-y-14 py-12 xl:py-14">
      <div className="text-center space-y-4">
        <h2 className="text-3xl xl:text-4xl font-bold text-black">Choose your role</h2>
        <p className="text-black/70 text-sm xl:text-base">Select your role to receive specialized security protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8">
        {[
          { id: 'office', title: 'Office worker', icon: Briefcase },
          { id: 'factory', title: 'Factory worker', icon: Factory },
          { id: 'field', title: 'Field worker', icon: Smartphone },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => selectRole(item.id as Role)}
            className="group p-8 xl:p-10 bg-white border border-black/10 rounded-2xl text-left hover:border-brand-blue hover:shadow-xl hover:shadow-brand-blue/10 transition-all"
          >
            <item.icon className="w-10 h-10 xl:w-12 xl:h-12 text-black/25 group-hover:text-brand-blue mb-6 transition-colors" />
            <h3 className="text-xl xl:text-2xl font-bold text-black">{item.title}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="page-wide space-y-8 xl:space-y-10 py-12 xl:py-14">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-black/10">
            {role === 'office' && <Briefcase className="w-5 h-5 text-black/70" />}
            {role === 'factory' && <Factory className="w-5 h-5 text-black/70" />}
            {role === 'field' && <Smartphone className="w-5 h-5 text-black/70" />}
          </div>
          <div>
            <h2 className="text-sm xl:text-base font-mono tracking-widest text-black/60">Current sector</h2>
            <p className="text-black text-sm xl:text-lg font-bold capitalize">{role} operations</p>
          </div>
        </div>
        <button
          onClick={() => navigateTo('role-selection')}
          className="text-xs font-mono text-black/60 hover:text-brand-blue flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Change role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
        {allChallenges.map((c, i) => {
          const isCompleted = completedIds.includes(c.id);
          const isCurrentMission = !isCompleted && i === completedIds.length;
          const looksLocked = !isCompleted && i > completedIds.length;
          const colleagueScenario = COLLEAGUE_CHECK_SCENARIOS.find((scenario) => scenario.challengeId === c.id);
          const isColleagueScenarioCompleted = colleagueScenario
            ? completedColleagueScenarioIds.includes(colleagueScenario.id)
            : false;

          return (
            <div
              key={c.id}
              className={`relative p-6 xl:p-7 rounded-xl border text-left transition-all ${
                isCompleted
                  ? 'bg-brand-blue/10 border-black/10 opacity-60'
                    : isCurrentMission
                      ? 'bg-white border-brand-blue/30 shadow-lg shadow-brand-blue/5 hover:border-brand-blue hover:-translate-y-0.5'
                      : 'bg-black/5 border-black/10 opacity-65'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono tracking-widest text-black/60">Mission {i + 1}</span>
                {isCompleted ? (
                  <ShieldCheck className="w-5 h-5 text-brand-blue" />
                ) : looksLocked ? (
                  <ShieldAlert className="w-5 h-5 text-black/35" />
                ) : (
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <ShieldAlert className="w-5 h-5 text-brand-blue" />
                  </motion.div>
                )}
              </div>
              <h3 className={`text-lg xl:text-xl font-bold ${looksLocked ? 'text-black/55' : 'text-black'}`}>{c.topic}</h3>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => startChallenge(c)}
                  className={`w-full px-5 py-3 rounded-xl border text-sm xl:text-base font-bold transition-colors flex items-center justify-center gap-2 ${
                    looksLocked
                      ? 'bg-white border-black/10 text-black/70 hover:border-brand-blue hover:bg-brand-blue/5'
                      : isCompleted
                        ? 'bg-white border-black/10 text-black hover:border-brand-blue hover:bg-brand-blue/5'
                        : 'bg-brand-blue border-brand-blue text-white hover:opacity-90'
                  }`}
                >
                  {looksLocked ? 'Review mission' : isCompleted ? 'Revisit mission' : 'Respond now'}
                  {!looksLocked && !isCompleted && <ChevronRight className="w-4 h-4" />}
                </button>

                {looksLocked && <div className="text-sm xl:text-base font-bold text-black/45">Locked for now</div>}

                {isCompleted && colleagueScenario && (
                  <button
                    type="button"
                    onClick={() => startColleagueScenario(colleagueScenario)}
                    className="w-full px-5 py-3 rounded-xl border border-black/10 bg-white text-black text-sm xl:text-base font-bold hover:border-brand-blue hover:bg-brand-blue/5 transition-colors"
                  >
                    {isColleagueScenarioCompleted ? 'Revisit colleague check' : 'Check in with a colleague'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ChallengeView = () => {
    if (!activeChallenge) return null;

    const isPhishing = activeChallenge.topic === 'Phishing';
    const isPasswordLoginPractice = activeChallenge.id === 'shared-passwords';
    const isConfidentialityMission = activeChallenge.id === 'office-confidentiality';

    return (
      <div className="page-narrow py-12 xl:py-14 space-y-8 xl:space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-blue">
            <AlertTriangle className="w-5 h-5 text-brand-blue" />
            <span className="text-xs font-mono tracking-widest font-bold">Security alert</span>
          </div>
        </div>

        {isPhishing ? (
          <PhishingSimulator
            challenge={activeChallenge}
            step={phishingStep}
            onSetStep={setPhishingStep}
            onAnswer={handleAnswer}
            onClearFeedback={clearFeedback}
            feedback={feedback}
            currentLevel={totalProgressCount}
            maxLevel={totalProgressMax}
            onContinue={finishChallenge}
          />
        ) : isConfidentialityMission ? (
          <ConfidentialitySimulator
            challenge={activeChallenge}
            step={confidentialityMissionStep}
            onSetStep={setConfidentialityMissionStep}
            onAnswer={handleAnswer}
            onClearFeedback={clearFeedback}
            feedback={feedback}
            currentLevel={totalProgressCount}
            maxLevel={totalProgressMax}
            onContinue={finishChallenge}
            resetKey={activeChallenge.id}
          />
        ) : isPasswordLoginPractice ? (
          <PasswordLoginSimulator
            challenge={activeChallenge}
            step={passwordMissionStep}
            onSetStep={setPasswordMissionStep}
            onAnswer={handleAnswer}
            onClearFeedback={clearFeedback}
            feedback={feedback}
            currentLevel={totalProgressCount}
            maxLevel={totalProgressMax}
            onContinue={finishChallenge}
            resetKey={activeChallenge.id}
          />
        ) : (
          <StandardChallengeSimulator
            challenge={activeChallenge}
            step={standardMissionStep}
            onSetStep={setStandardMissionStep}
            onAnswer={handleAnswer}
            feedback={feedback}
            onContinue={finishChallenge}
          />
        )}

        <AnimatePresence>
          {feedback && !isPhishing && !isPasswordLoginPractice && !isConfidentialityMission && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl border ${
                feedback.isCorrect ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-black border-black text-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {feedback.isCorrect ? (
                  <ShieldCheck className="w-6 h-6 shrink-0" />
                ) : (
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                )}
                <div className="space-y-4">
                  <p className="font-medium">{feedback.text}</p>
                  <button
                    onClick={finishChallenge}
                    className={`px-6 py-2 xl:px-7 xl:py-3 rounded-lg text-sm xl:text-base font-bold transition-colors ${
                      feedback.isCorrect
                        ? 'bg-brand-blue hover:opacity-90 text-white'
                        : 'bg-white hover:bg-brand-blue/5 text-black border border-black/15'
                    }`}
                  >
                    {feedback.isCorrect ? 'Continue mission' : 'Try again'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const VictoryView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="page-narrow text-center py-20 xl:py-24 space-y-8 xl:space-y-10"
    >
      <div className="relative inline-block">
        <Trophy className="w-24 h-24 text-brand-blue mx-auto" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-brand-blue/20 blur-2xl rounded-full -z-10"
        />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl xl:text-5xl font-bold text-black">Perimeter secured</h2>
        <p className="text-black/70 text-lg xl:text-xl">
          Excellent work. You have successfully identified all threats and strengthened the company&apos;s defenses. The
          villain has been repelled.
        </p>
      </div>

      <div className="p-8 xl:p-10 bg-white rounded-2xl border border-black/10">
        <div className="flex items-center justify-center gap-2 text-brand-blue font-mono text-sm xl:text-base font-bold">
          <ShieldCheck className="w-5 h-5" /> Defense status: 100% integrity
        </div>
      </div>

      <button
        onClick={() => {
          setCompletedIds([]);
          setCompletedColleagueScenarioIds([]);
          resetChallengeSession();
          resetColleagueCheckSession();
          setView('intro');
        }}
        className="action-button bg-black hover:bg-brand-blue text-white rounded-full"
      >
        Restart training
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-brand-bg text-black/80 font-sans selection:bg-brand-blue/10">
      <header className="relative z-10 border-b border-black/10 bg-white/85 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 xl:px-8 h-16 xl:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewHistory.length > 0 && (
              <button
                onClick={goBack}
                className="p-2 hover:bg-brand-blue/5 rounded-full transition-colors text-black/60 hover:text-brand-blue"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <img src={koneLogo} alt="KONE" className="h-9 w-auto" />
          </div>

          <IntegrityHeader level={totalProgressCount} max={totalProgressMax} />
        </div>
      </header>

      <main className="app-shell">
        <AnimatePresence mode="wait">
          {view === 'intro' && <IntroView key="intro" />}
          {view === 'villain-intro' && <VillainIntroView key="villain" />}
          {view === 'mission-intro' && <MissionIntroView key="mission" />}
          {view === 'role-selection' && <RoleSelectionView key="roles" />}
          {view === 'dashboard' && <DashboardView key="dash" />}
          {view === 'challenge' && <ChallengeView key="challenge" />}
          {view === 'colleague-check' && activeColleagueScenario && (
            <ColleagueCheckSimulator
              scenario={activeColleagueScenario}
              onComplete={finishColleagueScenario}
            />
          )}
          {view === 'victory' && <VictoryView key="victory" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
