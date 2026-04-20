import { createContext, useContext, useState, useEffect, useCallback } from "react";

const GithubContext = createContext(null);

export function GithubProvider({ children }) {
  // ================= STATE =================
  const [token, setToken] = useState(() => localStorage.getItem("gh_token") || "");

  const [appUser, setAppUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("app_user")) || null;
    } catch {
      return null;
    }
  });
  const [githubUser, setGithubUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [kanbanProjects, setKanbanProjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // ================= HEADERS =================
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      }
    : { Accept: "application/vnd.github+json" };
  // ================= FETCH USER =================
  const fetchUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("https://api.github.com/user", { headers });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();

      setGithubUser(data);
      setError("");

      const storedProjects = localStorage.getItem(`kanban_${data.login}`);
      if (storedProjects) {
        setKanbanProjects(JSON.parse(storedProjects));
      } else {
        setKanbanProjects([]);
      }

    } catch (e) {
      setGithubUser(null);
      setError(e.message);
    }
  }, [token]);
  // ================= FETCH REPOS =================
  const fetchRepos = useCallback(async () => {
    if (!token) {
      setRepos([]);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=50",
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
  // ================= SAVE TOKEN =================
  const saveToken = (t) => {
    setToken(t);
    localStorage.setItem("gh_token", t);
  };
  // ================= DISCONNECT =================
  const clearToken = () => {
    setToken("");
    setGithubUser(null);
    setRepos([]);
    setKanbanProjects([]); // UI reset only

    localStorage.removeItem("gh_token");
  };
  // ================= KANBAN =================
  const persistKanban = (data) => {
    if (githubUser?.login) {
      localStorage.setItem(`kanban_${githubUser.login}`, JSON.stringify(data));
    }
  };

  const addKanbanProject = (project) => {
    setKanbanProjects(prev => {
      // Block duplicates by repo id (GitHub's numeric id) or by name (case-insensitive)
      const isDuplicate = prev.some(
        p =>
          (project.repoId && p.repoId === project.repoId) ||
          p.name?.toLowerCase() === project.name?.toLowerCase()
      );
      if (isDuplicate) return prev; // return unchanged state — no re-render needed

      const next = [
        ...prev,
        {
          ...project,
          id: Date.now(),
          updatedAt: new Date().toISOString(),
        },
      ];
      persistKanban(next);
      return next;
    });
  };

  const updateKanbanProject = (id, updates) => {
    setKanbanProjects(prev => {
      const next = prev.map(p =>
        p.id === id ? { ...p, ...updates } : p
      );
      persistKanban(next);
      return next;
    });
  };

  const removeKanbanProject = (id) => {
    setKanbanProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      persistKanban(next);
      return next;
    });
  };
  // ================= EFFECTS =================
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);
  // ================= APP USER PERSIST =================
  useEffect(() => {
    if (appUser) {
      localStorage.setItem("app_user", JSON.stringify(appUser));
    } else {
      localStorage.removeItem("app_user");
    }
  }, [appUser]);
  // ================= STATS =================
  const stats = {
    total: kanbanProjects.length,
    active: kanbanProjects.filter(p => p.status === "in-progress").length,
    completed: kanbanProjects.filter(p => p.status === "done").length,
    highPriority: kanbanProjects.filter(p => p.priority === "high").length,
  };
  // ================= PROVIDER =================
  return (
    <GithubContext.Provider
      value={{
        token,
        appUser,
        setAppUser,
        githubUser,
        repos,
        loading,
        error,
        kanbanProjects,
        stats,
        saveToken,
        clearToken,
        fetchRepos,
        addKanbanProject,
        updateKanbanProject,
        removeKanbanProject,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
}
export const useGithub = () => useContext(GithubContext);