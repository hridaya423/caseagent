# Case 020: Kitchen socket maintenance request

## Decision

- **Status:** escalated
- **Next step:** A person decides: Decide how to make the kitchen socket safe now: arrange an urgent electrician (with landlord approval and cost by phone) and decide whether the tenant should isolate the circuit or leave the property until it is checked.
- **Why:** Landlord has not been contacted and no electrician is arranged or approved. The affected circuit is unknown. The smell is continuing, so the socket may be overheating. No conflicting facts.

## Escalation

- **Checked:** Tenant report of hot burning smell and warm socket face near kitchen counter, kettle unplugged [event 001]. Follow-up: no smoke or sparks, smell still faint, tenant and her 10-year-old son are at home, circuit/breaker unknown and consumer unit not opened [event 004]. No landlord contact yet.
- **Missing or in conflict:** Landlord has not been contacted and no electrician is arranged or approved. The affected circuit is unknown. The smell is continuing, so the socket may be overheating. No conflicting facts.
- **Decision needed:** Decide how to make the kitchen socket safe now: arrange an urgent electrician (with landlord approval and cost by phone) and decide whether the tenant should isolate the circuit or leave the property until it is checked.

## Summary

**Final status:** escalated
**Runs:** 1 · **Events seen:** up to event 4 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Nora, thank you for the details about the kitchen socket at 8 Brindlewick Row. Because of the burning smell and the warm socket, a member of our team is dealing with this now and will be in touch with you directly. Please keep the socket out of use in the meantime. If you see smoke, sparks or flames, leave the property with your son and call 999. Kind regards, Northbridge Lettings

**Run 1, to tenant, sms:**

Northbridge Lettings: please read our email about the kitchen socket. A person is dealing with it now. Do not use the socket. If smoke or sparks, leave and call 999.

## Timeline

### Run 1

- event 001: Portal from Nora Bell (Tenant) · Reported a hot, slightly burning smell near the kitchen coun
- event 002: Update from Northbridge Lettings workflow (System) · Maintenance request NBL-020-01 created and assigned for revi
- event 003: Portal from Maya Chen (Property Manager, Northbridge Lettings) · Asked whether there is smoke, sparking, a continuing smell, 
- event 004: Portal from Nora Bell (Tenant) · No smoke or sparks seen. Smell remains faint. Nora is at hom

- send_message: email to tenant queued in the outbox
- send_message: sms to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

None.

## Notes

None.

## Failed, refused or invalid actions

None.
