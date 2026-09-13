const Logger = {
  info(message: string, extra?: unknown) {
    console.info(`[web-saude] ${message}`, extra ?? "");
  },
  warn(message: string, extra?: unknown) {
    console.warn(`[web-saude] ${message}`, extra ?? "");
  },
  error(message: string, extra?: unknown) {
    console.error(`[web-saude] ${message}`, extra ?? "");
  },
};

export default Logger;
