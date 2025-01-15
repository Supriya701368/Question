import React from "react";
import Msq from "./Msq";
import Mcq from "./Mcq";
import True from "./True";
import Nit from "./Nit";
import { useQuestionManager } from "../hook/useQuestionManager.js";
const QuestionManagement = () => {
  const questionManager = useQuestionManager();

  return (
    <div>
      <h1>Manage Questions</h1>
      <Mcq {...questionManager} />
      <Msq {...questionManager} />
      <Nit {...questionManager} />
      <True {...questionManager} />
    </div>
  );
};

export default QuestionManagement;
