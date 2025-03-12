export type Choice = {
  choice_id: number;
  text: string;
};

export type Question = {
  question_id: number;
  text: string;
  type: string | "multiple choice" | "checkboxes" | "dropdown";
  selected: number[]; // list of choice ids
  options: Choice[];
};
