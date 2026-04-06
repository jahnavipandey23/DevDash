import { createContext, useContext, useState, useEffect, useCallback } from "react";

const GithubContext = createContext(null);

export function GithubProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("gh_token") || "");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kanbanProjects, setKanbanProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kanban_projects") || "[]"); } catch { return []; }
  });

  const headers = token ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } : { Accept: "application/vnd.github+json" };

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("https://api.github.com/user", { headers });
      if (!res.ok) throw new Error("Invalid token");
      const data = await res.json();
      setUser(data);
      setError("");
    } catch (e) { setError(e.message); setUser(null); }
  }, [token]);

const fetchRepos = useCallback(async () => {
if (!token) {
  setRepos([]);
  setKanbanProjects([]);
  localStorage.removeItem("kanban_projects"); 
  setError("NO_TOKEN");
  return;
}

  setLoading(true);
  try {
    const res = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator",
      { headers }
    );

    if (!res.ok) throw new Error("Failed to fetch repos");

    const data = await res.json();
    setRepos(data);
    setError("");

  } catch (e) {
    setError(e.message);
  }
  setLoading(false);
}, [token]);

  const saveToken = (t) => {
    setToken(t);
    localStorage.setItem("gh_token", t);
  };

  const clearToken = () => {
    setToken(""); setUser(null);
    localStorage.removeItem("gh_token");
  };

  const updateKanbanProject = (id, updates) => {
    setKanbanProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem("kanban_projects", JSON.stringify(next));
      return next;
    });
  };

  const addKanbanProject = (project) => {
    setKanbanProjects(prev => {
      const next = [...prev, { ...project, id: Date.now() }];
      localStorage.setItem("kanban_projects", JSON.stringify(next));
      return next;
    });
  };

  const removeKanbanProject = (id) => {
    setKanbanProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem("kanban_projects", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { fetchRepos(); }, [fetchRepos]);

  const stats = {
    total: kanbanProjects.length,
    active: kanbanProjects.filter(p => p.status === "in-progress").length,
    completed: kanbanProjects.filter(p => p.status === "done").length,
    highPriority: kanbanProjects.filter(p => p.priority === "high").length,
  };

  return (
    <GithubContext.Provider value={{
      token, user, repos, loading, error,
      kanbanProjects, stats,
      saveToken, clearToken, fetchRepos,
      updateKanbanProject, addKanbanProject, removeKanbanProject,
    }}>
      {children}
    </GithubContext.Provider>
  );
}

export const useGithub = () => useContext(GithubContext);
