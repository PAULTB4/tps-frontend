type Props = { message: string; type?: 'success' | 'error' };
export function Toast({ message, type = 'success' }: Props) {
  if (!message) return null;
  return <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>;
}
