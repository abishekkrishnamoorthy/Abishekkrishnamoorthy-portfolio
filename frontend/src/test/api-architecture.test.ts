import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = join(process.cwd(), "src");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  }).filter((path) => [".ts", ".tsx"].includes(extname(path)) && !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"));
}

describe("API-only production architecture", () => {
  const files = sourceFiles(sourceRoot);

  it("contains no mock imports or runtime mock flag", () => {
    const offenders = files.filter((file) => /lib\/mock|USE_MOCK_DATA|mock\.ts/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("keeps HTTP clients out of pages, components, and hooks", () => {
    const uiRoots = ["app", "components", "hooks"].flatMap((folder) => sourceFiles(join(sourceRoot, folder)));
    const offenders = uiRoots.filter((file) => /\bfetch\s*\(|\bapiClient\b|from ["']axios["']/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
