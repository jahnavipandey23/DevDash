import { useState, useRef, useMemo } from "react";
import { useGithub } from "../context/GithubContext";
import "./KanbanBoard.css";

const COLUMNS = [
  { id: "todo",        label: "To Do",       color: "#8b949e", icon: "○" },
  { id: "in-progress", label: "In Progress", color: "#388bfd", icon: "◑" },
  { id: "review",      label: "In Review",   color: "#d29922", icon: "◐" },
  { id: "done",        label: "Done",        color: "#3fb950", icon: "●" },
];

const PRIORITY_STYLE = {
  high:   { bg: "rgba(248,81,73,0.15)",  color: "var(--accent-red)"    },
  medium: { bg: "rgba(210,153,34,0.15)", color: "var(--accent-orange)" },
  low:    { bg: "rgba(56,139,253,0.15)", color: "var(--accent-blue)"   },
};

export default function KanbanBoard() {
  const { kanbanProjects, updateKanbanProject, removeKanbanProject } = useGithub();
  const [dragCard, setDragCard] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [editCard, setEditCard] = useState(null);
  const [filter, setFilter] = useState("all");
  const dragNode = useRef(null);

  // Deduplicate by id first, then by name as a fallback
  const uniqueProjects = useMemo(() => {
    const seenIds = new Set();
    const seenNames = new Set();
    return kanbanProjects.filter((p) => {
      const dupId   = seenIds.has(p.id);
      const dupName = seenNames.has(p.name?.toLowerCase());
      if (dupId || dupName) return false;
      seenIds.add(p.id);
      seenNames.add(p.name?.toLowerCase());
      return true;
    });
  }, [kanbanProjects]);

  const getByCol = (col) =>
    uniqueProjects.filter(
      (p) => p.status === col && (filter === "all" || p.priority === filter)
    );

  const handleDragStart = (e, card) => {
    setDragCard(card);
    dragNode.current = e.target;
    setTimeout(() => dragNode.current?.classList.add("dragging"), 0);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    dragNode.current?.classList.remove("dragging");
    setDragCard(null); setDragOver(null); dragNode.current = null;
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (dragCard?.status !== colId) updateKanbanProject(dragCard.id, { status: colId });
    setDragOver(null); setDragCard(null);
  };

  return (
    <div className="kanban-page fade-in">
      <div className="page-header">
        <div className="kanban-header-row">
          <div>
            <h1>Kanban Board</h1>
            <p>Drag and drop to update project status.</p>
          </div>
          <div className="kanban-filters">
            {["all","high","medium","low"].map(f => (
              <button key={f}
                className={`filter-pill ${filter===f?"active":""} ${f!=="all"?`filter-${f}`:""}`}
                onClick={()=>setFilter(f)}>
                {f==="all"?"All":f[0].toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNS.map(col => {
          const cards = getByCol(col.id);
          return (
            <div key={col.id} className={`kanban-column ${dragOver===col.id?"drag-over":""}`}
                 onDragOver={e=>{e.preventDefault(); e.dataTransfer.dropEffect="move"; setDragOver(col.id);}}
                 onDragLeave={()=>setDragOver(null)}
                 onDrop={e=>handleDrop(e,col.id)}>
              <div className="column-header">
                <div className="column-title">
                  <span className="col-icon" style={{color:col.color}}>{col.icon}</span>
                  <span className="col-label">{col.label}</span>
                </div>
                <span className="col-count" style={{background:`${col.color}22`,color:col.color}}>{cards.length}</span>
              </div>
              <div className={`column-cards ${dragOver===col.id?"drop-zone":""}`}>
                {cards.length===0 && <div className={`empty-drop ${dragOver===col.id?"visible":""}`}>Drop here</div>}
                {cards.map(card => (
                  <KanbanCard key={card.id} card={card}
                    onDragStart={e=>handleDragStart(e,card)}
                    onDragEnd={handleDragEnd}
                    onEdit={()=>setEditCard(card)}
                    onRemove={()=>removeKanbanProject(card.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editCard && (
        <EditCardModal
          card={editCard}
          onSave={updates => { updateKanbanProject(editCard.id, updates); setEditCard(null); }}
          onClose={() => setEditCard(null)}
        />
      )}
    </div>
  );
}

function KanbanCard({ card, onDragStart, onDragEnd, onEdit, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="kanban-card" draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="card-header">
        <a href={card.url} target="_blank" rel="noopener noreferrer" className="card-name">{card.name}</a>
        <div className="card-menu-wrapper">
          <button className="card-menu-btn" onClick={()=>setMenuOpen(o=>!o)}>⋯</button>
          {menuOpen && (
            <div className="card-menu" onMouseLeave={()=>setMenuOpen(false)}>
              <button onClick={()=>{onEdit(); setMenuOpen(false);}}>✎ Edit</button>
              <button onClick={()=>{onRemove(); setMenuOpen(false);}} className="menu-danger">✕ Remove</button>
            </div>
          )}
        </div>
      </div>
      {card.description && (
        <p className="card-desc">
          {card.description.slice(0, 80)}{card.description.length > 80 ? "…" : ""}
        </p>
      )}
      <div className="card-footer">
        <div className="card-meta">{card.stars > 0 && <span className="card-stat">⭐{card.stars}</span>}</div>
        <span className={`tag tag-${card.priority}`}>{card.priority}</span>
      </div>
    </div>
  );
}

function EditCardModal({ card, onSave, onClose }) {
  const [priority,    setPriority]    = useState(card.priority);
  const [status,      setStatus]      = useState(card.status);
  const [description, setDescription] = useState(card.description);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{fontFamily:"var(--font-mono)",fontSize:14}}>{card.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3}/>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            {COLUMNS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Priority</label>
          <div style={{display:"flex",gap:8}}>
            {["high","medium","low"].map(p=>(
              <button key={p}
                className={`priority-btn ${priority===p?"selected":""} priority-${p}`}
                onClick={()=>setPriority(p)}
                style={{
                  flex:1, padding:"7px",
                  border:`1px solid ${priority===p ? PRIORITY_STYLE[p].color : "var(--border)"}`,
                  borderRadius:"var(--radius)",
                  background:priority===p ? PRIORITY_STYLE[p].bg : "var(--bg-surface)",
                  color:priority===p ? PRIORITY_STYLE[p].color : "var(--text-secondary)",
                  cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:13, transition:"all 0.2s"
                }}>
                {p[0].toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave({priority,status,description})}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}