import { useGithub } from "../context/GithubContext";
import "./Dashboard.css";

const PRIORITY_COLORS = {
  high:   "var(--accent-red)",
  medium: "var(--accent-orange)",
  low:    "var(--accent-blue)",
};

const LANG_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", Ruby: "#701516",
  "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#563d7c",
  Shell: "#89e051", Unknown: "#8b949e",
};

export default function Dashboard({ setActivePage }) {
  const { appUser, githubUser, kanbanProjects = [], stats = {}, loading } = useGithub();

  // Safe counts
  const high   = kanbanProjects.filter(p => p.priority === "high").length;
  const medium = kanbanProjects.filter(p => p.priority === "medium").length;
  const low    = kanbanProjects.filter(p => p.priority === "low").length;
  const maxBar = Math.max(high, medium, low, 1);

  // Recent projects
  const recent = [...kanbanProjects]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  // Safe stats
  const statCards = [
    { label: "Total Projects", value: stats?.total || 0,        icon: "⬡", color: "blue"  },
    { label: "Active",         value: stats?.active || 0,       icon: "◎", color: "green" },
    { label: "Completed",      value: stats?.completed || 0,    icon: "✓", color: "teal"  },
    { label: "High Priority",  value: stats?.highPriority || 0, icon: "⚠", color: "red"   },
  ];

  return (
    <div className="dashboard fade-in">

      {/* ================= HEADER ================= */}
      <div className="page-header">
        <h1>
          Welcome back, {appUser?.name || "Developer"} 👋
        </h1>
        <p>Overview of your active projects and your progress.</p>

        {/* GitHub not connected */}
        {!githubUser && (
  <div className="github-hero-alert">
    <div className="github-glow-ring"></div>

    <div className="github-alert-content">
      <div className="github-icon-wrap">
        <div className="github-floating-icon">🔗</div>
      </div>

      <div className="github-alert-text">
        <h2>Connect GitHub & Unlock Insights</h2>
        <p>
          Sync your repositories, track repos, and unlock live project analytics.
        </p>
      </div>

      <button
        className="github-connect-btn"
        onClick={() => setActivePage("settings")}
      >
        Connect Now →
      </button>
    </div>
  </div>
)}
      </div>

      {/* ================= STATS ================= */}
      <div className="dash-stats">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card stat-${s.color}`}>
            <div className="stat-top">
              <span className="stat-label">{s.label.toUpperCase()}</span>
              <span className="stat-icon">{s.icon}</span>
            </div>
            <div className="stat-value">
              {loading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHART ================= */}
      <div className="dash-charts">
        <div className="card chart-card">
          <h3 className="chart-title">Priority Distribution</h3>

          <div className="bar-chart">
            {[
              { label: "High",   count: high,   color: PRIORITY_COLORS.high   },
              { label: "Medium", count: medium, color: PRIORITY_COLORS.medium },
              { label: "Low",    count: low,    color: PRIORITY_COLORS.low    },
            ].map(bar => (
              <div key={bar.label} className="bar-group">

                <div className="bar-track">
  <div className="bar-fill-wrapper">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${(bar.count / maxBar) * 100}%`,
                        background: bar.color
                      }}
                      title={`${bar.count} projects`}
                    />
                  </div>
                </div>

                <span className="bar-label">{bar.label}</span>
              </div>
            ))}

            <div className="bar-axis-lines">
              {[0,1,2,3,4].map(i => (
                <div key={i} className="axis-line" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ================= */}
      <div className="card dash-recent" style={{ margin: "0 32px 32px" }}>
        <div className="section-header">
          <h3>Recent Projects</h3>
          <button
            className="btn btn-ghost"
            onClick={() => setActivePage("projects")}
          >
            View all →
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No projects yet</h3>
          </div>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Language</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recent.map(p => (
                <tr key={p.id}>
                  <td>
                    <a
                      href={p.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      {p.name}
                    </a>
                  </td>

                  <td>
                    <span
                      className="lang-badge"
                      style={{
                        background: `${LANG_COLORS[p.language] || "#8b949e"}22`,
                        color: LANG_COLORS[p.language] || "#8b949e"
                      }}
                    >
                      {p.language || "—"}
                    </span>
                  </td>

                  <td>
                    <span className={`tag tag-${p.priority}`}>
                      {p.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`tag ${p.status === "done" ? "tag-completed" : "tag-active"}`}>
                      {p.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}