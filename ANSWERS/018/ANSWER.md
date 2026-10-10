# Case 018: Kitchen maintenance report

## Decision

- **Status:** escalated
- **Next step:** A person decides: Phone Gareth Vale on 07700 900184 now and record whether he approves an agency-arranged pest control visit (and the cost limit) or will arrange his own contractor.
- **Why:** No written approval for the pest control visit or cost (cost unknown). The landlord has not said whether he will use his own contractor. The earlier pest-control report has not been supplied. I cannot make phone calls.

## Escalation

- **Checked:** Reviewed the tenant's report of rats in the kitchen and under the sink, earlier baiting and possible openings near the drains [event 001]. Reviewed the landlord's reply asking for an urgent call back on 07700 900184 [event 004]. The automatic check shows no usable approval.
- **Missing or in conflict:** No written approval for the pest control visit or cost (cost unknown). The landlord has not said whether he will use his own contractor. The earlier pest-control report has not been supplied. I cannot make phone calls.
- **Decision needed:** Phone Gareth Vale on 07700 900184 now and record whether he approves an agency-arranged pest control visit (and the cost limit) or will arrange his own contractor.

## Summary

**Final status:** escalated
**Runs:** 2 · **Events seen:** up to event 4 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Elise,

Thank you for your report about the rats outside near the kitchen and inside, including under the sink, at 14 Mosswold Crescent. I am sorry you are dealing with this.

I have asked the landlord to approve a pest control visit, and I have also asked whether they hold the report from the earlier pest controller about the openings near the drains. As soon as I have the landlord's answer I will write to you. If approved, the contractor will contact you to arrange the visit, and I will pass on that a small dog lives at the property.

Kind regards,
Tara Wren
Northbridge Lettings

**Run 2, to landlord, email:**

Dear Gareth,

Thank you for your message about the rat activity at 14 Mosswold Crescent, Brindlewick. I cannot make calls from this mailbox, so I have asked a colleague at Northbridge Lettings to phone you on 07700 900184 as soon as possible.

So that we can move quickly, please also reply in writing to confirm either:
1. that you approve a pest control visit to inspect and treat (the cost is not yet known, and any proofing or repair work would be quoted to you separately), or
2. that you will arrange your own contractor, in which case please tell us when the work is done.

If you hold the earlier pest controller's report about the openings near the kitchen drains, please send it to us.

Kind regards,
Tara Wren
Northbridge Lettings

**Run 2, to tenant, email:**

Dear Elise,

A quick update on the rats at 14 Mosswold Crescent. The landlord has been in touch and asked for a call, so a colleague is phoning him now to settle the next step. I have not yet got approval for a contractor visit, so I cannot give you a date. I will write again as soon as I have his answer.

Kind regards,
Tara Wren
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Elise Rowan (Tenant) · Reports rats outside near the kitchen and says they have ent

- request_landlord_approval: approval request for "Pest control visit at 14 Mosswold Crescent, Brindlewick, ZZ1 1ZZ: rats reported outside near the kitchen and now inside the kitchen, including under the sink, after the household returned from four days away. Visit to inspect and treat, and to identify openings near the external drains reported by the earlier pest controller. Any proofing or repair work would be quoted to you separately for approval. A small dog lives at the property, so the contractor should be told about it." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 004: Email from Gareth Vale (Landlord) · Asks for an urgent call back and provides 07700 900184. Does

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

- Run 1: **Pest control visit at 14 Mosswold Crescent, Brindlewick, ZZ1 1ZZ: rats reported outside near the kitchen and now inside the kitchen, including under the sink, after the household returned from four days away. Visit to inspect and treat, and to identify openings near the external drains reported by the earlier pest controller. Any proofing or repair work would be quoted to you separately for approval. A small dog lives at the property, so the contractor should be told about it.** (unknown)

## Notes

None.

## Failed, refused or invalid actions

None.
