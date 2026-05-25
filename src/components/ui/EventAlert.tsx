import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { consumeEventAlert, type EventAlert as EventAlertPayload } from '../../utils/eventAlert';
import { Toast } from './Toast';

export function EventAlert() {
  const location = useLocation();
  const [alert, setAlert] = useState<EventAlertPayload | null>(null);

  useEffect(() => {
    setAlert(consumeEventAlert());
  }, [location.pathname]);

  useEffect(() => {
    if (!alert) return;

    const timeout = window.setTimeout(() => {
      setAlert(null);
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [alert]);

  if (!alert) return null;

  return (
    <div className="app-eventAlert">
      <Toast type={alert.type} message={alert.message} />
    </div>
  );
}
