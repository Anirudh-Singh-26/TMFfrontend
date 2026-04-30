// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { taskApi, projectApi } from "../services/api";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const p = await projectApi.getOne(id);
    const t = await taskApi.getByProject(id);

    setProject(p.project);
    setTasks(t.tasks);
  };

  if (!project) return <div className="spinner" />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{project.name}</div>
          <div className="page-subtitle">{project.description}</div>
        </div>
      </div>

      <div>
        {tasks.map((t) => (
          <div key={t._id} className="card mt-16">
            <div>{t.title}</div>
            <span className={`badge badge-${t.status}`}>{t.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}
