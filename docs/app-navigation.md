# App Navigation Diagram

```mermaid
flowchart TD
  subgraph Onboarding["Intro and onboarding"]
    intro["intro<br/>IntroView"]
    missionIntro["mission-intro<br/>MissionIntroView"]
    roleSelection["role-selection<br/>RoleSelectionView"]
  end

  subgraph MissionStages["Mission intro"]
    video["stage: video"]
    warning["stage: warning"]
    content["stage: content"]
  end

  subgraph Training["Training flow"]
    dashboard["dashboard<br/>DashboardView"]
    challenge["challenge<br/>ChallengeView"]
    colleagueCheck["colleague-check<br/>ColleagueCheckSimulator"]

    subgraph ChallengeRouting["challenge route branches"]
      phishing["PhishingSimulator"]
      passwords["PasswordLoginSimulator"]
      confidentiality["ConfidentialitySimulator"]
      standard["StandardChallengeSimulator"]
    end

    subgraph MissionOrder["dashboard mission order"]
      sharedIntro["shared intro challenges"]
      officeConf["office confidentiality<br/>when present"]
      sharedCommon["shared common challenges"]
      otherRole["other role-specific challenges"]
      computerUse["computer use last<br/>when present"]
    end
  end

  subgraph Completion["Completion"]
    victory["victory<br/>VictoryView"]
  end

  intro -- "Begin" --> missionIntro

  missionIntro -. "internal stage flow" .-> video
  video -- "Skip / continue" --> warning
  warning -- "The Mission" --> content
  content -- "Prepare defenses" --> roleSelection

  roleSelection --> dashboard

  dashboard -- "Respond now / Revisit mission" --> challenge
  dashboard -- "Check in with a colleague<br/>(only after linked challenge is completed)" --> colleagueCheck

  challenge -. "renders one simulator based on mission type" .-> phishing
  challenge -. "renders one simulator based on mission type" .-> passwords
  challenge -. "renders one simulator based on mission type" .-> confidentiality
  challenge -. "renders one simulator based on mission type" .-> standard

  dashboard -. "mission sequence is assembled from" .-> sharedIntro
  dashboard -. "mission sequence is assembled from" .-> officeConf
  dashboard -. "mission sequence is assembled from" .-> sharedCommon
  dashboard -. "mission sequence is assembled from" .-> otherRole
  dashboard -. "mission sequence is assembled from" .-> computerUse

  challenge -- "finishChallenge()<br/>not all progress complete" --> dashboard
  challenge -- "finishChallenge()<br/>all progress complete" --> victory

  colleagueCheck -- "finishColleagueScenario()<br/>not all progress complete" --> dashboard
  colleagueCheck -- "finishColleagueScenario()<br/>all progress complete" --> victory

  victory -- "Restart training" --> intro
```

## Notes

- `challenge` is a container route that renders one of several simulators based on the active mission type.
- `colleague-check` becomes available from the dashboard after the linked challenge is completed.
- `mission-intro` is one app view with three internal stages: `video`, `warning`, and `content`.
- `victory` depends on total progress completion across both missions and colleague checks.
