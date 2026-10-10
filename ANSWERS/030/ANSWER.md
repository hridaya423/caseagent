# Case 030: Maintenance report at 8 Brindlefern Walk

## Decision

- **Status:** escalated
- **Next step:** A person decides: Decide how to restore smoke detection at 8 Brindlefern Walk urgently, and contact the landlord now to approve an emergency replacement and refit of the landing alarm and make good the ceiling.
- **Why:** Tenant says she knows of no immediate risk [event 001], but the home currently has no smoke alarm on the landing, which is a fire-safety gap. Unclear why it was beeping (battery, end of life, or fault) and whether any other alarm is working. Landlord not yet contacted. Responsibility for the removal and any charges is not established.

## Escalation

- **Checked:** Tenant report: upstairs landing smoke alarm kept beeping, tenant removed it, small opening left in ceiling, tenant says no immediate risk [event 001]. Triage: no access issue, two cats usually out in daytime, marked urgent [event 002]. Property and item are clear.
- **Missing or in conflict:** Tenant says she knows of no immediate risk [event 001], but the home currently has no smoke alarm on the landing, which is a fire-safety gap. Unclear why it was beeping (battery, end of life, or fault) and whether any other alarm is working. Landlord not yet contacted. Responsibility for the removal and any charges is not established.
- **Decision needed:** Decide how to restore smoke detection at 8 Brindlefern Walk urgently, and contact the landlord now to approve an emergency replacement and refit of the landing alarm and make good the ceiling.

## Summary

**Final status:** escalated
**Runs:** 1 · **Events seen:** up to event 2 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Nessa, thank you for reporting the smoke alarm on the upstairs landing at 8 Brindlefern Walk. As the alarm has been removed and there is now an opening in the ceiling, we are treating this as urgent. A member of our team is dealing with it now and will be in touch about the next step. Kind regards, Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Nessa Quill (Tenant) · Reports that the upstairs landing smoke alarm kept beeping d
- event 002: Note from Ivo Merrick (Property Manager, Northbridge Lettings) · Triage record: no access issue reported. Tenant has two cats

- send_message: email to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

None.

## Notes

None.

## Failed, refused or invalid actions

None.
