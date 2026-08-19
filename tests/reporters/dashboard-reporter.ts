import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import fs from "node:fs";
import path from "node:path";

type FinalTest = { title: string; status: TestResult["status"] };

type Bucket = {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
};

function emptyBucket(): Bucket {
  return { total: 0, passed: 0, failed: 0, skipped: 0 };
}

function add(bucket: Bucket, status: TestResult["status"]) {
  bucket.total += 1;
  if (status === "passed") bucket.passed += 1;
  else if (status === "skipped") bucket.skipped += 1;
  else bucket.failed += 1;
}

class DashboardReporter implements Reporter {
  private tests = new Map<string, FinalTest>();

  onTestEnd(test: TestCase, result: TestResult) {
    this.tests.set(test.id, {
      title: test.titlePath().join(" "),
      status: result.status,
    });
  }

  onEnd(result: FullResult) {
    const api = emptyBucket();
    const ui = emptyBucket();
    const negative = emptyBucket();

    for (const test of this.tests.values()) {
      const title = test.title.toLowerCase();
      if (title.includes("[api]")) add(api, test.status);
      if (title.includes("[ui]")) add(ui, test.status);
      if (title.includes("[negative]")) add(negative, test.status);
    }

    const summary = {
      status: result.status === "passed" ? "passed" : "failed",
      generatedAt: new Date().toISOString(),
      api,
      ui,
      negative,
    };

    const output = path.resolve(process.cwd(), "public/test-summary.json");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }
}

export default DashboardReporter;
