import type {
  AuthResponse,
  Student,
  StudentListResponse,
  User,
  UserListResponse,
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('student_token')
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    let message = `Ошибка запроса (${response.status})`
    try {
      const body = await response.json()
      message = body.message ?? body.error ?? message
    } catch {
      // The API may return an empty response for some errors.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  students: {
    list: () => request<StudentListResponse>('/api/v1/student'),
    get: (id: number) => request<Student>(`/api/v1/student/${id}`),
    create: (student: Omit<Student, 'id'>) =>
      request<Student>('/api/v1/student/save', {
        method: 'POST',
        body: JSON.stringify({
          name: student.name,
          surname: student.surname,
          phone_number: student.phoneNumber,
          email: student.email,
        }),
      }),
    update: (id: number, student: Pick<Student, 'phoneNumber' | 'email'>) =>
      request<Student>(`/api/v1/student/${id}`, {
        method: 'PUT',
        body: JSON.stringify(student),
      }),
    remove: (id: number) =>
      request<void>(`/api/v1/student/${id}`, { method: 'DELETE' }),
  },

  users: {
    list: () => request<UserListResponse>('/api/v1/users'),
    create: (user: { email: string; password: string; roles: string[] }) =>
      request<User>('/api/v1/users/save', {
        method: 'POST',
        body: JSON.stringify(user),
      }),
    remove: (id: number) =>
      request<void>(`/api/v1/users/${id}`, { method: 'DELETE' }),
  },
}
