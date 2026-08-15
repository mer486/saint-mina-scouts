import { Route, Routes } from "react-router-dom";

import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import StagePage from "./pages/StagePage.jsx";
import CurriculumPage from "./pages/CurriculumPage.jsx";
import FieldPage from "./pages/FieldPage.jsx";
import LecturePage from "./pages/LecturePage.jsx";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/stage/:stageId"
        element={<StagePage />}
      />

      <Route
        path="/stage/:stageId/curriculum"
        element={<CurriculumPage />}
      />

      <Route
        path="/stage/:stageId/curriculum/:fieldId"
        element={<FieldPage />}
      />

      <Route
        path="/stage/:stageId/curriculum/:fieldId/lecture/:lectureId"
        element={<LecturePage />}
      />
    </Routes>
  );
}

export default App;