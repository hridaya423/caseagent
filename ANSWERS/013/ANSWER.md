# Case 013: Kitchen glazing maintenance request

## Decision

- **Status:** hold (Waiting for Quote)
- **Next step:** Wait for the quote's reply.
- **Why:** The contractor has ordered glass but given no quote or date [event 018]. I have asked for both and told them not to fit anything. The landlord has not given clear approval [event 010], and I have chased him. Once the quote arrives I will send it to him for approval.

## Summary

**Final status:** hold (Waiting for Quote)
**Runs:** 4 · **Events seen:** up to event 18 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Elowen,

Thank you for your report about the misted kitchen glazing at 8 Brackenmere Walk, and for confirming that the sash opens, closes and locks. I have passed the details to the landlord and asked for approval to have a glazier look at it. I will update you as soon as I hear back. If a visit is approved, the contractor will contact you to arrange a time.

Kind regards,
Northbridge Lettings

**Run 3, to tenant, email:**

Dear Elowen,

Thank you for letting us know, and for offering 24, 25 or 26 August for a visit to the kitchen glazing at 8 Brackenmere Walk. I have noted those dates so you can be present.

We are still waiting for the landlord's approval, so no visit is booked yet. Once it is approved, the contractor will contact you to arrange a time, and I will pass on your availability. I will update you when I hear back.

Kind regards,
Northbridge Lettings

**Run 4, to contractor, email:**

Dear Sella,

Thank you for your update on the kitchen glazing at 8 Brackenmere Walk, Vellumbrook, ZZ1 1ZZ. We have not yet had the landlord's approval for a repair, so please do not fit anything until we confirm approval in writing.

Please send us:
1. Your written quote for the work, with the total price and whether it includes VAT.
2. The expected delivery date for the glass and when you could attend.

The tenant wants to be present for the visit, so please wait for us to confirm before contacting her to book. We will send the quote to the landlord and come back to you once we have his answer.

Kind regards,
Northbridge Lettings

**Run 4, to landlord, email:**

Dear Mr Vale,

I am following up on the misted kitchen window at 8 Brackenmere Walk, Vellumbrook, ZZ1 1ZZ (moisture between the panes, water around the frame, cold kitchen). You said you were happy to use the contractor if £180 was the total value of the quote. We have not yet had a reply to our question on whether you approve a glazier to inspect and quote, or whether the £180 includes VAT.

Clearfirth Glazing has now told us the glass has been ordered and is awaiting delivery. They have not given a price or a date. I have asked for a written quote and told them not to fit anything until you approve in writing. I will send you the quote as soon as I have it. Please let me know whether the £180 includes VAT and whether you approve the visit.

Kind regards,
Northbridge Lettings

**Run 4, to tenant, email:**

Dear Elowen,

An update on the kitchen glazing at 8 Brackenmere Walk. The glazier has told us the glass has been ordered and is awaiting delivery, but we have no delivery date or visit time yet. We are also still waiting for the landlord's approval, so no visit is booked for 24, 25 or 26 August. I will let you know as soon as there is a date. Please tell me your availability for the following weeks so I can pass it on.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Email from Elowen Marr (Tenant) · Reported moisture between the kitchen glazing panes, water g

- request_landlord_approval: approval request for "Glazier to inspect and quote for the misted double-glazed kitchen window at 8 Brackenmere Walk, Vellumbrook, ZZ1 1ZZ (moisture between the panes, water gathering around the frame, kitchen very cold, tenant concerned about damp). The sash opens, closes and locks. Approval requested for the visit and a quote only; no repair until you approve a quote." (cost: unknown - quote to follow after inspection) sent to the landlord
- add_note: note added
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 010: Email from Orren Vale (Landlord) · Said he had been away and was catching up on email. Wrote th

- request_landlord_approval: approval request for "Please confirm the following for the misted double-glazed kitchen window at 8 Brackenmere Walk, Vellumbrook, ZZ1 1ZZ (moisture between the panes, water around the frame, cold kitchen). (1) Do you approve a glazier attending to inspect and quote? We have no quote yet, so we cannot say whether the total will be £180. (2) Once we have the quote, we will send it to you. We will only book the repair if you approve it in writing, and we will not go ahead with any repair on the visit itself. Please also say whether the £180 is meant to include VAT." (cost: Unknown - no quote yet. Landlord said he is happy to use the contractor if the total quote is £180.) sent to the landlord
- hold: case on hold: Waiting for Landlord

### Run 3

- event 014: Email from Elowen Marr (Tenant) · Said she was away for two weeks and wanted to be present for

- send_message: email to tenant queued in the outbox
- add_note: note added
- hold: case on hold: Waiting for Landlord

### Run 4

- event 018: Email from Sella Vane (Contractor, Clearfirth Glazing) · Said the glass had been ordered and she was waiting for it t

- send_message: email to contractor queued in the outbox
- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Quote

## Approvals requested

- Run 1: **Glazier to inspect and quote for the misted double-glazed kitchen window at 8 Brackenmere Walk, Vellumbrook, ZZ1 1ZZ (moisture between the panes, water gathering around the frame, kitchen very cold, tenant concerned about damp). The sash opens, closes and locks. Approval requested for the visit and a quote only; no repair until you approve a quote.** (unknown - quote to follow after inspection)
- Run 2: **Please confirm the following for the misted double-glazed kitchen window at 8 Brackenmere Walk, Vellumbrook, ZZ1 1ZZ (moisture between the panes, water around the frame, cold kitchen). (1) Do you approve a glazier attending to inspect and quote? We have no quote yet, so we cannot say whether the total will be £180. (2) Once we have the quote, we will send it to you. We will only book the repair if you approve it in writing, and we will not go ahead with any repair on the visit itself. Please also say whether the £180 is meant to include VAT.** (Unknown - no quote yet. Landlord said he is happy to use the contractor if the total quote is £180.)

## Notes

- Run 1: Tenant attached glazing-invoice.pdf (Clearfirth Glazing, ref NBL-013-INV-09, dated 10 September 2025, "supply and fit 1 pane of glass to the kitchen glazing"). The amount is blank and the date is later than the report date (31 July 2025). No approved work has been recorded. It is not treated as a quote or as proof of work. Check where this document came from.
- Run 3: Tenant is away for two weeks and is available for a visit on 24, 25 or 26 August 2025 (she wants to be present). Pass this to the glazier once the landlord approves. Landlord approval for inspection/quote is still outstanding; his earlier reply was conditional on a £180 total quote.

## Escalation

None.

## Failed, refused or invalid actions

None.
