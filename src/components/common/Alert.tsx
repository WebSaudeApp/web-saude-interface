import { useEffect, useState } from "react";
import { alertService, type AlertPayload } from "@/services/AlertService";

export default function Alert() {
  const [alert, setAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    const subscription = alertService.onAlert().subscribe((next) => {
      if ("message" in next) {
        setAlert(next);
      } else {
        setAlert(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!alert) {
    return null;
  }

  return (
    <div className="wrap">
      <p className="card">{alert.message}</p>
    </div>
  );
}
