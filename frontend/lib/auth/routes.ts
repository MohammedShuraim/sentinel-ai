const PUBLIC_PREFIXES = ["/", "/login", "/register", "/auth", "/health"];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
