type Props = { message: string; type?: 'success' | 'error' };
export function Toast({ message, type = 'success' }: Props) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`} role="status">
      <span className="toast-icon material-symbols-outlined" aria-hidden="true">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span>{message}</span>
    </div>
  );
}
