import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 53,
  title: "Handoffs and Shared State Stores",
  description: "Imagine a planner finishes a specification and passes work to a developer. The new worker needs the actual deliverable, not just a title containing a hash.",
  concepts: ["Transfer bytes, not only summaries", "CAS the shared state version", "Creation is not recipient acceptance"],
  scope: "Checks a bounded local artifact handoff against seeded state. It does not transfer provider files or change session ownership. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Reserve a valid artifact handoff", "input": {"artifact": "approved plan", "expectedVersion": 1, "targetRole": "developer"}, "expected": "passed", "checks": {"phase": "reserved"}}, {"id": "1", "label": "Reject stale shared state", "input": {"artifact": "approved plan", "expectedVersion": 0, "targetRole": "developer"}, "expected": "conflict", "checks": {"phase": "unclaimed"}}, {"id": "2", "label": "Reject an unapproved target", "input": {"artifact": "approved plan", "expectedVersion": 1, "targetRole": "external"}, "expected": "rejected", "checks": {}}],
  async run(input) {

if(number(input,"expectedVersion")!==1)return report("conflict","Shared task state changed",{phase:"unclaimed"},["Compare the current state version before reserving"]);
const bytes=text(input,"artifact"),role=text(input,"targetRole");if(!["developer","reviewer"].includes(role)||Buffer.byteLength(bytes)>4096)return report("rejected","Target or artifact size is outside the reviewed handoff",{},["Authorize the target and bound the artifact"]);
return report("passed","Reserved a byte-bound local handoff",{phase:"reserved",artifactHash:hash(bytes),artifactBytes:Buffer.byteLength(bytes),payload:{role,artifact:bytes},recipientAccepted:false,ownershipAdvanced:false},["Bind owner, task and artifact","Reserve current shared state","Include the actual bytes","Advance ownership only after recipient acceptance"]);

  }
};
