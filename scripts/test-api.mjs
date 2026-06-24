import crypto from "node:crypto";
import feedback from "../api/feedback.js";
import telemetry from "../api/telemetry.js";
import welcome from "../api/welcome.js";
import logout from "../api/logout.js";
import status from "../api/status.js";
import { getVerifiedSession } from "../api/_session.js";

function response() {
  return {
    code:200,
    headers:{},
    body:null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
    redirect(code, location) { this.code = code; this.headers.Location = location; return this; }
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const [name, handler] of [["feedback", feedback], ["telemetry", telemetry], ["welcome", welcome]]) {
  const res = response();
  await handler({ method:"GET", headers:{} }, res);
  assert(res.code === 405, `${name}: GET muss 405 liefern`);
}

const feedbackUnauthorized = response();
await feedback({ method:"POST", headers:{}, body:{} }, feedbackUnauthorized);
assert(feedbackUnauthorized.code === 401, "feedback: anonymer POST muss 401 liefern");

const statusUnauthorized = response();
await status({ method:"GET", headers:{} }, statusUnauthorized);
assert(statusUnauthorized.code === 401, "status: anonymer GET muss 401 liefern");

const logoutResponse = response();
await logout({ method:"POST", headers:{ host:"bullprosperity.online" } }, logoutResponse);
assert(logoutResponse.code === 200 && logoutResponse.body?.ok, "logout: POST fehlgeschlagen");
assert(logoutResponse.headers["Set-Cookie"]?.length === 18, "logout: Cookie-Varianten unvollständig");

process.env.SESSION_SECRET = "launch-test-secret";
const email = "current@example.com";
const role = "premium";
const memberId = "member-current";
const signature = crypto.createHmac("sha256", process.env.SESSION_SECRET)
  .update(`${email}|${role}|${memberId}`)
  .digest("hex");
const session = getVerifiedSession({ headers:{ cookie:`bp_email=old@example.com; bp_role=guest; bp_member_id=old; bp_session=invalid; bp_email=${email}; bp_role=${role}; bp_member_id=${memberId}; bp_session=${signature}` } });
assert(session.valid && session.email === email && session.role === role, "session: aktueller doppelter Cookie wird nicht verwendet");

console.log("API-Regressionstests bestanden: Auth, Methoden, Logout und Session-Cookies.");
