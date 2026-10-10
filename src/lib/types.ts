export type LessonStep = {
  t: number;
  title: string;
  body: string;
};

export type Demo = {
  id: string;
  chapter: string;
  chapterNo: string;
  chapterName: string;
  title: string;
  blurb: string;
  keywords: string;
  formula: string;
  verbal: string;
  proof: string;
  note: string;
  duration: number;
  spin?: boolean;
  steps: LessonStep[];
  create: (ctx: never) => { update: (time: number) => void };
};

export type Chapter = {
  id: string;
  name: string;
};
