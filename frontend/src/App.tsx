import { FormEvent, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import type { AuthResponse, Role, Student, User } from './types'

const TOKEN_KEY = 'student_token'
const ROLES_KEY = 'student_roles'

function getStoredRoles(): Role[] {
  try {
    return JSON.parse(localStorage.getItem(ROLES_KEY) ?? '[]') as Role[]
  } catch {
    return []
  }
}

function normalizeRoles(roles: string[]): Role[] {
  return roles.map((role) => role.replace(/^ROLE_/, '') as Role)
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [roles, setRoles] = useState<Role[]>(getStoredRoles)

  const signIn = (auth: AuthResponse) => {
    const normalized = normalizeRoles(auth.roles)
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(ROLES_KEY, JSON.stringify(normalized))
    setToken(auth.token)
    setRoles(normalized)
  }

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLES_KEY)
    setToken(null)
    setRoles([])
  }

  return token ? (
    <Dashboard roles={roles} onSignOut={signOut} />
  ) : (
    <Login onSuccess={signIn} />
  )
}

function Login({ onSuccess }: { onSuccess: (auth: AuthResponse) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      onSuccess(await api.login(email, password))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось войти')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-art">
        <div className="brand-mark">S</div>
        <p className="eyebrow">STUDENT PLATFORM</p>
        <h1>Порядок в данных. Спокойствие в работе.</h1>
        <p className="muted-light">
          Единая панель для студентов, преподавателей и администраторов.
        </p>
        <img
          className="login-art-image"
          src="/student-study.png"
          alt="Учебные материалы"
        />
        <div className="art-shape shape-one" />
        <div className="art-shape shape-two" />
      </section>
      <section className="login-card">
        <div>
          <p className="eyebrow">Добро пожаловать</p>
          <h2>Вход в Student</h2>
          <p className="muted">Введите данные учетной записи, чтобы продолжить.</p>
        </div>
        <form onSubmit={submit} className="stack-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@school.ru"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="button primary wide" disabled={loading}>
            {loading ? 'Проверяем...' : 'Войти в систему'}
          </button>
        </form>
        <p className="login-hint">Для локального запуска: admin@example.com / admin</p>
      </section>
    </main>
  )
}

function Dashboard({
  roles,
  onSignOut,
}: {
  roles: Role[]
  onSignOut: () => void
}) {
  const [activePage, setActivePage] = useState<'students' | 'users'>('students')
  const [mobileMenu, setMobileMenu] = useState(false)

  const canManageUsers = roles.includes('SUPER_ADMIN')
  const roleLabel = roles.includes('SUPER_ADMIN')
    ? 'Супер-администратор'
    : roles.includes('ADMIN')
      ? 'Администратор'
      : 'Преподаватель'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark small">S</div>
          <strong>Student</strong>
        </div>
        <nav>
          <p className="nav-caption">Рабочая область</p>
          <button
            className={`nav-item ${activePage === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('students')
              setMobileMenu(false)
            }}
          >
            <span className="nav-icon">⌂</span> Студенты
          </button>
          {canManageUsers && (
            <button
              className={`nav-item ${activePage === 'users' ? 'active' : ''}`}
              onClick={() => {
                setActivePage('users')
                setMobileMenu(false)
              }}
            >
              <span className="nav-icon">♙</span> Пользователи
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <img className="help-image" src="/graduation-cap.png" alt="" />
            <span className="help-icon">?</span>
            <div>
              <strong>Нужна помощь?</strong>
              <small>Обратитесь к администратору</small>
            </div>
          </div>
          <button className="nav-item logout" onClick={onSignOut}>
            <span className="nav-icon">↪</span> Выйти
          </button>
        </div>
      </aside>
      {mobileMenu && <button className="mobile-backdrop" onClick={() => setMobileMenu(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileMenu(true)}>☰</button>
          <div className="breadcrumbs">Рабочая область <span>/</span> {activePage === 'students' ? 'Студенты' : 'Пользователи'}</div>
          <div className="profile">
            <div className="avatar">А</div>
            <div className="profile-copy">
              <strong>{roleLabel}</strong>
              <small>{roles.join(' · ')}</small>
            </div>
          </div>
        </header>
        <div className="page-content">
          {activePage === 'students' ? <StudentsPage roles={roles} /> : <UsersPage />}
        </div>
      </main>
    </div>
  )
}

function StudentsPage({ roles }: { roles: Role[] }) {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Student | null>(null)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const canEdit = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')

  const loadStudents = async () => {
    setLoading(true)
    try {
      const result = await api.students.list()
      setStudents(result.response)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить студентов')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStudents()
  }, [])

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return students
    return students.filter((student) =>
      [student.name, student.surname, student.email, student.phoneNumber]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(value)),
    )
  }, [search, students])

  async function remove(student: Student) {
    if (!window.confirm(`Удалить студента ${student.name} ${student.surname}?`)) return
    try {
      await api.students.remove(student.id)
      setStudents((current) => current.filter((item) => item.id !== student.id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось удалить студента')
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Управление данными</p>
          <h1>Студенты</h1>
          <p className="muted">Список студентов и их контактная информация</p>
        </div>
        {canEdit && (
          <button className="button primary" onClick={() => setModal('create')}>
            <span>＋</span> Добавить студента
          </button>
        )}
      </div>
      <div className="stats-grid">
        <StatCard label="Всего студентов" value={students.length} icon="◉" tone="blue" />
        <StatCard label="С контактами" value={students.filter((student) => student.email || student.phoneNumber).length} icon="✦" tone="green" />
        <StatCard label="Показано сейчас" value={filtered.length} icon="⌕" tone="orange" />
      </div>
      <section className="panel">
        <div className="panel-toolbar">
          <div>
            <h3>Все студенты</h3>
            <span className="muted">{students.length} записей в системе</span>
          </div>
          <label className="search-box">
            <span>⌕</span>
            <input
              placeholder="Поиск по имени, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <div className="empty-state">Загружаем список студентов...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">Студенты не найдены.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Студент</th><th>Email</th><th>Телефон</th><th>Статус</th>{canEdit && <th />}</tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="person-cell">
                        <div className="person-avatar">{student.name[0]}{student.surname[0]}</div>
                        <div><strong>{student.name} {student.surname}</strong><small>ID: {student.id}</small></div>
                      </div>
                    </td>
                    <td>{student.email || <span className="muted">Не указан</span>}</td>
                    <td>{student.phoneNumber || <span className="muted">Не указан</span>}</td>
                    <td><span className="status"><i /> Активен</span></td>
                    {canEdit && (
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" title="Редактировать" onClick={() => { setSelected(student); setModal('edit') }}>✎</button>
                          <button className="icon-button danger-text" title="Удалить" onClick={() => void remove(student)}>⌫</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {modal && (
        <StudentModal
          mode={modal}
          student={selected}
          onClose={() => { setModal(null); setSelected(null) }}
          onSaved={() => { setModal(null); setSelected(null); void loadStudents() }}
        />
      )}
    </>
  )
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>
}

function StudentModal({
  mode,
  student,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  student: Student | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(student?.name ?? '')
  const [surname, setSurname] = useState(student?.surname ?? '')
  const [email, setEmail] = useState(student?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(student?.phoneNumber ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'create') {
        await api.students.create({ name, surname, email, phoneNumber })
      } else if (student) {
        await api.students.update(student.id, { email, phoneNumber })
      }
      onSaved()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось сохранить данные')
    } finally {
      setLoading(false)
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-heading"><div><p className="eyebrow">{mode === 'create' ? 'Новая запись' : 'Изменение данных'}</p><h2>{mode === 'create' ? 'Добавить студента' : 'Редактировать студента'}</h2></div><button type="button" className="close-button" onClick={onClose}>×</button></div>
      <div className="form-grid">
        <label>Имя<input value={name} onChange={(event) => setName(event.target.value)} disabled={mode === 'edit'} required /></label>
        <label>Фамилия<input value={surname} onChange={(event) => setSurname(event.target.value)} disabled={mode === 'edit'} required /></label>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Телефон<input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} /></label>
      </div>
      {mode === 'edit' && <p className="form-note">Имя и фамилия доступны только для просмотра согласно текущему API.</p>}
      {error && <div className="alert error">{error}</div>}
      <div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Отмена</button><button className="button primary" disabled={loading}>{loading ? 'Сохраняем...' : 'Сохранить'}</button></div>
    </form>
  </div>
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const loadUsers = async () => {
    try {
      setUsers((await api.users.list()).responses)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadUsers() }, [])

  async function remove(user: User) {
    if (!window.confirm(`Удалить пользователя ${user.email}?`)) return
    try {
      await api.users.remove(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось удалить пользователя')
    }
  }

  return <>
    <div className="page-heading"><div><p className="eyebrow">Доступ к системе</p><h1>Пользователи</h1><p className="muted">Управление учетными записями и ролями</p></div><button className="button primary" onClick={() => setShowForm(true)}><span>＋</span> Новый пользователь</button></div>
    <section className="panel">
      <div className="panel-toolbar"><div><h3>Учетные записи</h3><span className="muted">{users.length} пользователей</span></div></div>
      {error && <div className="alert error">{error}</div>}
      {loading ? <div className="empty-state">Загружаем пользователей...</div> : <div className="table-wrap"><table><thead><tr><th>Пользователь</th><th>Роли</th><th>Действие</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="person-cell"><div className="person-avatar purple">{user.email[0].toUpperCase()}</div><div><strong>{user.email}</strong><small>ID: {user.id}</small></div></div></td><td><div className="role-list">{user.roles.map((role) => <span className="role-chip" key={role}>{role}</span>)}</div></td><td><button className="button danger" onClick={() => void remove(user)}>Удалить</button></td></tr>)}</tbody></table></div>}
    </section>
    {showForm && <UserModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); setLoading(true); void loadUsers() }} />}
  </>
}

function UserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('TEACHER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try { await api.users.create({ email, password, roles: [role] }); onSaved() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось создать пользователя') }
    finally { setLoading(false) }
  }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal compact" onSubmit={submit}><div className="modal-heading"><div><p className="eyebrow">Новая учетная запись</p><h2>Добавить пользователя</h2></div><button type="button" className="close-button" onClick={onClose}>×</button></div><div className="stack-form"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><label>Роль<select value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="TEACHER">Преподаватель</option><option value="ADMIN">Администратор</option></select></label></div>{error && <div className="alert error">{error}</div>}<div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Отмена</button><button className="button primary" disabled={loading}>{loading ? 'Создаем...' : 'Создать'}</button></div></form></div>
}

export { App }
