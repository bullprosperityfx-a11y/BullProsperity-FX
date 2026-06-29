export function serverEnv(name: string, optional = false) {
  const value = process.env[name];
  if (!value && !optional) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export function publicEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}
