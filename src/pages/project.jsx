// src/pages/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { taskApi, projectApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // create task
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
  });

  // add member
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);

      const p = await projectApi.getOne(id);
      const t = await taskApi.getByProject(id);

      setProject(p.project);
      setTasks(t.tasks);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADD MEMBER ----------------
  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;

    try {
      setAddingMember(true);

      await projectApi.addMember(id, memberEmail);

      setMemberEmail("");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  // ---------------- CREATE TASK ----------------
  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    try {
      setCreating(true);

      await taskApi.create(id, {
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
      });

      setForm({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
      });

      setShowCreate(false);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ---------------- UPDATE STATUS / ASSIGN ----------------
  const updateTask = async (taskId, payload) => {
    try {
      await taskApi.update(taskId, payload);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- DELETE TASK ----------------
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await taskApi.delete(taskId);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!project) return <div>Project not found</div>;

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="page-title">{project.name}</div>
          <div className="page-subtitle">{project.description}</div>
        </div>

        {(user.role === "admin" || project.owner === user.id) && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            + Add Task
          </button>
        )}
      </div>

      {/* ---------------- ADD MEMBER ---------------- */}
      {user.role === "admin" && (
        <div className="card mt-16">
          <h4>Add Member</h4>

          <div className="flex gap-12 mt-8">
            <input
              className="input"
              placeholder="Enter user email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />

            <button
              className="btn btn-primary"
              onClick={handleAddMember}
              disabled={addingMember}
            >
              {addingMember ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- MEMBERS LIST ---------------- */}
      <div className="mt-24">
        <h4>Members</h4>

        <div className="flex gap-12 mt-8">
          {Array.isArray(project?.members) &&
            project.members.map((m, index) => (
              <span key={m?._id || index} className="badge">
                {index + 1}. {m?.name || "Unknown"}
              </span>
            ))}
        </div>
      </div>

      {/* ---------------- CREATE TASK ---------------- */}
      {showCreate && (
        <div className="card mt-16">
          <h3>Create Task</h3>

          <form onSubmit={handleCreateTask}>
            <div className="input-group">
              <label className="label">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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

            <div className="input-group">
              <label className="label">Assign To</label>
              <select
                className="input"
                value={form.assignedTo}
                onChange={(e) =>
                  setForm({ ...form, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {project.members?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="flex gap-12 mt-16">
              <button className="btn btn-primary" disabled={creating}>
                {creating ? "Creating..." : "Create Task"}
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

      {/* ---------------- TASK LIST ---------------- */}
      <div className="mt-24">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h4>No tasks yet</h4>
          </div>
        ) : (
          tasks.map((t) => {
            const isOverdue =
              t.dueDate &&
              new Date(t.dueDate) < new Date() &&
              t.status !== "done";

            const canEdit =
              user.role === "admin" || t.assignedTo?._id === user.id;

            return (
              <div key={t._id} className="card mt-16 flex justify-between">
                <div>
                  <div>{t.title}</div>

                  <div className="text-xs text-muted mt-8">
                    Assigned: {t.assignedTo?.name || "None"}
                  </div>
                </div>

                <div className="flex gap-8 items-center">
                  {/* STATUS */}
                  <select
                    className="input"
                    value={t.status}
                    disabled={!canEdit}
                    onChange={(e) =>
                      updateTask(t._id, { status: e.target.value })
                    }
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>

                  {/* REASSIGN (ADMIN ONLY) */}
                  {user.role === "admin" && (
                    <select
                      className="input"
                      value={t.assignedTo?._id || ""}
                      onChange={(e) =>
                        updateTask(t._id, {
                          assignedTo: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {project.members?.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* BADGE */}
                  <span
                    className={`badge ${
                      isOverdue ? "badge-overdue" : `badge-${t.status}`
                    }`}
                  >
                    {isOverdue ? "overdue" : t.status}
                  </span>

                  {/* DELETE */}
                  {(user.role === "admin" || project.owner === user.id) && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTask(t._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
