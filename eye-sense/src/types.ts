export type Choice = {
  id: number;
  text: string;
};

export type Question = {
  id: number;
  text: string;
  type: string | "multiple choice" | "checkboxes" | "dropdown";
  selected: number[]; // list of choice ids ("multiple choice" / "dropdown" -> list of length 1)
  options: Choice[];
};

export type Survey = {
  id: string;
  organization: string;
  user_created: string;
  time_created: Date;
  last_edited: Date;
  published: boolean;
  questions: Question[];
};
