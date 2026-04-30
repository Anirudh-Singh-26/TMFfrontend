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

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
  });

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
        priority: form.priority,
      });

      setForm({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "medium",
      });

      setShowCreate(false);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateTask = async (taskId, payload) => {
    try {
      await taskApi.update(taskId, payload);
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

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

      {/* CREATE TASK */}
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
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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

      {/* ADD MEMBER */}
      {user.role === "admin" && (
        <div className="card mt-16">
          <h4>Add Member</h4>

          <div className="flex gap-12 mt-8">
            <input
              className="input"
              placeholder="Enter user email"
              value={memberEmail || ""}
              onChange={(e) => setMemberEmail(e.target.value)}
            />

            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!memberEmail.trim()) return;

                try {
                  await projectApi.addMember(project._id, memberEmail);
                  setMemberEmail("");
                  await load();
                } catch (err) {
                  alert(err.message);
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* MEMBERS */}
      <div className="mt-24">
        <h4>Members</h4>

        <div className="flex gap-12 mt-8">
          {project.members?.map((m, index) => {
            const isOwner = project.owner === m._id;
            const isAdminUser = m.name?.toLowerCase() === "admin user";

            const canRemove = user.role === "admin" && !isOwner && !isAdminUser;

            return (
              <div key={m._id} className="flex items-center gap-8">
                <span className="badge">
                  {index + 1}. {m.name}
                  {isOwner && " (Owner)"}
                </span>

                {/* REMOVE BUTTON */}
                {canRemove && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      if (!window.confirm("Remove this member?")) return;

                      try {
                        await projectApi.removeMember(project._id, m._id);
                        await load();
                      } catch (err) {
                        alert(err.message);
                      }
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TASK LIST */}
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
                {/* LEFT */}
                <div>
                  <div>{t.title}</div>

                  <div className="text-xs text-muted mt-8">
                    Assigned: {t.assignedTo?.name || "None"}
                  </div>

                  <div className="text-xs text-muted mt-8">
                    Due:{" "}
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString()
                      : "No deadline"}
                  </div>

                  <div className="text-xs mt-8">
                    Priority:{" "}
                    <span className={`badge badge-${t.priority}`}>
                      {t.priority}
                    </span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex gap-8 items-center">
                  {/* STATUS */}
                  {canEdit && (
                    <select
                      className="input"
                      value={t.status}
                      disabled={isOverdue}
                      onChange={(e) =>
                        updateTask(t._id, {
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  )}

                  {/* ADMIN: ASSIGN */}
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

                  {/* ADMIN: CHANGE DATE */}
                  {user.role === "admin" && (
                    <input
                      type="date"
                      className="input"
                      value={
                        t.dueDate
                          ? new Date(t.dueDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        updateTask(t._id, {
                          dueDate: e.target.value || null,
                        })
                      }
                    />
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
