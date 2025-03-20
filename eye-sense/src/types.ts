export type Choice = {
  _id: string;
  text: string;
};

export type Question = {
  id: number;
  question: string;
  type: string | "multiple choice" | "checkboxes" | "dropdown";
  // selected: number[]; // list of choice ids ("multiple choice" / "dropdown" -> list of length 1)
  choices: Choice[];
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

export type SurveyResponse = {
  username: string;
	survey_id: string | undefined;
	time_taken: Date;
	selected: string[][];
	heatmaps: Map<number, string>;
}