// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { taskApi, projectApi } from "../services/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // create project state
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);

      const data = await taskApi.dashboard();
      const proj = await projectApi.getAll();

      setStats(data.stats);
      setRecentTasks(data.recentTasks || []);
      setProjects(proj.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    try {
      setCreating(true);

      await projectApi.create({
        name: form.name,
        description: form.description,
      });

      setForm({ name: "", description: "" });
      setShowCreate(false);

      await load(); // refresh dashboard
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ---------------- UI STATES ----------------

  if (loading) {
    return (
      <div className="main-content">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="error-msg">{error}</div>;
  }

  // ---------------- MAIN UI ----------------

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Welcome back, {user?.name}</div>
        </div>

        {user?.role === "admin" && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + New Project
          </button>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreate && (
        <div className="card mt-16">
          <h3>Create Project</h3>

          <form onSubmit={handleCreateProject}>
            <div className="input-group">
              <label className="label">Project Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="label">Description</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-12 mt-16">
              <button className="btn btn-primary" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STATS */}
      <div className="grid-4 mt-24">
        <div className="card">
          <div className="text-muted text-sm">Total Tasks</div>
          <h2>{stats.total}</h2>
        </div>

        <div className="card">
          <div className="text-muted text-sm">Completed</div>
          <h2>{stats.completed}</h2>
        </div>

        <div className="card">
          <div className="text-muted text-sm">Overdue</div>
          <h2 style={{ color: "var(--danger)" }}>{stats.overdue}</h2>
        </div>

        <div className="card">
          <div className="text-muted text-sm">In Progress</div>
          <h2>{stats.inProgress}</h2>
        </div>
      </div>

      {/* PROJECTS */}
      <div className="mt-24">
        <h3>Projects</h3>

        {projects.length === 0 ? (
          <div className="empty-state">
            <h4>No projects yet</h4>
            <p>Create one to get started</p>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              className="card mt-16 flex justify-between items-center"
            >
              <div>
                <Link to={`/projects/${p._id}`}>
                  <strong>{p.name}</strong>
                </Link>

                <div className="text-muted text-sm mt-8">
                  {p.description || "No description"}
                </div>
              </div>

              <div className="text-xs text-muted">
                {p.members?.length || 1} members
              </div>
            </div>
          ))
        )}
      </div>

      {/* RECENT TASKS */}
      <div className="mt-24">
        <h3>Recent Activity</h3>

        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <p>No recent tasks</p>
          </div>
        ) : (
          recentTasks.map((t) => {
            const isOverdue =
              t.dueDate &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "done";

            return (
              <div key={t._id} className="card mt-16 flex justify-between">
                <div>
                  <div>{t.title}</div>

                  <div className="text-xs text-muted mt-8">
                    {t.project?.name}
                  </div>
                </div>

                <span
                  className={`badge ${
                    isOverdue ? "badge-overdue" : `badge-${t.status}`
                  }`}
                >
                  {isOverdue ? "overdue" : t.status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
