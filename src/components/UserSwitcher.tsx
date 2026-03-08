import { useApp } from '@/store/AppContext';

const UserSwitcher = () => {
  const { currentUser, users, switchUser } = useApp();

  return (
    <div className="glass-card px-4 py-2 flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Viewing as:</span>
      <select
        value={currentUser.id}
        onChange={e => switchUser(e.target.value)}
        className="input-glass text-sm py-1 px-3"
        style={{ minHeight: 36 }}
      >
        {users.map(u => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSwitcher;
