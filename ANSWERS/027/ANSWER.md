# Case 027: Move-out maintenance at 46 Fernwick Lane

## Decision

- **Status:** hold (Waiting for Quote)
- **Next step:** Wait for the quote's reply.
- **Why:** The latest quotation is still a lump sum with unknown VAT basis and omitted check-out items [event 013, event 001]. I have asked the contractor again for an itemised, VAT-inclusive, complete quote. Landlord approval will be requested once the total is known, as approval on file is not confirmed [event 002].

## Summary

**Final status:** hold (Waiting for Quote)
**Runs:** 3 · **Events seen:** up to event 13 · **Loaded with:** lenient

## Outbox

**Run 1, to contractor, email:**

Hello, thank you for the quotation for 46 Fernwick Lane, Aldermead, ZZ1 1ZZ (your ref NBL-027-Q1).

First, a correction to our earlier email: we have not yet received the landlord's approval for these move-out works. Please treat this as a quote only. Do not start any work or order materials until we confirm approval in writing.

To make the quote complete and comparable, please send us:
1. Your total price including VAT, and say clearly whether the £3,865.68 shown includes VAT.
2. A price for each line item, not one lump sum.
3. Prices, or a note that you are excluding them, for the items on the checkout report that your quote does not mention: kitchen flooring damage; chipped living-room laminate; warped kitchen worktop with reported water ingress; missing curtain pole, curtains and bulbs; other rusting radiators; the bedroom door frame and second newel post; and a quote to replace the stained and faded carpets.
4. Your view on the boiler casing, which the report says appears to be held with tape and needs inspection. Please give a price for an inspection.
5. The date on the quotation reads 15 September 2025. Please confirm the correct date and that the quote is current.

The property is vacant and we can arrange access for an inspection if you need one. Please include your earliest availability.

Kind regards,
Northbridge Lettings

**Run 2, to contractor, email:**

Hello Iris,

Thank you for your email. Here is the check-out report (ref NBL-027-CHECKOUT) for 46 Fernwick Lane, Aldermead, ZZ1 1ZZ. The recorded items are:

1. Damage to the staircase newel posts and a bedroom door frame.
2. Screw damage to an upstairs uPVC window frame.
3. Wall holes, plugs, nail holes and sticker residue.
4. Kitchen flooring damage; chipped living-room laminate and missing threshold.
5. Missing toilet-roll holder (downstairs), bedroom curtain pole, curtains and some bulbs.
6. Non-working top-floor smoke detector.
7. Kitchen radiator pulled away from the wall.
8. Warped kitchen worktop with reported water ingress.
9. Boiler casing apparently held with tape and requiring inspection.
10. Two reported non-working extractor fans.
11. Rusting radiators, including the en-suite radiator.
12. Ceiling or water-damage defects in the kitchen, lounge, Bedroom 3, bathroom and en-suite.
13. Altered decoration.
14. Stained and faded carpets; a replacement quotation is requested.

Please quote against this full list. This is a quotation only. Landlord approval has not been confirmed, so please do not start any work or order materials until we confirm approval in writing.

The points in our earlier email still apply: please give your total price including VAT, a price for each line item, prices (or a note of any exclusions) for items not in your first quote, a price for the boiler casing inspection, and the correct date for your quotation. The property is vacant, and we can arrange access for an inspection if you need one. Please also include your earliest availability.

Kind regards,
Northbridge Lettings

**Run 3, to contractor, email:**

Hello Iris,

Thank you for your quotation NBL-027-Q1 for 46 Fernwick Lane, Aldermead, ZZ1 1ZZ, and for confirming you will check scheduling once approval is given. Please do not start any work or order materials until we confirm approval in writing.

Before we can put the quote to the landlord, we still need the following. The quote shows one figure of £3,865.68 under "Labour & Materials", so we cannot yet compare it with the check-out report.

1. Please confirm whether £3,865.68 includes VAT, and give your total price including VAT.
2. Please give a price for each task listed in the quote, not a single lump sum.
3. The check-out report items below are not in your quote. Please give a price for each, or say clearly that you are excluding it:
   - kitchen flooring damage and chipped living-room laminate
   - warped kitchen worktop with reported water ingress
   - missing curtain pole, curtains and bulbs
   - rusting radiators other than the en-suite radiator
   - the bedroom door frame and the second newel post (your quote mentions one newel post and "a door frame")
   - replacement of the stained and faded carpets (the report asks for a replacement quotation)
4. Please give a price for inspecting the boiler casing, which the report says appears to be held with tape.
5. Please confirm that the quote date of 15 September 2025 is correct and that the quote is current.

Once we have a complete, itemised total, we will ask the landlord for approval.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Note from Maya Chen (Property Manager, Northbridge Lettings) · Move-out list records damage to the staircase newel posts an
- event 002: Update from Northbridge Lettings workflow (System) · Workflow note says landlord approval is normally already in 
- event 003: Update from Maya Chen (Property Manager, Northbridge Lettings) · The full move-out list was retained as the job description. 
- event 004: Update from Northbridge Lettings workflow (System) · A handyman provider was selected and asked to quote remotely

- send_message: email to contractor queued in the outbox
- add_note: note added
- hold: case on hold: Waiting for Quote

### Run 2

- event 006: Email from Iris Bell (Contractor, Alderwick Property Works) · Asked for the property's check-out report before preparing t

- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Quote

### Run 3

- event 013: Email from Iris Bell (Contractor, Alderwick Property Works) · Sent a quotation for the property and invited questions. The

- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Quote

## Approvals requested

None.

## Notes

- Run 1: Landlord approval for move-out works at 46 Fernwick Lane is NOT confirmed on file; the workflow note only says it is normally in place [event 002]. The provider was wrongly told the works were agreed with the landlord [event 004]; corrected by email. Quote NBL-027-Q1 (£3,865.68) has an unclear VAT basis, a future date (15 Sep 2025), no line prices, and omits several checkout items (flooring, laminate, worktop, curtains/bulbs, carpets, boiler inspection). Clarification requested. Next step: once a complete total is received, request landlord approval for the full scope and price. Property vacant; keys held at agency office [event 003].

## Escalation

None.

## Failed, refused or invalid actions

None.
