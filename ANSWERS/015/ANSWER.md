# Case 015: Vacant Property Preparation

## Decision

- **Status:** escalated
- **Next step:** A person decides: Decide whether the agency can and will pursue the cost from the tenant's bond, based on the check-in inventory and the move-out evidence. Then tell the landlord whether the bond condition is met, so that unconditional approval can be requested for the final scope and total once the contractor's complete quote arrives.
- **Why:** The landlord's approval is conditional on the cost being recovered from the bond [event 008]. The landlord also says the property was not in this state at move-in. This is a money and bond-liability question that the agency cannot settle by message. The quote does not match the inspection list: it adds carpet shampooing and general sanitation, and it omits the en-suite, the dog waste and the soil. Its VAT basis is unconfirmed, and the contractor's answers to our clarification questions are still outstanding [event 006]. I have not told anyone who will pay.

## Escalation

- **Checked:** Landlord's reply [event 008] and the approval requests sent earlier. The inspection report lists kitchen, oven and extractor degreasing, bathroom and en-suite limescale, kitchen waste, rear garden clearance including bagged dog waste, and disturbed soil [event 001]. Brindlewick quote NBL-015-Q1 is £665.00 [event 006]. The property is vacant, so no tenant needs contacting. No contractor is assigned and the contractor has been told not to collect keys or start.
- **Missing or in conflict:** The landlord's approval is conditional on the cost being recovered from the bond [event 008]. The landlord also says the property was not in this state at move-in. This is a money and bond-liability question that the agency cannot settle by message. The quote does not match the inspection list: it adds carpet shampooing and general sanitation, and it omits the en-suite, the dog waste and the soil. Its VAT basis is unconfirmed, and the contractor's answers to our clarification questions are still outstanding [event 006]. I have not told anyone who will pay.
- **Decision needed:** Decide whether the agency can and will pursue the cost from the tenant's bond, based on the check-in inventory and the move-out evidence. Then tell the landlord whether the bond condition is met, so that unconditional approval can be requested for the final scope and total once the contractor's complete quote arrives.

## Summary

**Final status:** escalated
**Runs:** 4 · **Events seen:** up to event 8 · **Loaded with:** lenient

## Outbox

**Run 2, to contractor, email:**

Dear Elian, thank you for your message about 18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ. Please do not collect keys or visit the property yet. We have no landlord approval for a visit or for any work, and we have asked the landlord for a decision. The property is vacant. You said the inspection report seems to describe the property as it was about ten years ago. Please tell us which items you think are out of date. The report lists: degreasing the kitchen, oven and extractor; limescale removal in the bathroom and en-suite; removal of waste left in the kitchen; clearing the rear garden, including bagged dog waste; and soil disturbed by digging. Your quote NBL-015-Q1 for £665.00 also includes carpet shampooing and general sanitation, and it does not mention the dog waste or the en-suite. Please say how you would price against the report's list. We will contact you once the landlord has replied.

**Run 3, to contractor, email:**

Dear Elian, thank you for quote NBL-015-Q1 (£665.00) for 18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ. This is not an approval, and please do not collect keys, visit or start work. The landlord has not yet replied. To give the landlord a complete, comparable quote, please confirm the following:
1. Whether £665.00 is your all-inclusive total, and whether VAT is included.
2. Whether the en-suite limescale removal is included.
3. Whether removal of the bagged dog waste in the rear garden is included.
4. Whether any making good of the disturbed soil in the rear garden is included. If not, please say so and give a separate price if you can offer it.
5. A separate price for the items on our list: degreasing the kitchen, oven and extractor; limescale removal in the bathroom and en-suite; removal of waste left in the kitchen; and rear garden clearance. Please also give a separate price for the carpet shampooing, which was not on our list.
We will come back to you once the landlord has decided.

**Run 4, to landlord, email:**

Dear Ms Quill, thank you for your reply about 18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ. We have noted that your approval depends on the cost being recovered from the bond. We cannot confirm that on our own, because a deduction from the bond depends on the check-in and move-out evidence and on the deposit scheme process. We are therefore treating this as conditional and not as a full approval. No contractor has been booked and no work will start until this is settled. A colleague will contact you about the bond position. We are also waiting for a complete, itemised quote from the contractor, so that you can approve a final scope and price.

## Timeline

### Run 1

- event 001: Note from Mira Venn (Property Manager, Northbridge Lettings) · Logged work requested after the move-out inspection: kitchen

- add_note: note added
- request_landlord_approval: approval request for "18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ (vacant after move-out). Requested work from the inspection: degrease kitchen, oven and extractor; remove limescale from the bathroom and en-suite; remove waste left in the kitchen; clear the rear garden, including bagged dog waste. The inspection also notes soil disturbed by digging, and no repair has been proposed for it. Brindlewick Turnover Services have quoted a single price of £665.00 (ref NBL-015-Q1). Differences from our list: their quote also covers carpet shampooing in Bedroom 1, stairs and landings, plus general sanitation. It does not mention bagged dog waste or the soil, and it does not name the en-suite. It is dated 8 September 2025. Please tell us whether to (a) approve the quote as written, (b) approve only the items we listed and have the contractor re-quote, or (c) use your own contractor." (cost: £665.00 (Brindlewick quote NBL-015-Q1, scope differs from the inspection list)) sent to the landlord
- hold: case on hold: Waiting for Landlord

### Run 2

- event 004: Email from Elian Wren (Contractor, Brindlewick Turnover Services) · Said the report appeared to describe the property as it had 

- send_message: email to contractor queued in the outbox
- request_landlord_approval: approval request for "Reminder for 18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ (vacant after move-out). Requested work: degrease kitchen, oven and extractor; remove limescale in bathroom and en-suite; remove waste left in the kitchen; clear the rear garden including bagged dog waste. The inspection also notes soil disturbed by digging, with no repair proposed. Brindlewick Turnover Services quote NBL-015-Q1 is £665.00. It also covers carpet shampooing and general sanitation, and it omits the dog waste and en-suite. The contractor has now asked to collect keys and visit to inspect before pricing, and says the inspection report seems to describe the property as it was about ten years ago. Please tell us whether to (a) approve the quote as written, (b) approve a pricing visit only, with a re-quote for our listed items, or (c) use your own contractor. No visit or work will go ahead until you reply." (cost: £665.00 (Brindlewick quote NBL-015-Q1, scope differs from the inspection list); cost of a pricing visit unknown) sent to the landlord
- hold: case on hold: Waiting for Landlord

### Run 3

- event 006: Email from Elian Wren (Contractor, Brindlewick Turnover Services) · Sent a £665 quote covering oven, hob and extractor degreasin

- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Quote

### Run 4

- event 008: Email from Nessa Quill (Landlord, Property Owner) · Replied: “Happy to approve if they are recovered from the bo

- send_message: email to landlord queued in the outbox
- escalate: case escalated to a person

## Approvals requested

- Run 1: **18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ (vacant after move-out). Requested work from the inspection: degrease kitchen, oven and extractor; remove limescale from the bathroom and en-suite; remove waste left in the kitchen; clear the rear garden, including bagged dog waste. The inspection also notes soil disturbed by digging, and no repair has been proposed for it. Brindlewick Turnover Services have quoted a single price of £665.00 (ref NBL-015-Q1). Differences from our list: their quote also covers carpet shampooing in Bedroom 1, stairs and landings, plus general sanitation. It does not mention bagged dog waste or the soil, and it does not name the en-suite. It is dated 8 September 2025. Please tell us whether to (a) approve the quote as written, (b) approve only the items we listed and have the contractor re-quote, or (c) use your own contractor.** (£665.00 (Brindlewick quote NBL-015-Q1, scope differs from the inspection list))
- Run 2: **Reminder for 18 Thistlevaunt Lane, Orvelune, ZZ1 1ZZ (vacant after move-out). Requested work: degrease kitchen, oven and extractor; remove limescale in bathroom and en-suite; remove waste left in the kitchen; clear the rear garden including bagged dog waste. The inspection also notes soil disturbed by digging, with no repair proposed. Brindlewick Turnover Services quote NBL-015-Q1 is £665.00. It also covers carpet shampooing and general sanitation, and it omits the dog waste and en-suite. The contractor has now asked to collect keys and visit to inspect before pricing, and says the inspection report seems to describe the property as it was about ten years ago. Please tell us whether to (a) approve the quote as written, (b) approve a pricing visit only, with a re-quote for our listed items, or (c) use your own contractor. No visit or work will go ahead until you reply.** (£665.00 (Brindlewick quote NBL-015-Q1, scope differs from the inspection list); cost of a pricing visit unknown)

## Notes

- Run 1: Property is vacant (move-out inspection NBL-015-INSPECTION), so there is no tenant to contact. Quote NBL-015-Q1 (Brindlewick Turnover Services, £665.00) does not match the logged scope. It adds carpet shampooing (Bedroom 1, stairs, landings) and general sanitation, which were not requested. It does not mention removing bagged dog waste or the disturbed soil, and it does not clearly cover the en-suite. It is also dated 8 September 2025, later than this case (3 September 2025). Landlord approval is requested before any contractor is assigned. The disturbed soil from digging is recorded as an inspection observation only and has no repair scope or cost yet.

## Failed, refused or invalid actions

None.
