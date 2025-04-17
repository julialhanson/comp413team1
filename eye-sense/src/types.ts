export type Choice = {
  _id?: string;
  id: string;
  text: string;
};

export type Question = {
  _id?: string;
  id: number;
  question: string;
  type: string | "multiple choice" | "checkboxes" | "dropdown";
  image: File | null;
  is_tracking: boolean;
  // selected: number[]; // list of choice ids ("multiple choice" / "dropdown" -> list of length 1)
  choices: Choice[];
};

export type Survey = {
  _id?: string;
  name: string;
  organization: string;
  user_created: string;
  time_created: Date;
  last_edited: Date;
  published: boolean;
  questions: Question[];
};

export type SurveyResponse = {
  _id?: string;
  username: string;
  survey_id: string | undefined;
  survey?: Survey;
  time_taken: Date;
  selected: string[][];
  heatmaps: Map<number, string>;
};

export type User = {
  username: string;
  password: string;
  email: string;
  display_name: string;
  organizations: Set<string>;
  role?: string;
};

export type TokenUser = {
  username: string;
  organization?: string;
  role?: string;
};
