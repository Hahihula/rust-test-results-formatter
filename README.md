# Rust Test Results Formatter

A GitHub Action that formats Rust test output into a pretty and informative GitHub Actions Job Summary. Does not need the nightly Rust toolchain.

## Usage

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Run tests
    run: cargo test > result.txt
    continue-on-error: true

  - name: Format test results
    uses: hahihula/rust-test-results-formatter@v1
    with:
      results-file: "result.txt"
```

## Inputs

| Input        | Description                   | Required | Default    |
| ------------ | ----------------------------- | -------- | ---------- |
| results-file | Path to the test results file | No       | result.txt |

## Output Format

The action generates a markdown report in the GitHub Actions Job Summary with:

- Overall test status and statistics
- Breakdown of tests by module in collapsible sections
- Detailed failure information if any tests failed

## License

MIT
