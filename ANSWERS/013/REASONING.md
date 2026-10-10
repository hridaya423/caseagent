# Reasoning for case 013

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reports a failed seal or misting between the panes of the kitchen glazing, with water around the frame and a cold kitchen [event 001]. This is a fault that needs a repair, so the landlord comes first (rule 1). The item and room are clear, and it is not a setting or tenant-caused issue. No cost is known. The attached invoice has no amount and is dated 10 September 2025, which is after today, so it does not give a cost or show any work is done.
- **add_note** (ok): The attachment to the request conflicts with the case timeline: it is a future-dated invoice with no amount, and no work has been approved or done [event 001]. Recording this so nobody treats it as a quote or completion evidence.
- **send_message** (ok): Acknowledge the tenant's report and tell them the next step, which is that the landlord has been asked for approval [event 001]. I promise no outcome or date.
- **hold** (ok): Landlord approval for the inspection and quote has been requested. No contractor can be assigned until the landlord replies [event 001].

## Run 2

### Events received

- [event 010]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The landlord's reply is conditional: he is happy to use the contractor if £180 is the total value of the quote [event 010]. No quote exists yet, so the condition is not met and this is not a clear approval (rule 5). It also does not say whether he approves the inspection visit alone. The invoice attached to the request has no amount and a future date, so it is not a quote [event 001]. I am keeping to the boundary he set and not inventing permission for a repair (rule 7, PB09). I am asking him to confirm the inspection and quote visit and whether £180 includes VAT. Then I can assign the glazier within what he has approved.
- **hold** (ok): The landlord's reply is conditional on a £180 total quote that does not exist yet [event 010]. I have asked him to confirm approval for an inspection and quote visit. No contractor is assigned until he replies.

## Run 3

### Events received

- [event 014]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant gave availability of 24, 25 or 26 August and wants to be present [event 014]. The landlord's reply was conditional on a £180 quote and has not yet given clear approval; I asked him to confirm the inspection and quote visit [event 010]. No contractor can be assigned until he approves, so I acknowledge the dates, say nothing is booked, and promise only that the contractor will contact her after approval (rules 5, 6).
- **add_note** (ok): Record the tenant's availability for scheduling later [event 014] while the landlord's clear approval is still awaited after his conditional reply [event 010].
- **hold** (ok): My request to the landlord to confirm approval for an inspection and quote visit is unanswered; his earlier reply was conditional and not an approval [event 010]. The tenant's dates are recorded [event 014]. No contractor is assigned until he approves.

## Run 4

### Events received

- [event 018]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor says glass is already ordered but gave no date, quote or attendance time [event 018]. The landlord's only reply was conditional on a £180 total quote and no repair has been approved [event 010]. Under rule 7, a contractor waiting for parts means I ask for the quote and date, tell them not to fit without approval, and hold. I am not assigning or authorising any work.
- **send_message** (ok): The landlord has not answered my earlier request for 13 days [event 010]. His reply was conditional on a £180 quote, so there is no clear approval. The contractor reports ordering glass with no quote [event 018]. I am chasing him (rule 9), giving the update, and promising only to send the quote and wait for his written approval (rules 5, 7).
- **send_message** (ok): The contractor has no delivery date or attendance time [event 018], and the tenant's offered dates of 24-26 August cannot be used [event 014]. I keep her informed, promise nothing the agency does not control, and ask for later availability.
- **hold** (ok): The contractor has ordered glass but given no quote or date [event 018]. I have asked for both and told them not to fit anything. The landlord has not given clear approval [event 010], and I have chased him. Once the quote arrives I will send it to him for approval.
