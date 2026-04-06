import { useState } from "react";
import { useGithub } from "../context/GithubContext";
import "./Settings.css";

function Settings() {
  const { token, user, saveToken, clearToken, fetchRepos, error } = useGithub();
  const [tokenInput, setTokenInput] = useState(token);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveToken(tokenInput);
    fetchRepos();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your DevBoard experience.</p>
      </div>

      <div className="settings-content">
        <div className="settings-section card">
          <div className="settings-section-header">
            <h3>GitHub Authentication</h3>
            <p>Connect your GitHub account to see real-time repository data.</p>
          </div>

          {user && (
            <div className="user-connected">
              <img src={user.avatar_url} alt={user.login} className="settings-avatar" />
              <div>
                <div className="settings-user-name">{user.name || user.login}</div>
                <div className="settings-user-handle">@{user.login} · {user.public_repos} public repos</div>
              </div>
              <span className="connected-badge">✓ Connected</span>
            </div>
          )}

          <div className="form-group" style={{ marginTop: user ? 16 : 0 }}>
            <label>Personal Access Token</label>
            <div className="token-input-row">
              <input
                type={showToken ? "text" : "password"}
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <button className="btn btn-ghost" onClick={() => setShowToken(s => !s)}>
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
            <p className="helper-text">
              Generate a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">github.com/settings/tokens</a> with <code>repo</code> and <code>read:user</code> scopes.
              Without a token, DevBoard uses public GitHub data only.
            </p>
          </div>

          {error && <div className="error-banner">⚠ {error}</div>}

          <div className="settings-actions">
            {token && (
              <button className="btn btn-danger" onClick={clearToken}>Disconnect</button>
            )}
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save & Connect"}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section card">
          <div className="settings-section-header">
            <h3>About DevBoard</h3>
            <p>A GitHub project management dashboard.</p>
          </div>
          <div className="about-list">
            <div className="about-row">
              <span>Real-time GitHub API</span>
              <span className="about-val">✓ Enabled</span>
            </div>
            <div className="about-row">
              <span>Kanban persistence</span>
              <span className="about-val">localStorage</span>
            </div>
            <div className="about-row">
              <span>Backend required</span>
              <span className="about-val">✕ None</span>
            </div>
            <div className="about-row">
              <span>Data storage</span>
              <span className="about-val">Browser only</span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              localStorage.removeItem("kanban_projects");
              window.location.reload();
            }}>
              🗑 Reset Kanban Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;