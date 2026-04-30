const BASE = import.meta.env.VITE_API_URL + "/api";
// const BASE ="/api";


async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const userApi = {
  getAll: () => request("/auth/users"),
};

export const authApi = {
  signup: (name, email, password, role) =>
    request("/auth/signup", {
      method: "POST",
      body: { name, email, password, role },
    }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
};

export const projectApi = {
  getAll: () => request("/projects"),
  getOne: (id) => request(`/projects/${id}`),
  create: (payload) => request("/projects", { method: "POST", body: payload }),
  delete: (id) => request(`/projects/${id}`, { method: "DELETE" }),
  addMember: (id, email) =>
    request(`/projects/${id}/members`, { method: "POST", body: { email } }),
  removeMember: (id, memberId) =>
    request(`/projects/${id}/members/${memberId}`, { method: "DELETE" }),
};

export const taskApi = {
  getByProject: (projectId) => request(`/tasks/project/${projectId}`),
  create: (projectId, payload) =>
    request(`/tasks/project/${projectId}`, { method: "POST", body: payload }),
  update: (taskId, payload) =>
    request(`/tasks/${taskId}`, { method: "PATCH", body: payload }),
  delete: (taskId) => request(`/tasks/${taskId}`, { method: "DELETE" }),
  dashboard: () => request("/tasks/dashboard"),
};
