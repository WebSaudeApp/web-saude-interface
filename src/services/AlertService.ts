import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

export const AlertType = {
  Success: "Success",
  Error: "Error",
  Info: "Info",
  Warning: "Warning",
} as const;

export type AlertKind = (typeof AlertType)[keyof typeof AlertType];

export type AlertPayload = {
  id: string;
  type: AlertKind;
  message: string;
  autoClose: boolean;
};

const alertSubject = new Subject<AlertPayload | { id: string }>();
const defaultId = "default-alert";

function onAlert(id = defaultId) {
  return alertSubject
    .asObservable()
    .pipe(filter((item) => Boolean(item) && item.id === id));
}

function emit(type: AlertKind, message: string, autoClose = true) {
  alertSubject.next({
    id: defaultId,
    type,
    message,
    autoClose,
  });
}

export const alertService = {
  onAlert,
  success: (message: string) => emit(AlertType.Success, message),
  error: (message: string) => emit(AlertType.Error, message),
  info: (message: string) => emit(AlertType.Info, message),
  warn: (message: string) => emit(AlertType.Warning, message),
  clear: (id = defaultId) => alertSubject.next({ id }),
};
