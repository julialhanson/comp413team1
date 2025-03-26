import React from "react";
import { Survey } from "../types";

const SurveyListItem = ({ survey }: { survey: Survey }) => {
  return <div>{survey.name}</div>;
};

export default SurveyListItem;
