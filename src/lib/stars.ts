export function formatStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
