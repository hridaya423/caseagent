# Case 012: Lock Maintenance Request

## Decision

- **Status:** escalated
- **Next step:** A person decides: Decide whether the unsecured bedroom window needs an urgent same-day security fix, and phone the landlord to get approval for a contractor visit and cost, covering the bedroom window, the bathroom window and the missing keys.
- **Why:** Unknown: which keys are missing (window, door or other), the floor and accessibility of the bedroom window, and whether the property can be secured tonight. The bathroom window fault (stuck) is not urgent by itself. The tenant has been asked for these details.

## Escalation

- **Checked:** Read the tenant's report: bathroom window will not open, bedroom window opens but will not secure, keys missing [event 001]. No landlord contact or contractor action has taken place yet.
- **Missing or in conflict:** Unknown: which keys are missing (window, door or other), the floor and accessibility of the bedroom window, and whether the property can be secured tonight. The bathroom window fault (stuck) is not urgent by itself. The tenant has been asked for these details.
- **Decision needed:** Decide whether the unsecured bedroom window needs an urgent same-day security fix, and phone the landlord to get approval for a contractor visit and cost, covering the bedroom window, the bathroom window and the missing keys.

## Summary

**Final status:** escalated
**Runs:** 1 · **Events seen:** up to event 1 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Perrin,

Thank you for your report about Unit 2, 18 Brindlewick Mews. Because the bedroom window will not secure, a member of our team is dealing with this now and will be in touch.

To help them, please reply with:
1. Which keys are missing (for example window keys, front door keys or another set), and when you last saw them.
2. Whether the bedroom window can be closed fully, and which floor the bedroom is on.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Perrin Dall (Tenant, Northbridge Lettings) · Reports that the bathroom window will not open, the bedroom 

- send_message: email to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

None.

## Notes

None.

## Failed, refused or invalid actions

None.
