import './Users.css'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2026-01-15',
  },
  {
    id: 'usr-002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'operator',
    createdAt: '2026-02-20',
  },
  {
    id: 'usr-003',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'operator',
    createdAt: '2026-03-10',
  },
  {
    id: 'usr-004',
    name: 'David Lee',
    email: 'david@example.com',
    role: 'viewer',
    createdAt: '2026-04-05',
  },
]

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  operator: 'Operator',
  viewer: 'Viewer',
}

export default function Users() {
  return (
    <div className="users">
      <div className="users__header">
        <h1 className="users__title">Users</h1>
      </div>
      <table className="users__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_USERS.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`users__role users__role--${user.role}`}>
                  {roleLabels[user.role] ?? user.role}
                </span>
              </td>
              <td>{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
