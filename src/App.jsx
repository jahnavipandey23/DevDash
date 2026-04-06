import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import KanbanBoard from "./components/KanbanBoard";
import Settings from "./components/Settings";
import { GithubProvider } from "./context/GithubContext";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <GithubProvider>
      <div className="app">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content">
          {activePage === "dashboard" && <Dashboard setActivePage={setActivePage} />}
          {activePage === "projects" && <Projects />}
          {activePage === "kanban" && <KanbanBoard />}
          {activePage === "settings" && <Settings />}
        </main>
      </div>
    </GithubProvider>
  );
}
