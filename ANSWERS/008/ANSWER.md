# Case 008: Water ingress affecting two flats

## Decision

- **Status:** escalated
- **Next step:** A person decides: Decide the urgent response now: contact Yara first to agree access, make contact with the Flat 2 occupant/landlord to establish whether the leak is active and whether electrics are at risk, and decide whether to arrange emergency attendance (stopcock/isolation, plumber) with landlord approval.
- **Why:** The source of the leak is unknown, and the report is second-hand ("I have been told") with no direct confirmation from Flat 2. It is not known whether the water is still flowing, whether it is near electrics or light fittings, or who owns/manages Flat 2 and its occupant. The landlord has not been contacted and nothing is approved.

## Escalation

- **Checked:** Reviewed the tenant's report [event 001]: water is reported coming through the ceiling of Flat 2, directly below the bathroom of Flat 3, 8 Tallowmere Row. The tenant sees no leak in her own flat. She asked to be contacted before anyone comes to Flat 3. No landlord approval, contractor or cost exists yet.
- **Missing or in conflict:** The source of the leak is unknown, and the report is second-hand ("I have been told") with no direct confirmation from Flat 2. It is not known whether the water is still flowing, whether it is near electrics or light fittings, or who owns/manages Flat 2 and its occupant. The landlord has not been contacted and nothing is approved.
- **Decision needed:** Decide the urgent response now: contact Yara first to agree access, make contact with the Flat 2 occupant/landlord to establish whether the leak is active and whether electrics are at risk, and decide whether to arrange emergency attendance (stopcock/isolation, plumber) with landlord approval.

## Summary

**Final status:** escalated
**Runs:** 1 · **Events seen:** up to event 1 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Yara,

Thank you for letting us know about the water coming through the ceiling of Flat 2, below your bathroom at Flat 3, 8 Tallowmere Row. Because water is entering another home and the source is not yet known, a member of our team is dealing with this now.

We have noted your request, and no one will come to Flat 3 until we have contacted you first. We will be in touch shortly to agree next steps and access.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Yara Mallow (Tenant, Flat 3) · I have been told there is water coming through the ceiling o

- send_message: email to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

None.

## Notes

None.

## Failed, refused or invalid actions

None.
