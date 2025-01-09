const core = require("@actions/core");
const fs = require("fs");

function parseTestResults(content) {
  const lines = content.split("\n");
  const tests = [];
  const failures = [];
  let currentFailure = null;
  let isInFailureSection = false;
  let summary = null;

  for (const line of lines) {
    // Parse test results
    const testMatch = line.match(/^test (.*?) \.\.\. (ok|FAILED)$/);
    if (testMatch) {
      tests.push({
        name: testMatch[1],
        status: testMatch[2],
      });
      continue;
    }

    // Parse final summary
    const summaryMatch = line.match(
      /test result: (FAILED|ok)\. (\d+) passed; (\d+) failed; (\d+) ignored; (\d+) measured; (\d+) filtered out; finished in (.*)$/
    );
    if (summaryMatch) {
      summary = {
        status: summaryMatch[1],
        passed: parseInt(summaryMatch[2]),
        failed: parseInt(summaryMatch[3]),
        ignored: parseInt(summaryMatch[4]),
        measured: parseInt(summaryMatch[5]),
        filtered: parseInt(summaryMatch[6]),
        duration: summaryMatch[7],
      };
      continue;
    }

    // Track failure details
    if (line === "failures:") {
      isInFailureSection = true;
      continue;
    }

    if (isInFailureSection) {
      const failureHeaderMatch = line.match(/^---- (.*?) stdout ----$/);
      if (failureHeaderMatch) {
        currentFailure = {
          test: failureHeaderMatch[1],
          details: [],
        };
        failures.push(currentFailure);
        continue;
      }

      if (currentFailure && line.trim()) {
        currentFailure.details.push(line.trim());
      }
    }
  }

  return { tests, failures, summary };
}

function generateMarkdown(results) {
  const { tests, failures, summary } = results;

  const statusEmoji = summary.failed > 0 ? "❌" : "✅";

  let md = `# Test Results ${statusEmoji}\n\n`;

  md += "## Summary\n\n";
  md += `- **Status**: ${summary.status}\n`;
  md += `- **Duration**: ${summary.duration}\n`;
  md += `- **Total Tests**: ${tests.length}\n`;
  md += `- **Passed**: ${summary.passed} 🟢\n`;
  if (summary.failed > 0) md += `- **Failed**: ${summary.failed} 🔴\n`;
  if (summary.ignored > 0) md += `- **Ignored**: ${summary.ignored} ⚪\n`;
  if (summary.measured > 0) md += `- **Measured**: ${summary.measured} 🔵\n`;

  md += "\n## Test Breakdown\n\n";

  const moduleTests = {};
  tests.forEach((test) => {
    const moduleName = test.name.split("::")[0];
    if (!moduleTests[moduleName]) {
      moduleTests[moduleName] = [];
    }
    moduleTests[moduleName].push(test);
  });

  Object.entries(moduleTests).forEach(([module, moduleTests]) => {
    const failedTests = moduleTests.filter((t) => t.status === "FAILED").length;
    const statusEmoji = failedTests > 0 ? "❌" : "✅";

    md += `<details>\n`;
    md += `<summary>${statusEmoji} ${module} (${moduleTests.length} tests)</summary>\n\n`;

    moduleTests.forEach((test) => {
      const icon = test.status === "ok" ? "✅" : "❌";
      const testName = test.name.split("::").slice(1).join("::");
      md += `${icon} ${testName}\n`;
    });

    md += "\n</details>\n\n";
  });

  if (failures.length > 0) {
    md += "## Failures\n\n";
    failures.forEach((failure) => {
      md += `### ${failure.test}\n\n`;
      md += "```\n";
      md += failure.details.join("\n");
      md += "\n```\n\n";
    });
  }

  return md;
}

async function run() {
  try {
    // Get inputs
    const resultsFile = core.getInput("results-file");

    // Read the test results file
    const content = fs.readFileSync(resultsFile, "utf8");

    // Parse and generate markdown
    const results = parseTestResults(content);
    const markdown = generateMarkdown(results);

    // Write to job summary
    await core.summary.addRaw(markdown).write();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
