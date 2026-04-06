import { useState } from "react";
import { useGithub } from "../context/GithubContext";
import "./Projects.css";

const LANG_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", Ruby: "#701516",
  "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#563d7c",
  Shell: "#89e051",
};

export default function Projects() {
  const { repos, kanbanProjects, addKanbanProject, loading, fetchRepos } = useGithub();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);

  const languages = ["all", ...new Set(repos.map(r => r.language).filter(Boolean))];

  let filtered = repos.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    const matchLang = langFilter === "all" || r.language === langFilter;
    return matchSearch && matchLang;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "forks") return b.forks_count - a.forks_count;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  const isInKanban = (id) => kanbanProjects.some(p => p.id === id);

  const handleAddToKanban = (repo, priority) => {
    addKanbanProject({
      id: repo.id, name: repo.name,
      description: repo.description || "",
      language: repo.language || "Unknown",
      stars: repo.stargazers_count, forks: repo.forks_count,
      url: repo.html_url, status: "todo", priority,
      updatedAt: repo.updated_at,
    });
    setShowAddModal(false); setSelectedRepo(null);
  };

  return (
    <div className="projects-page fade-in">
      <div className="page-header">
        <div className="projects-header-row">
          <div>
            <h1>Projects</h1>
            <p>Browse and manage your repositories.</p>
          </div>
          <button className="btn btn-ghost" onClick={fetchRepos}>↻ Refresh</button>
        </div>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <input
          type="text" placeholder="Search repositories..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={langFilter} onChange={e => setLangFilter(e.target.value)}>
          {languages.map(l => <option key={l} value={l}>{l === "all" ? "All Languages" : l}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="updated">Recently Updated</option>
          <option value="stars">Most Stars</option>
          <option value="forks">Most Forks</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No repositories found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="repos-grid">
          {filtered.map(repo => (
            <div key={repo.id} className="repo-card card">
              <div className="repo-top">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-name">
                  {repo.name}
                </a>
                {repo.private && <span className="tag" style={{ background: "rgba(139,148,158,0.1)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Private</span>}
                {repo.fork && <span className="tag" style={{ background: "rgba(139,148,158,0.1)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Fork</span>}
              </div>

              <p className="repo-description">
                {repo.description || <em style={{ color: "var(--text-muted)" }}>No description</em>}
              </p>

              <div className="repo-topics">
                {(repo.topics || []).slice(0, 3).map(t => (
                  <span key={t} className="topic-tag">{t}</span>
                ))}
              </div>

              <div className="repo-meta">
                {repo.language && (
                  <span className="repo-lang">
                    <span className="lang-circle" style={{ background: LANG_COLORS[repo.language] || "#8b949e" }} />
                    {repo.language}
                  </span>
                )}
                <span className="repo-stat">⭐ {repo.stargazers_count}</span>
                <span className="repo-stat">⑂ {repo.forks_count}</span>
                <span className="repo-stat" title={new Date(repo.updated_at).toLocaleString()}>
                  {timeAgo(repo.updated_at)}
                </span>
              </div>

              <div className="repo-actions">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  View on GitHub ↗
                </a>
                {isInKanban(repo.id) ? (
                  <span className="btn btn-sm" style={{ background: "rgba(63,185,80,0.1)", color: "var(--accent-green)", border: "1px solid rgba(63,185,80,0.3)", cursor: "default" }}>
                    ✓ In Kanban
                  </span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => { setSelectedRepo(repo); setShowAddModal(true); }}>
                    + Add to Kanban
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && selectedRepo && (
        <AddToKanbanModal
          repo={selectedRepo}
          onAdd={handleAddToKanban}
          onClose={() => { setShowAddModal(false); setSelectedRepo(null); }}
        />
      )}
    </div>
  );
}

function AddToKanbanModal({ repo, onAdd, onClose }) {
  const [priority, setPriority] = useState("medium");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add to Kanban Board</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          Adding <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{repo.name}</strong> to your board.
        </p>
        <div className="form-group">
          <label>Priority</label>
          <div className="priority-select">
            {["high", "medium", "low"].map(p => (
              <button key={p} className={`priority-btn ${priority === p ? "selected" : ""} priority-${p}`}
                onClick={() => setPriority(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onAdd(repo, priority)}>Add to Board</button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
