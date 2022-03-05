export function sanitizeName(name: string, prefix: string = "") {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
    .replace(/^/, `${prefix}`);
}
