# Case 009: Bedroom Window Maintenance Request

## Decision

- **Status:** escalated
- **Next step:** A person decides: Phone Dorian Pike to find out whether he approves a contractor inspection and quote for the bedroom window at 24 Bramblewick Lane, and whether his insurance excess affects the timing or scope. Then record his answer on the case.
- **Why:** The landlord has not approved the inspection or any cost. He says he is waiting to obtain the insurance excess and wants a phone call about when work can proceed. It is unclear whether an insurance claim is involved, whether he approves an inspection and quote now, and who pays the excess. I cannot phone him. No contractor has been assigned.

## Escalation

- **Checked:** Reviewed the tenant's report of a bedroom window that will not close or seal fully [event 001]. I asked the landlord to approve an inspection and quote, with no cost known. The landlord's reply [event 004] is not an approval, and the automatic check marks it unclear. I noted that the tenant's attachment is a gas safety record for another property, 8 Thistledown Mews, and did not use it.
- **Missing or in conflict:** The landlord has not approved the inspection or any cost. He says he is waiting to obtain the insurance excess and wants a phone call about when work can proceed. It is unclear whether an insurance claim is involved, whether he approves an inspection and quote now, and who pays the excess. I cannot phone him. No contractor has been assigned.
- **Decision needed:** Phone Dorian Pike to find out whether he approves a contractor inspection and quote for the bedroom window at 24 Bramblewick Lane, and whether his insurance excess affects the timing or scope. Then record his answer on the case.

## Summary

**Final status:** escalated
**Runs:** 2 · **Events seen:** up to event 4 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Elena,

Thank you for letting us know that the bedroom window at 24 Bramblewick Lane will not close or seal fully. We have passed this to the landlord for approval and will update you as soon as we hear back.

Please note that the document attached to your report was a gas safety record for a different property (8 Thistledown Mews). If you meant to send something else, please send it again.

Kind regards,
Northbridge Lettings

**Run 2, to landlord, email:**

Dear Mr Pike,

Thank you for your email about the bedroom window at 24 Bramblewick Lane, Alderfen, which will not close or seal fully. I have passed your request for a call to a colleague, who will phone you to discuss when work can proceed.

We have not booked any contractor and will not do so until you have approved the work. When you are ready, please confirm whether you approve a contractor visit to inspect the window and quote for the repair. The cost is not yet known.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Elena Voss (Tenant) · Reports that a bedroom window will not close or seal fully; 

- add_note: note added
- request_landlord_approval: approval request for "24 Bramblewick Lane, Alderfen: the tenant reports the bedroom window will not close or seal fully. The handle seems to work and the tenant thinks the hinges may be at fault. Approval requested for a contractor to inspect the window and quote for the repair. No repair work to start without further approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 004: Email from Dorian Pike (Landlord) · Says he is waiting to obtain the insurance excess and asks t

- send_message: email to landlord queued in the outbox
- escalate: case escalated to a person

## Approvals requested

- Run 1: **24 Bramblewick Lane, Alderfen: the tenant reports the bedroom window will not close or seal fully. The handle seems to work and the tenant thinks the hinges may be at fault. Approval requested for a contractor to inspect the window and quote for the repair. No repair work to start without further approval.** (unknown)

## Notes

- Run 1: The tenant's attachment (forwarded-document.pdf) is a Landlord Gas Safety Record for a different property (8 Thistledown Mews, Vellumby), dated 8 September 2025, and does not relate to the bedroom window fault at 24 Bramblewick Lane. It was not used for this case. Someone should check whether it was attached by mistake and whether it belongs on another file.

## Failed, refused or invalid actions

None.
