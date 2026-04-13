import { useState, useEffect } from "react";
import { useGithub } from "../context/GithubContext";
import "./Settings.css";

function Settings() {
  const {
    token,
    githubUser,
    saveToken,
    clearToken,
    fetchRepos,
    error
  } = useGithub();

  const [tokenInput, setTokenInput] = useState("");
  const [showToken, setShowToken]   = useState(false);
  const [saved, setSaved]           = useState(false);

  //  Sync token with input (IMPORTANT FIX)
  useEffect(() => {
    setTokenInput(token || "");
  }, [token]);

  //  Save & connect GitHub
  const handleSave = async () => {
    if (!tokenInput.trim()) return;

    saveToken(tokenInput);
    await fetchRepos();

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  //  Disconnect ONLY GitHub (no logout)
  const handleDisconnect = () => {
    clearToken();
    setTokenInput("");
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your GitHub connection and preferences.</p>
      </div>

      <div className="settings-content">
        <div className="settings-section card">

          {/* HEADER */}
          <div className="settings-section-header">
            <h3>GitHub Integration</h3>
            <p>
              Connect your GitHub account to fetch repositories and track projects.
            </p>
          </div>

          {/*  CONNECTED USER */}
          {githubUser && (
            <div className="user-connected">
              <img
                src={githubUser.avatar_url}
                alt={githubUser.login}
                className="settings-avatar"
              />
              <div>
                <div className="settings-user-name">
                  {githubUser.name || githubUser.login}
                </div>
                <div className="settings-user-handle">
                  @{githubUser.login} · {githubUser.public_repos} repos
                </div>
              </div>
              <span className="connected-badge">✓ Connected</span>
            </div>
          )}

          {/* TOKEN INPUT */}
          <div className="form-group" style={{ marginTop: githubUser ? 16 : 0 }}>
            <label>Personal Access Token</label>

            <div className="token-input-row">
              <input
                type={showToken ? "text" : "password"}
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxx"
              />

              <button
                className="btn btn-ghost"
                onClick={() => setShowToken(s => !s)}
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>

            <p className="helper-text">
              Generate a token at{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/settings/tokens
              </a>{" "}
              with <code>repo</code> and <code>read:user</code> scopes.
            </p>
          </div>

          {/* ERROR */}
          {error && <div className="error-banner">⚠ {error}</div>}

          {/* ACTIONS */}
          <div className="settings-actions">

            {/* Disconnect only if token exists */}
            {token && (
              <button className="btn btn-danger" onClick={handleDisconnect}>
                Disconnect GitHub
              </button>
            )}

            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? "✓ Connected!" : "Save & Connect"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;