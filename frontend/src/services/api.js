const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Não foi possível concluir a operação.');
  }
  return data;
}

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function fetchProjects(token) {
  return request('/projects', { token });
}

export function fetchClasses(token) {
  return request('/projects/classes', { token });
}

export function fetchClassStudents(token, classId) {
  return request(`/projects/classes/${encodeURIComponent(classId)}/students`, { token });
}

export function updateTaskStatus(token, taskId) {
  return request(`/projects/tasks/${taskId}/status`, { method: 'PATCH', token, body: {} });
}

export function updateTask(token, taskId, payload) {
  return request(`/projects/tasks/${taskId}`, { method: 'PATCH', token, body: payload });
}

export function deleteTask(token, taskId) {
  return request(`/projects/tasks/${taskId}`, { method: 'DELETE', token });
}

export function createTask(token, groupId, payload) {
  return request(`/projects/groups/${groupId}/tasks`, { method: 'POST', token, body: payload });
}

export function createTaskRequest(token, groupId, payload) {
  return request(`/projects/groups/${groupId}/requests`, { method: 'POST', token, body: payload });
}

export function resolveTaskRequest(token, requestId, aprovar) {
  return request(`/projects/requests/${requestId}/resolve`, { method: 'POST', token, body: { aprovar } });
}

export function updateGroupGrade(token, groupId, notaColetiva) {
  return request(`/projects/groups/${groupId}/grade`, { method: 'PATCH', token, body: { notaColetiva } });
}

export function createProjectWithAI(token, payload) {
  return request('/projects/ai', { method: 'POST', token, body: payload });
}

export function deleteProject(token, projectId) {
  return request(`/projects/${projectId}`, { method: 'DELETE', token });
}

export function sendTaskMessage(token, taskId, message) {
  return request(`/projects/tasks/${taskId}/chat`, { method: 'POST', token, body: { message } });
}

export function fetchCalendarEvents(token) {
  return request('/calendar', { token });
}

export function createCalendarEvent(token, payload) {
  return request('/calendar', { method: 'POST', token, body: payload });
}

export function deleteCalendarEvent(token, eventId) {
  return request(`/calendar/${eventId}`, { method: 'DELETE', token });
}
