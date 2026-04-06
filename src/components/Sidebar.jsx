import { useGithub } from "../context/GithubContext";
import "./Sidebar.css";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "projects", icon: "⬡", label: "Projects" },
  { id: "kanban", icon: "▦", label: "Kanban" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

export default function Sidebar({ activePage, setActivePage }) {
  const { user } = useGithub();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">D</div>
        <span className="logo-text">DevBoard</span>
      </div>

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

      <button className="sidebar-collapse">‹</button>

      <div className="sidebar-user">
        {user?.avatar_url
          ? <img src={user.avatar_url} alt={user.login} className="user-avatar" />
          : <div className="user-avatar-placeholder">{(user?.login || "U")[0].toUpperCase()}</div>
        }
        <div className="user-info">{user ? (
  <>
    <span className="user-name">{user.name || user.login}</span>
    <span className="user-handle">@{user.login}</span>
  </>
) : (
  <>
    <span className="user-name">Not Connected</span>
    <span className="user-handle">Add Token</span>
  </>
)}
        </div>
        <span className="user-logout-icon" title="Sign out">⎋</span>
      </div>
    </aside>
  );
}
