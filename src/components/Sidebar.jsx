import { useGithub } from "../context/GithubContext";
import "./Sidebar.css";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "projects",  icon: "⬡", label: "Projects"  },
  { id: "kanban",    icon: "▦", label: "Kanban"    },
  { id: "settings",  icon: "⚙", label: "Settings"  },
];

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const { appUser, githubUser } = useGithub();

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        <div className="logo-icon">D</div>
        <span className="logo-text">DevBoard</span>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {activePage === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="sidebar-bottom">
        <button className="nav-item nav-logout" onClick={onLogout}>
          <span className="nav-icon">⎋</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>

      {/* USER SECTION */}
      <div className="sidebar-user">
        {githubUser?.avatar_url ? (
          <img
            src={githubUser.avatar_url}
            alt={githubUser.login}
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-placeholder">
            {(appUser?.name || "U")[0].toUpperCase()}
          </div>
        )}

        <div className="user-info">
          {/* App User Name */}
          <span className="user-name">
            {appUser?.name || "User"}
          </span>

          {/* GitHub Status */}
          {githubUser ? (
            <span className="user-handle">@{githubUser.login}</span>
          ) : (
            <span className="user-handle text-muted">
              GitHub not connected
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}