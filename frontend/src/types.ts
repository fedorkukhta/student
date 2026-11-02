export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER'

export type AuthResponse = {
  token: string
  type: string
  expiresIn: number
  roles: string[]
}

export type Student = {
  id: number
  name: string
  surname: string
  phoneNumber?: string | null
  email?: string | null
}

export type StudentListResponse = {
  response: Student[]
  totalCount: number
}

export type User = {
  id: number
  email: string
  roles: Role[]
}

export type UserListResponse = {
  responses: User[]
  totalCount: number
}
