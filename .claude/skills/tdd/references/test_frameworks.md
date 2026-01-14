# Test Framework Reference

Quick reference for running tests and detecting slow tests across different frameworks.

## JavaScript/TypeScript

### Vitest
```bash
# Run all tests
npm run test
vitest

# Run in watch mode
vitest --watch

# Run specific file
vitest src/component.test.js

# Run with coverage
vitest --coverage

# Output with timing
vitest --reporter=verbose
```

**Timing output format:**
```
✓ test name (123ms)
✓ another test 45ms
```

### Jest
```bash
# Run all tests
npm test
jest

# Run in watch mode
jest --watch

# Run specific file
jest src/component.test.js

# Run with coverage
jest --coverage

# Show individual test timings
jest --verbose
```

**Timing output format:**
```
PASS  src/component.test.js (123ms)
  ✓ test name (45ms)
```

### Mocha
```bash
# Run all tests
npm test
mocha

# Run specific file
mocha test/component.test.js

# Run with reporter that shows timing
mocha --reporter spec
```

## Python

### Pytest
```bash
# Run all tests
pytest

# Run specific file
pytest tests/test_component.py

# Run with verbose output
pytest -v

# Show test durations
pytest --durations=10

# Run with timing for each test
pytest -v --durations=0
```

**Timing output format:**
```
tests/test_component.py::test_name PASSED [100%] 0.123s
```

### Unittest
```bash
# Run all tests
python -m unittest discover

# Run specific test
python -m unittest tests.test_component.TestClass.test_method

# Run with verbose output
python -m unittest discover -v
```

## Java

### JUnit 5 (with Maven)
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TestClassName

# Run with verbose output
mvn test -X
```

**Timing output format:**
```
[INFO] Running com.example.TestClass
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.123 s
testMethod(com.example.TestClass)  Time elapsed: 0.045 s
```

### JUnit 5 (with Gradle)
```bash
# Run all tests
gradle test

# Run specific test
gradle test --tests TestClassName
```

## Go

### Go Test
```bash
# Run all tests
go test ./...

# Run tests in specific package
go test ./pkg/component

# Run with verbose output
go test -v ./...

# Show test timing
go test -v ./... | grep -E "PASS|FAIL"
```

**Timing output format:**
```
--- PASS: TestName (0.12s)
```

## Ruby

### RSpec
```bash
# Run all tests
rspec

# Run specific file
rspec spec/component_spec.rb

# Run with format that shows timing
rspec --format documentation

# Show slow tests
rspec --profile 10
```

**Timing output format:**
```
Finished in 0.12345 seconds
ComponentClass
  test name (0.045 seconds)
```

## C#

### xUnit (with dotnet)
```bash
# Run all tests
dotnet test

# Run specific test
dotnet test --filter "FullyQualifiedName~TestClassName"

# Run with verbose output
dotnet test --verbosity normal
```

## Rust

### Cargo Test
```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture

# Show test timings
cargo test -- --show-output
```

## Framework Detection Tips

When parsing test output to detect frameworks:
- Look for framework-specific markers: `vitest`, `jest`, `pytest`, `JUnit`, etc.
- Check for characteristic output patterns (see formats above)
- Fall back to trying multiple parsers if framework unknown

## Assertion Libraries

### JavaScript
- **Vitest**: `expect(value).toBe(expected)`, `expect(value).toEqual(expected)`
- **Jest**: Same as Vitest
- **Chai**: `expect(value).to.equal(expected)`, `assert.equal(actual, expected)`

### Python
- **Pytest**: `assert value == expected`
- **Unittest**: `self.assertEqual(value, expected)`

### Java
- **JUnit 5**: `assertEquals(expected, actual)`, `assertTrue(condition)`
- **AssertJ**: `assertThat(value).isEqualTo(expected)`

### Go
- **Testing**: `if got != want { t.Errorf(...) }`
- **Testify**: `assert.Equal(t, expected, actual)`

### Ruby
- **RSpec**: `expect(value).to eq(expected)`

### C#
- **xUnit**: `Assert.Equal(expected, actual)`
- **FluentAssertions**: `value.Should().Be(expected)`

### Rust
- **Built-in**: `assert_eq!(actual, expected)`
