export function formatToTitleCase(input: string): string {
  if (!input || typeof input !== "string") {
    return input;
  }
  const formatted = input.replace(/[_-]/g, " ");
  const spaced = formatted.replace(/([a-z])([A-Z])/g, "$1 $2");
  const words = spaced.split(" ");
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(" ");
}
