import { useGithub } from "../context/GithubContext";
import "./Dashboard.css";

const LANG_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", Ruby: "#701516",
  "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#563d7c",
  Shell: "#89e051", Unknown: "#8b949e",
};

export default function Dashboard({ setActivePage }) {
  const { user, kanbanProjects, stats, loading, repos } = useGithub();

  // Priority distribution
  const high = kanbanProjects.filter(p => p.priority === "high").length;
  const medium = kanbanProjects.filter(p => p.priority === "medium").length;
  const low = kanbanProjects.filter(p => p.priority === "low").length;
  const maxBar = Math.max(high, medium, low, 1);

  // Language stats from repos
  const langCount = {};
  repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const totalLang = Object.values(langCount).reduce((a, b) => a + b, 0) || 1;
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recent activity
  const recent = [...kanbanProjects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  const statCards = [
    { label: "Total Projects", value: stats.total, icon: "⬡", color: "blue" },
    { label: "Active", value: stats.active, icon: "◎", color: "green" },
    { label: "Completed", value: stats.completed, icon: "✓", color: "teal" },
    { label: "High Priority", value: stats.highPriority, icon: "⚠", color: "red" },
  ];

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
       {!user ? (
  <div className="no-token">
    <h2>🔑 Enter your Personal Access Token</h2>
    <p>Go to Settings and connect your GitHub account.</p>
  </div>
) : (
  <>
    <h1>Welcome back, {user.name || user.login} 👋</h1>
    <p>Here's an overview of your projects.</p>
  </>
)}
      </div>

      {/* Stat Cards */}
      <div className="dash-stats">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card stat-${s.color}`}>
            <div className="stat-top">
              <span className="stat-label">{s.label.toUpperCase()}</span>
              <span className="stat-icon">{s.icon}</span>
            </div>
            <div className="stat-value">{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      <div className="dash-charts">
        {/* Priority Distribution Bar Chart */}
        <div className="card chart-card">
          <h3 className="chart-title">Priority Distribution</h3>
          <div className="bar-chart">
            {[{ label: "High", count: high, color: "var(--accent-red)" },
              { label: "Medium", count: medium, color: "var(--accent-orange)" },
              { label: "Low", count: low, color: "var(--accent-blue)" }].map(bar => (
              <div key={bar.label} className="bar-group">
                <div className="bar-track">
                  <div className="bar-y-labels">
                    {[8, 6, 4, 2, 0].map(n => (
                      <span key={n} className="bar-y-label">{n}</span>
                    ))}
                  </div>
                  <div className="bar-fill-wrapper">
                    <div
                      className="bar-fill"
                      style={{ height: `${(bar.count / maxBar) * 100}%`, background: bar.color }}
                      title={`${bar.count} projects`}
                    />
                  </div>
                </div>
                <span className="bar-label">{bar.label}</span>
              </div>
            ))}
            <div className="bar-axis-lines">
              {[0,1,2,3,4].map(i => <div key={i} className="axis-line" />)}
            </div>
          </div>
        </div>

        {/* Languages Donut */}
        <div className="card chart-card">
          <h3 className="chart-title">Languages</h3>
          <div className="donut-wrapper">
            <DonutChart langs={topLangs} total={totalLang} />
          </div>
          <div className="lang-legend">
            {topLangs.map(([lang, count]) => (
              <span key={lang} className="lang-dot">
                <span className="dot" style={{ background: LANG_COLORS[lang] || "#8b949e" }} />
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card dash-recent" style={{ margin: "0 32px 32px" }}>
        <div className="section-header">
          <h3>Recent Projects</h3>
          <button className="btn btn-ghost" onClick={() => setActivePage("projects")}>View all →</button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📂</div><h3>No projects yet</h3></div>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Project</th><th>Language</th><th>Priority</th><th>Status</th><th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id}>
                  <td>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="project-link">
                      {p.name}
                    </a>
                  </td>
                  <td>
                    <span className="lang-badge" style={{ background: `${LANG_COLORS[p.language] || "#8b949e"}22`, color: LANG_COLORS[p.language] || "#8b949e" }}>
                      {p.language || "—"}
                    </span>
                  </td>
                  <td><span className={`tag tag-${p.priority}`}>{p.priority}</span></td>
                  <td><span className={`tag ${p.status === "done" ? "tag-completed" : "tag-active"}`}>{p.status}</span></td>
                  <td className="text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DonutChart({ langs, total }) {
  const size = 160; const cx = 80; const cy = 80;
  const outerR = 68; const innerR = 44;
  let startAngle = -Math.PI / 2;

  const slices = langs.map(([lang, count]) => {
    const angle = (count / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    const slice = { lang, d, color: LANG_COLORS[lang] || "#8b949e" };
    startAngle = endAngle;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={innerR - 2} fill="var(--bg-base)" />
      {slices.map(s => (
        <path key={s.lang} d={s.d} fill={s.color} opacity={0.9} stroke="var(--bg-card)" strokeWidth="2" />
      ))}
    </svg>
  );
}
