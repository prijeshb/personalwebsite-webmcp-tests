import assert from "node:assert/strict";
import test from "node:test";

const contracts = await import("../../src/contracts.mjs").catch(() => ({}));

test("normalizes an HTTP target URL", () => {
  assert.equal(typeof contracts.normalizeTargetUrl, "function");
  assert.equal(
    contracts.normalizeTargetUrl("https://portfolio.example.com/path"),
    "https://portfolio.example.com/path",
  );
});

test("rejects non-HTTP target URLs", () => {
  assert.equal(typeof contracts.normalizeTargetUrl, "function");
  assert.throws(
    () => contracts.normalizeTargetUrl("file:///private/site.html"),
    /http or https/i,
  );
});

test("reports missing WebMCP tools", () => {
  assert.equal(typeof contracts.auditToolRegistrations, "function");
  const report = contracts.auditToolRegistrations([
    { name: "get_profile", description: "Return the public profile." },
    { name: "list_projects", description: "List published projects." },
  ]);

  assert.deepEqual(report.missing, [
    "get_resume",
    "search_posts",
    "contact",
  ]);
  assert.equal(report.valid, false);
});

test("accepts the complete public WebMCP tool contract", () => {
  assert.equal(typeof contracts.auditToolRegistrations, "function");
  const registrations = [
    "get_profile",
    "get_resume",
    "list_projects",
    "search_posts",
    "contact",
  ].map((name) => ({
    name,
    description: `Public ${name} tool`,
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  }));

  const report = contracts.auditToolRegistrations(registrations);

  assert.deepEqual(report.missing, []);
  assert.deepEqual(report.invalid, []);
  assert.equal(report.valid, true);
});

test("rejects registrations without useful descriptions or object schemas", () => {
  assert.equal(typeof contracts.auditToolRegistrations, "function");
  const registrations = [
    {
      name: "get_profile",
      description: "",
      inputSchema: { type: "string" },
    },
  ];

  const report = contracts.auditToolRegistrations(registrations);

  assert.deepEqual(report.invalid, ["get_profile"]);
  assert.equal(report.valid, false);
});

test("requires public portfolio tools to declare themselves read-only", () => {
  assert.equal(typeof contracts.auditToolRegistrations, "function");
  const registrations = [
    {
      name: "get_profile",
      description: "Return the public profile.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: false },
    },
  ];

  const report = contracts.auditToolRegistrations(registrations);

  assert.deepEqual(report.invalid, ["get_profile"]);
  assert.equal(report.valid, false);
});

test("reports duplicate tool registrations", () => {
  assert.equal(typeof contracts.auditToolRegistrations, "function");
  const tool = {
    name: "get_profile",
    description: "Return the public profile.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  };

  const report = contracts.auditToolRegistrations([tool, tool]);

  assert.deepEqual(report.duplicates, ["get_profile"]);
  assert.equal(report.valid, false);
});
