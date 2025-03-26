// import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.scss";
import Header from "./components/header";
import CreateSurvey from "./pages/create-survey";
import Predict from "./pages/predict";
import ViewSurvey from "./pages/view-survey";
import Auth from "./pages/auth";
import Surveys from "./pages/profile/surveys";

function App() {
  return (
    <Router>
      <Header />
      {/* header padding */}
      <div className="pt-12"></div>

      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/view-survey/:id" element={<ViewSurvey />} />
        <Route path="/:username/surveys" element={<Surveys />} />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
