export type EventAlert = {
  type: 'success' | 'error';
  message: string;
};

const EVENT_ALERT_KEY = 'tps:event-alert';

export function publishEventAlert(alert: EventAlert) {
  window.sessionStorage.setItem(EVENT_ALERT_KEY, JSON.stringify(alert));
}

export function consumeEventAlert(): EventAlert | null {
  const raw = window.sessionStorage.getItem(EVENT_ALERT_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(EVENT_ALERT_KEY);

  try {
    return JSON.parse(raw) as EventAlert;
  } catch {
    return null;
  }
}
