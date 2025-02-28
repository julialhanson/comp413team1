export type Option = {
  id: number;
  text: string;
};

export type Question = {
  text: string;
  type: string | "multiple choice" | "checkboxes" | "dropdown";
  selected: number[];
  options: Option[];
};
