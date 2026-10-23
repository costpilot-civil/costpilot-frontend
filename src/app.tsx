import { useState } from "react";

import Sidebar from "./components/sidebar";
import DashboardPage from "./pages/dashboard-page";
import ProjectRegistrationPage from "./pages/project-registration-page";
import ProjectsPage from "./pages/projects-page";
import SettingsPage from "./pages/settings-page";
import ProjectDetailPage from "./pages/project-detail-page";

type ReturnPage = "dashboard" | "projects";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const [returnPage, setReturnPage] = useState<ReturnPage>("dashboard");

  function openProjectRegistration() {
    if (activePage === "dashboard" || activePage === "projects") {
      setReturnPage(activePage);
    }

    setActivePage("project-registration");
  }

  function openProjectDetail(projectId: string) {
    if (activePage === "dashboard" || activePage === "projects") {
      setReturnPage(activePage);
    }

    setCurrentProjectId(projectId);
    setActivePage("project-detail");
  }

  function goBack() {
    setActivePage(returnPage);
  }

  function renderPage() {
    switch (activePage) {
      case "projects":
        return <ProjectsPage />;

      case "project-registration":
        return (
          <ProjectRegistrationPage
            backTo={returnPage}
            onCancel={goBack}
            onCreated={(projectId) => {
              setCurrentProjectId(projectId);
              setActivePage("project-detail");
            }}
          />
        );

      case "project-detail":
        if (!currentProjectId) {
          return null;
        }

        return (
          <ProjectDetailPage
            projectId={currentProjectId}
            backTo={returnPage}
            onBack={goBack}
          />
        );

      case "settings":
        return <SettingsPage />;

      case "dashboard":
      default:
        return (
          <DashboardPage
            onNewProject={openProjectRegistration}
            onOpenProject={openProjectDetail}
          />
        );
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;