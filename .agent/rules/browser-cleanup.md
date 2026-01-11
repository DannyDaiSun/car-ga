# Browser Cleanup

Purpose: Ensure that any browser instances opened for testing purposes are properly closed after the task is complete to conserve system resources and maintain a clean environment.

## Rules

1. **Automatic Cleanup**: When using tools that spawn a browser (e.g., `browser_subagent`), the agent must ensure that the browser is closed before considering the task complete. 
   - Note: The `browser_subagent` typically handles cleanup, but if `run_command` is used to launch a browser process (e.g., using `open` or starting a binary), the agent MUST terminate that process or ensure the command does so.

2. **Test Runners**: If running automated tests that launch browsers (e.g., Cypress, Playwright, Selenium), ensure the test command includes flags to close the browser upon completion (e.g., `--headless` or specific configuration to auto-close).

3. **Manual Validation**: If the agent opens a browser for manual-like verification, the agent must close that specific window/tab or terminate the process when the
## Rules

1. is done.

## Verification

- After a testing task, check running processes to ensure no stray browser instances related to the test remain.
