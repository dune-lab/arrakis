const BASE = import.meta.env.VITE_IMPERIUM_URL as string;

type UserData = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
};

type StudentData = {
  id: string;
  name: string;
  email: string;
  userId: string;
  createdAt: string;
};

type JourneyEvent = {
  id: string;
  name: string;
  createdAt: string;
};

type JourneyData = {
  id: string;
  studentId: string;
  currentStep: string;
  status: string;
  createdAt: string;
  events: JourneyEvent[];
};

export type { JourneyEvent };

export type Me = {
  user: UserData;
  student: StudentData | null;
  journey: JourneyData | null;
};

export type { UserData, StudentData, JourneyData };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export function login(email: string, password: string) {
  return request<{ token: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string, role: string) {
  return request<UserData>('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
}

export function getMe(token: string) {
  return request<Me>('/me', { headers: authHeaders(token) });
}

export function createStudent(name: string, email: string, token: string) {
  return request<StudentData>('/students', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name, email }),
  });
}

export function listStudents(token: string) {
  return request<StudentData[]>('/students', { headers: authHeaders(token) });
}

export function startJourney(studentId: string, token: string) {
  return request<JourneyData>('/journeys', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ studentId }),
  });
}

export function listJourneys(token: string) {
  return request<JourneyData[]>('/journeys', { headers: authHeaders(token) });
}

export function republish(token: string) {
  return request<{ republished: number }>('/journeys/republish', {
    method: 'POST',
    headers: authHeaders(token),
    body: '{}',
  });
}

export type DlqMessage = {
  id: string;
  originalTopic: string;
  name: string;
  payload: string;
  error: string;
  failedAt: string;
  status: string;
  reprocessedAt: string | null;
  createdAt: string;
};

export function listDlq(token: string) {
  return request<DlqMessage[]>('/harkonnen', { headers: authHeaders(token) });
}

export function reprocessDlqOne(id: string, payload: string, token: string) {
  return request<{ reprocessed: boolean }>('/harkonnen/reprocess', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ id, payload }),
  });
}

export function reprocessDlqAllByTopic(topic: string, token: string) {
  return request<{ reprocessed: number }>('/harkonnen/reprocess-all', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ topic }),
  });
}

export function dismissDlq(id: string, token: string) {
  return request<{ dismissed: boolean }>('/harkonnen/dismiss', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ id }),
  });
}
