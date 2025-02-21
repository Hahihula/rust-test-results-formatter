# Rust Test Results Formatter

A GitHub Action that formats Rust test output into a pretty and informative GitHub Actions Job Summary. Does not need the nightly Rust toolchain.

## Features

- Formats test results into a clear, organized summary
- Handles build errors and warnings
- Groups tests by module in collapsible sections
- Shows detailed failure information
- No nightly toolchain required

## Usage

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Run tests
    run: cargo test &> result.txt
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

### For Build Issues
- Build errors with error codes and detailed messages
- Build warnings with explanatory notes
- Proper formatting of compiler diagnostic messages

### For Test Results
- Overall test status and statistics
- Breakdown of tests by module in collapsible sections
- Detailed failure information if any tests failed
### Example Outputs Successful Build and Tests
```plaintext
✅ All 15 tests passed
 ```
 Failed Tests
```plaintext
❌ Tests: 14 passed, 1 failed
Failures:
- example::test_failure
 ```
 Build Errors
```plaintext
⚠️ Build Failed
Errors:
- E0433: failed to resolve: use of undeclared crate or module
Warnings:
- unused import
 ```


## License

MIT
