# Case 007: Television, bedroom light and door handle

## Decision

- **Status:** hold (Waiting for Landlord)
- **Next step:** Wait for the landlord's reply.
- **Why:** The electrician has offered 29 September after 15:00 [event 019], which fits the tenant's availability [event 016]. There is still no clear landlord approval [event 003][event 007]. The approval request was re-sent on 16 September, so the next chase is due after 3 days without an answer (rule 9). The contractor has been told not to attend until we confirm. Once approved, I will assign the electrician, confirm the date and tell the tenant.

## Summary

**Final status:** hold (Waiting for Landlord)
**Runs:** 5 · **Events seen:** up to event 19 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Ada,

Thank you for your report about 8 Vellum Court. We have asked the landlord to approve an electrician to look at the downstairs bedroom light that flickers and pops. We will arrange access in advance, and we have noted the dog.

To help us, could you please tell us:
1. Does the Samsung TV in the upstairs bedroom belong to you, or was it supplied with the property?
2. Your report mentions a door handle in the case title but not in the details. If there is a door handle problem, which door is it and what is wrong?
3. Which days and times suit you for a visit, and how should the dog be managed during it?

Kind regards,
Northbridge Lettings

**Run 2, to landlord, email:**

Dear Corin,

Thank you for your reply about 8 Vellum Court. We have noted that you do not recall leaving a TV. We are checking with the tenant who owns the Samsung TV in the upstairs bedroom, and we will not arrange anything for the TV on your behalf.

Your reply did not mention the second item, so we want to be sure. The tenant also reports that the downstairs bedroom light flickers and pops when switched on. We would like to send an electrician to inspect it and repair it. We have no quote yet. Please reply "yes" to approve the visit, or tell us your cost limit. We will arrange access with the tenant in advance because there is a dog at the property.

Kind regards,
Northbridge Lettings

**Run 3, to tenant, email:**

Dear Ada,

I wrote on 4 September about 8 Vellum Court and have not yet heard back. Could you please let us know:

1. Does the Samsung TV in the upstairs bedroom belong to you, or was it supplied with the property?
2. Is there a problem with a door handle? If so, which door and what is wrong?
3. Which days and times suit you for an electrician to look at the downstairs bedroom light, and how should the dog be managed during the visit?

We are still waiting for the landlord's approval for the electrician. We will arrange access with you in advance once it is confirmed. Please reply by Thursday 11 September if you can.

Kind regards,
Northbridge Lettings

**Run 3, to tenant, email:**

Dear Ada,

I wrote on 4 September about 8 Vellum Court and have not yet heard back. Could you please let us know:

1. Does the Samsung TV in the upstairs bedroom belong to you, or was it supplied with the property?
2. Is there a problem with a door handle? If so, which door and what is wrong?
3. Which days and times suit you for an electrician to look at the downstairs bedroom light, and how should the dog be managed during the visit?

We are still waiting for the landlord's approval for the electrician. We will arrange access with you in advance once it is confirmed. Please reply as soon as you can.

Kind regards,
Northbridge Lettings

**Run 4, to tenant, email:**

Dear Ada,

Thank you for your availability for the electrician at 8 Vellum Court. We have noted that the dog will be taken out during the visit and that the electrician should call on arrival rather than knock.

We are still waiting for the landlord to approve the visit to the downstairs bedroom light, so we cannot book a date yet. We have sent the landlord a reminder, and we will contact you as soon as we have an answer.

Two things are still open. Please could you tell us:
1. Does the Samsung TV in the upstairs bedroom belong to you, or was it supplied with the property?
2. Is there a problem with a door handle? If so, which door and what is wrong?

Kind regards,
Northbridge Lettings

**Run 5, to contractor, email:**

Dear Rian,

Thank you for proposing 29 September after 15:00 for 8 Vellum Court, Brindlewick (downstairs bedroom light that flickers and pops when switched on).

We do not yet have the landlord's approval for this visit, so please do not attend or start any work for now. We have asked the landlord and will confirm as soon as we have an answer. If approved, we will confirm the date with you, and we will ask you for an arrival time then.

Please note the tenant has a dog at the property and asks that the contractor calls on arrival rather than knocking. We will pass on the tenant's contact arrangements once the visit is confirmed.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Ada Pell (Tenant, Brindlewick) · Reported that a Samsung TV in the upstairs bedroom had an in

- request_landlord_approval: approval request for "8 Vellum Court, Brindlewick: electrician to inspect and repair the downstairs bedroom light, which flickers and makes a popping noise when switched on. The tenant has also reported a Samsung TV in the upstairs bedroom that trips a fuse when plugged in. We are checking whether the TV belongs to the tenant or the property. Access will be arranged in advance with the tenant because a dog is at the property." (cost: unknown - no quote yet. Please approve the inspection visit, or tell us your cost limit.) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 003: Email from Corin Wex (Landlord, Brindlewick) · Replied, “Please sort it. I don't remember leaving a TV.” Th

- request_landlord_approval: approval request for "8 Vellum Court, Brindlewick: electrician to inspect and repair the downstairs bedroom light, which flickers and makes a popping noise when switched on. This covers the light only. The Samsung TV in the upstairs bedroom is not part of this request. Access will be arranged in advance with the tenant because a dog is at the property." (cost: unknown - no quote yet. Please confirm the inspection visit and repair of the light, or tell us your cost limit.) sent to the landlord
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 3

- event 007: Email from Corin Wex (Landlord, Brindlewick) · An automatic reply said the landlord was away. It contained 

- send_message: ⚠ refused: the message states 11 Sep, which no event, record or document in the case shows. State only amounts and dates from the case; write "plus VAT" rather than a total you worked out, and ask for a date rather than proposing one.
- hold: ⚠ not executed: an earlier action in this response failed. Read its error, then decide again; the action was not executed
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 4

- event 016: Email from Ada Pell (Tenant, Brindlewick) · Provided availability for an electrical visit: 23 September 

- request_landlord_approval: approval request for "8 Vellum Court, Brindlewick: electrician to inspect and repair the downstairs bedroom light, which flickers and makes a popping noise when switched on. This covers the light only. The Samsung TV in the upstairs bedroom is not part of this request. The tenant has offered access on several dates from 23 September, the dog will be taken out during the visit, and the electrician will be asked to call on arrival." (cost: unknown - no quote yet. Please reply "yes" to approve the inspection visit and repair, or tell us your cost limit.) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 5

- event 019: Email from Rian Sol (Electrician, Bracken Spark Services) · Proposed attending on 29 September after 15:00. No exact arr

- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Landlord

## Approvals requested

- Run 1: **8 Vellum Court, Brindlewick: electrician to inspect and repair the downstairs bedroom light, which flickers and makes a popping noise when switched on. The tenant has also reported a Samsung TV in the upstairs bedroom that trips a fuse when plugged in. We are checking whether the TV belongs to the tenant or the property. Access will be arranged in advance with the tenant because a dog is at the property.** (unknown - no quote yet. Please approve the inspection visit, or tell us your cost limit.)
- Run 2: **8 Vellum Court, Brindlewick: electrician to inspect and repair the downstairs bedroom light, which flickers and makes a popping noise when switched on. This covers the light only. The Samsung TV in the upstairs bedroom is not part of this request. Access will be arranged in advance with the tenant because a dog is at the property.** (unknown - no quote yet. Please confirm the inspection visit and repair of the light, or tell us your cost limit.)
- Run 4: **8 Vellum Court, Brindlewick: electrician to inspect and repair the downstairs bedroom light, which flickers and makes a popping noise when switched on. This covers the light only. The Samsung TV in the upstairs bedroom is not part of this request. The tenant has offered access on several dates from 23 September, the dog will be taken out during the visit, and the electrician will be asked to call on arrival.** (unknown - no quote yet. Please reply "yes" to approve the inspection visit and repair, or tell us your cost limit.)

## Notes

None.

## Escalation

None.

## Failed, refused or invalid actions

- **send_message:** refused: the message states 11 Sep, which no event, record or document in the case shows. State only amounts and dates from the case; write "plus VAT" rather than a total you worked out, and ask for a date rather than proposing one. — agent recovered
- **hold:** not executed: an earlier action in this response failed. Read its error, then decide again; the action was not executed — agent recovered
