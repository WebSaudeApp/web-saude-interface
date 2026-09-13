export const publicRoutes = {
  home: "/",
  city: "/city",
  search: "/units",
  unitDetails: (id: string) => `/units/${id}`,
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  recoverPassword: "/recover-password",
};

export const patientRoutes = {
  profile: "/profile",
  favorites: "/favorites",
  reviews: "/reviews",
};

export const managerRoutes = {
  units: "/manager/units",
  newUnit: "/manager/units/new",
  editUnit: (id: string) => `/manager/units/${id}`,
};

export const adminRoutes = {
  dashboard: "/admin",
};
