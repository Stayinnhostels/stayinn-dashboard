export const authKeys = {
  all: ["auth"] as const,
  login: () => [...authKeys.all, "login"] as const,
  session: () => [...authKeys.all, "session"] as const,
};
