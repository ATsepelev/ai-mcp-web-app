## Fixed

- **Critical: Slow External Servers Blocking Fast Ones**: Completely redesigned external server initialization to be truly asynchronous and non-blocking
  - Removed `Promise.all()` waiting - no longer blocks on slowest/failing server
  - Each external server initializes independently with its own timeout (10 seconds default)
  - Tools/resources from fast servers appear **immediately** as they connect
  - Slow servers add their tools when ready, without blocking UI
  - Failed servers timeout gracefully without affecting successful connections
  - State updates incrementally as each server completes
  - Client with internal tools available instantly, external tools added progressively

## Changed

- **Incremental Tool Loading**: Tools now appear progressively instead of all-at-once
  - Internal tools available immediately on page load
  - Each external server's tools added as soon as that server connects
  - User can start working with fast servers while slow ones are still connecting
  - Much better UX when dealing with multiple external servers of varying speeds

## Technical

- Replaced `Promise.all()` with independent `forEach()` async loops
- Each server has `Promise.race()` between initialization and timeout
- `externalResultsMap` populated incrementally as servers complete
- `updateMergedState()` helper called after each server (success or failure)
- `routedClient` created immediately, references live `externalResultsMap`
- Console logs success/failure for each server individually

## Installation

```bash
npm install ai-mcp-web-app@1.5.7
```

