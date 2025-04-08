export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: number;
  question: string;
  type: string | "multiple choice" | "checkboxes" | "dropdown";
  image: File | null;
  // selected: number[]; // list of choice ids ("multiple choice" / "dropdown" -> list of length 1)
  choices: Choice[];
};

export type DbSurvey = {
  _id: string;
  name: string;
  organization: string;
  user_created: string;
  time_created: Date;
  last_edited: Date;
  published: boolean;
  questions: Question[];
};

export type Survey = {
  name: string;
  organization: string;
  user_created: string;
  time_created: Date;
  last_edited: Date;
  published: boolean;
  questions: Question[];
};

export const isSurvey = (obj: any): obj is Survey => {
  if (!(obj.name && typeof obj.name === "string")) {
    return false;
  }
  if (!(obj.organization && typeof obj.organization === "string")) {
    return false;
  }
  if (!(obj.user_created && typeof obj.user_created === "string")) {
    return false;
  }
  if (!(obj.time_created && obj.time_created instanceof Date)) {
    return false;
  }
  if (!(obj.last_edited && obj.last_edited instanceof Date)) {
    return false;
  }
  if (!(obj.published && typeof obj.published === "boolean")) {
    return false;
  }
  return true;
};

export type SurveyResponse = {
  username: string;
  survey_id: string | undefined;
  time_taken: Date;
  selected: string[][];
  heatmaps: Map<number, string>;
};

export type User = {
  username: string;
  password: string;
  email: string;
  display_name: string;
  organization: string;
  role?: string;
};
