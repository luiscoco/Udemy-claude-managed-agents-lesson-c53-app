# C53 · Handoffs and Shared State Stores

Checks a bounded local artifact handoff against seeded state. It does not transfer provider files or change session ownership. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Transfer bytes, not only summaries
- CAS the shared state version
- Creation is not recipient acceptance

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3053`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3053
```

## How the app was build

### 1. Reserve only the expected shared-state version

The experiment starts at version 1. A mismatched expected version leaves the handoff unclaimed instead of overwriting a changed owner/task state.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
if (number(input, "expectedVersion") !== 1)
  return report("conflict", "Shared task state changed", { phase: "unclaimed" }, [
    "Compare the current state version before reserving",
  ]);
```

### 2. Bind and bound the actual handoff bytes

Only developer or reviewer targets are allowed, and the artifact must fit the byte cap. The reserved payload includes the bytes and hash; recipientAccepted and ownershipAdvanced remain false until a separate acceptance step exists.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
const bytes = text(input, "artifact"),
  role = text(input, "targetRole");

// ... other source statements omitted ...
return report(
  "passed",
  "Reserved a byte-bound local handoff",
  {
    phase: "reserved",
    artifactHash: hash(bytes),
    artifactBytes: Buffer.byteLength(bytes),
    payload: { role, artifact: bytes },
    recipientAccepted: false,
    ownershipAdvanced: false,
  },
  [
    "Bind owner, task and artifact",
    "Reserve current shared state",
    "Include the actual bytes",
    "Advance ownership only after recipient acceptance",
  ],
);
```

### Check your understanding

Run **Reserve a valid artifact handoff** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "artifact": "approved plan",
    "expectedVersion": 1,
    "targetRole": "developer"
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "phase": "reserved"
  }
}
```

Then try **Reject stale shared state**. Its expected outcome is `conflict`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
