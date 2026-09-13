export const unidadeCardFields = [
  "name",
  "type",
  "address",
  "rating",
  "reviewCount",
  "photos",
] as const;

export const unidadeDetailSections = [
  "gallery",
  "contact",
  "specialties",
  "hours",
  "reviews",
] as const;

export const gestorUnidadeColumns = [
  "name",
  "type",
  "status",
  "approval",
] as const;

export const adminUserColumns = ["name", "email", "role", "status"] as const;
