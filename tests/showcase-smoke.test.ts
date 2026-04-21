import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import {
  getShowcaseManifest,
  getShowcaseTree,
  writeShowcaseArtifacts,
} from "../server/showcase";

const workspaceRoot = process.cwd();
const distPublicRoot = path.join(workspaceRoot, "dist", "public");
const distManifestPath = path.join(distPublicRoot, "showcase-manifest.json");
const distTreePath = path.join(distPublicRoot, "showcase-tree.json");

test("development manifest and tree expose showcase entries", async () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  try {
    const [manifest, tree] = await Promise.all([
      getShowcaseManifest(),
      getShowcaseTree(),
    ]);

    assert.ok(manifest.length > 0, "manifest should not be empty");
    assert.ok(tree.pages.length > 0, "pages tree should not be empty");
    assert.ok(tree.components.length > 0, "components tree should not be empty");

    const hasPage = manifest.some((entry) => entry.kind === "page");
    const hasComponent = manifest.some((entry) => entry.kind === "component");

    assert.equal(hasPage, true, "manifest should include page entries");
    assert.equal(hasComponent, true, "manifest should include component entries");
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});

test("production artifact generation writes manifest and tree json", async () => {
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  try {
    await writeShowcaseArtifacts();

    const [manifestRaw, treeRaw] = await Promise.all([
      fs.readFile(distManifestPath, "utf-8"),
      fs.readFile(distTreePath, "utf-8"),
    ]);

    const manifest = JSON.parse(manifestRaw);
    const tree = JSON.parse(treeRaw);

    assert.ok(Array.isArray(manifest), "manifest artifact should be an array");
    assert.equal(typeof tree, "object", "tree artifact should be an object");
    assert.ok(Array.isArray(tree.pages), "tree artifact should contain pages");
    assert.ok(
      Array.isArray(tree.components),
      "tree artifact should contain components",
    );
  } finally {
    process.env.NODE_ENV = previousEnv;
  }
});
