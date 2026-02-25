export interface StarterStep {
  id: number;
  titleKey: string;
  explanationKey: string;
  exampleKey: string;
  whyKey: string;
}

export const starterSteps: StarterStep[] = [
  { id: 1, titleKey: "starter.s1Title", explanationKey: "starter.s1Text", exampleKey: "starter.s1Example", whyKey: "starter.s1Why" },
  { id: 2, titleKey: "starter.s2Title", explanationKey: "starter.s2Text", exampleKey: "starter.s2Example", whyKey: "starter.s2Why" },
  { id: 3, titleKey: "starter.s3Title", explanationKey: "starter.s3Text", exampleKey: "starter.s3Example", whyKey: "starter.s3Why" },
  { id: 4, titleKey: "starter.s4Title", explanationKey: "starter.s4Text", exampleKey: "starter.s4Example", whyKey: "starter.s4Why" },
  { id: 5, titleKey: "starter.s5Title", explanationKey: "starter.s5Text", exampleKey: "starter.s5Example", whyKey: "starter.s5Why" },
];
