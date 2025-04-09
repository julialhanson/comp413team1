// import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.scss";
import Header from "./components/header";
import CreateSurvey from "./pages/create-survey";
import Predict from "./pages/predict";
import ViewSurvey from "./pages/view-survey";
import Auth from "./pages/auth";
import Surveys from "./pages/profile/surveys";

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/auth" && <Header />}

      {/* header padding */}
      <div className="pt-12"></div>

      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/view-survey/:id" element={<ViewSurvey />} />
        <Route path="/profile/:username/surveys" element={<Surveys />} />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>
    </>
  );
}

export default App;
