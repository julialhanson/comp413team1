// import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.scss";
import Header from "./components/header";
import CreateSurvey from "./pages/create-survey";
import Predict from "./pages/predict";
import ViewSurvey from "./pages/view-survey";
import Auth from "./pages/auth";
import Surveys from "./pages/profile/surveys";
import TimeoutModal from "./components/timeout-modal";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./controllers/user-controller";
import ResponseHistory from "./pages/profile/response-history";
import ViewResponse from "./pages/view-response";

function App() {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  useEffect(() => {
    getCurrentUser().then((response) => {
      if (response === null) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    });
  });

  return (
    <>
      {location.pathname !== "/auth" && <Header />}

      {/* header padding */}
      <div className="pt-12"></div>

      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route
          path="/profile/:username/drafts/:id"
          element={<CreateSurvey />}
        />
        <Route path="/predict" element={<Predict />} />
        <Route path="/view-survey/:id" element={<ViewSurvey />} />
        <Route path="/view-response/:id" element={<ViewResponse />} />
        <Route path="/profile/:username/surveys" element={<Surveys />} />
        <Route
          path="/profile/:username/response-history"
          element={<ResponseHistory />}
        />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>

      {!isLoggedIn && location.pathname !== "/auth" && <TimeoutModal />}
    </>
  );
}

export default App;
