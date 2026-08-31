export const EXPECTED_TOOL_NAMES = Object.freeze([
  "get_profile",
  "get_resume",
  "list_projects",
  "search_posts",
  "contact",
]);

export function normalizeTargetUrl(value) {
  const url = new URL(String(value).trim());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("Target URL must use HTTP or HTTPS.");
  }

  return url.href.replace(/\/$/, "");
}

export function auditToolRegistrations(registrations) {
  const tools = Array.isArray(registrations) ? registrations : [];
  const byName = new Map(tools.map((tool) => [tool?.name, tool]));
  const counts = new Map();
  for (const tool of tools) {
    if (typeof tool?.name !== "string") continue;
    counts.set(tool.name, (counts.get(tool.name) ?? 0) + 1);
  }
  const missing = EXPECTED_TOOL_NAMES.filter((name) => !byName.has(name));
  const duplicates = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name)
    .sort();
  const invalid = EXPECTED_TOOL_NAMES.filter((name) => {
    const tool = byName.get(name);
    if (!tool) return false;

    const hasDescription =
      typeof tool.description === "string" && tool.description.trim().length > 0;
    const schema = tool.inputSchema ?? tool.input_schema;
    const hasObjectSchema =
      schema && typeof schema === "object" && schema.type === "object";
    const isReadOnly = tool.annotations?.readOnlyHint === true;

    return !hasDescription || !hasObjectSchema || !isReadOnly;
  });

  return {
    expected: [...EXPECTED_TOOL_NAMES],
    discovered: tools
      .map((tool) => tool?.name)
      .filter((name) => typeof name === "string"),
    missing,
    invalid,
    duplicates,
    valid:
      missing.length === 0 && invalid.length === 0 && duplicates.length === 0,
  };
}
