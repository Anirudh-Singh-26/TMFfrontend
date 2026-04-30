// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { taskApi, projectApi } from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await taskApi.dashboard();
    const proj = await projectApi.getAll();

    setStats(data.stats);
    setProjects(proj.projects);
  };

  if (!stats) return <div className="spinner" />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview</div>
        </div>
      </div>

      <div className="grid-4">
        <div className="card">Total: {stats.total}</div>
        <div className="card">Done: {stats.completed}</div>
        <div className="card">Overdue: {stats.overdue}</div>
        <div className="card">In Progress: {stats.inProgress}</div>
      </div>

      <div className="mt-24">
        <h3>Projects</h3>
        {projects.map((p) => (
          <div key={p._id} className="card mt-16">
            <Link to={`/projects/${p._id}`}>{p.name}</Link>
          </div>
        ))}
      </div>
    </>
  );
}
