# Case 026: Moisture inspection and repair coordination

## Decision

- **Status:** escalated
- **Next step:** A person decides: Decide whether to treat this as an electrical safety issue now. If yes, phone the landlord to approve urgent attendance, covering any electrician check of the socket and the 6 March inspection, and decide whether the tenant should be given safety advice.
- **Why:** Damp next to an electrical socket is possible water near electrics, and it could become unsafe before a normal repair arrives. The offered inspection excludes opening up the wall and is a damp survey, so it may not be the right trade or urgency. The landlord has not replied to the approval request. The cause of the damp and the state of the socket are unknown. No electrician has been considered.

## Escalation

- **Checked:** Tenant reports damp staining and lifting paint below the kitchen window, cool but not wet, no dripping, faint musty smell [event 001, event 004]. New: the mark is nearest the socket under the window; no heat, sparks or tripped breaker noticed [event 009]. Landlord inspection approval was requested in run 1 and no reply is on file. Contractor Brindle Survey & Drying offered 6 March after 13:00 with no trim removal or wall cutting [event 007]. I told him not to attend yet. The tenant is available after 13:00 on 6 March [event 009].
- **Missing or in conflict:** Damp next to an electrical socket is possible water near electrics, and it could become unsafe before a normal repair arrives. The offered inspection excludes opening up the wall and is a damp survey, so it may not be the right trade or urgency. The landlord has not replied to the approval request. The cause of the damp and the state of the socket are unknown. No electrician has been considered.
- **Decision needed:** Decide whether to treat this as an electrical safety issue now. If yes, phone the landlord to approve urgent attendance, covering any electrician check of the socket and the 6 March inspection, and decide whether the tenant should be given safety advice.

## Summary

**Final status:** escalated
**Runs:** 4 · **Events seen:** up to event 9 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Iris,

Thank you for reporting the damp staining and lifting paint below the kitchen window at 18 Juniper Fold. Your request reference is NBL-4821.

I have asked the landlord to approve an inspection. I can't give you an attendance date until they reply. Once they approve, a contractor will contact you by email to arrange a suitable time. I will keep you updated.

If you would like a particular access arrangement, such as preferred days or times, please let me know.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 2, to tenant, email:**

Dear Iris,

Thank you for the extra detail about the damp below the kitchen window at 18 Juniper Fold (ref NBL-4821). I have noted that the paint feels cool but not wet, that nothing is dripping, that there is a faint musty smell, and that you can give access after 13:00 on weekdays.

I am still waiting for the landlord to approve the inspection, so I can't offer a date yet. Once they approve, a contractor will contact you by email to arrange a visit, and I will pass on your access times. If anything changes, for example water starts to drip or the patch spreads quickly, please tell me straight away.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 3, to contractor, email:**

Dear Owen,

Thank you for offering an inspection slot on 6 March after 13:00 for the damp staining and lifting paint below the kitchen window at 18 Juniper Fold, Velden Quay, ZZ1 1ZZ (ref NBL-4821). I have noted that the inspection would not include removing trim or cutting into the wall.

We are still waiting for the landlord to approve the visit, so please do not attend or book anything with the tenant yet. I will confirm as soon as approval is in place. The tenant has said she can give access after 13:00 on weekdays.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 4, to tenant, email:**

Dear Iris,

Thank you for confirming you will be home after 13:00 on 6 March, and for telling me the mark is nearest the socket under the kitchen window at 18 Juniper Fold (ref NBL-4821).

Because the damp is close to an electrical socket, a member of our team is now looking at this case as a priority. I can't yet confirm the 6 March visit, as the landlord has not approved the inspection. We will update you as soon as that is settled.

Please tell me straight away if anything changes, for example heat, sparks, a tripped breaker, dripping water or the patch spreading.

Kind regards,
Maya Chen
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Iris Bell (Tenant, 18 Juniper Fold) · Reported damp staining and lifting paint below the kitchen w
- event 002: Update from Northbridge Lettings workflow (System) · Maintenance request NBL-4821 created. No access preference r

- request_landlord_approval: approval request for "Inspection by a suitable contractor of damp staining and lifting paint below the kitchen window at 18 Juniper Fold, Velden Quay, ZZ1 1ZZ, to find the cause. This approval covers the inspection visit only. Any repair would be quoted and sent to you for separate approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 004: Email from Iris Bell (Tenant, 18 Juniper Fold) · Confirmed the paint felt cool but not wet, with no visible d

- send_message: email to tenant queued in the outbox
- add_note: note added
- hold: case on hold: Waiting for Landlord

### Run 3

- event 007: Email from Owen Pike (Contractor, Brindle Survey & Drying) · Offered an inspection slot for 2025-03-06 after 13:00. Said 

- send_message: email to contractor queued in the outbox
- add_note: note added
- hold: case on hold: Waiting for Landlord

### Run 4

- event 009: Email from Iris Bell (Tenant, 18 Juniper Fold) · Confirmed she would be home after 13:00 on 2025-03-06. Added

- send_message: email to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

- Run 1: **Inspection by a suitable contractor of damp staining and lifting paint below the kitchen window at 18 Juniper Fold, Velden Quay, ZZ1 1ZZ, to find the cause. This approval covers the inspection visit only. Any repair would be quoted and sent to you for separate approval.** (unknown)

## Notes

- Run 2: Tenant access: weekdays after 13:00, contact by email. Tenant reports paint cool but not wet, no dripping, faint musty smell. Landlord approval for inspection still pending; pass access times to contractor once assigned.
- Run 3: Brindle Survey & Drying (Owen Pike) offered an inspection slot on 2025-03-06 after 13:00; the inspection excludes removing trim or cutting into the wall. Not confirmed. Landlord approval is still pending. Once approved, assign the contractor and tell the tenant the contractor will contact her.

## Failed, refused or invalid actions

None.
