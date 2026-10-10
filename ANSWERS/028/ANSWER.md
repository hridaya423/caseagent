# Case 028: Move-out maintenance request

## Decision

- **Status:** closed (work_completed)
- **Next step:** None. The case is closed.
- **Why:** The landlord declined the agency quote and arranged her own company [event 017]. She then confirmed the work completed [event 021]. Under rule 13 her confirmation proves completion when she arranged the work. She is the source of the result and has been sent a summary. The agency issued no keys on record and assigned no contractor, so no invoice is due to us. The missing photos and documents are recorded in a note. No promised action remains open.

## Summary

**Final status:** closed (work_completed)
**Runs:** 3 · **Events seen:** up to event 21 · **Loaded with:** lenient

## Outbox

**Run 2, to landlord, email:**

Dear Ms Quill,

Thank you for your reply. We understand you have declined the Pineglass Property Repairs quote and will arrange your own company to carry out the move-out works at 42 Mallowfen Crescent, Ternwick, ZZ1 1ZZ on Wednesday morning, while the cleaning is taking place. We have not instructed Pineglass or any other contractor.

The works are: repair or replace the electric meter cabinet door hinges; remove the four nails in Bedroom 1 and touch up the paint as needed; and remove the sticker residue from the front door.

Please let us know once the work is done. If you need anything from us to arrange access to the vacant property on Wednesday, please tell us.

Kind regards,
Northbridge Lettings

**Run 2, to landlord, email:**

Dear Ms Quill,

One further question on my earlier email about 42 Mallowfen Crescent, Ternwick, ZZ1 1ZZ. As the property is vacant, how will your own company get in on Wednesday morning? For example, will you or the cleaners let them in, is there a caretaker, or do you need us to arrange keys? Please tell us so we can record it. We will not give out keys or arrange entry unless you ask us to.

Please also let us know when the work is finished.

Kind regards,
Northbridge Lettings

**Run 3, to landlord, email:**

Dear Ms Quill,

Thank you for confirming that the move-out works at 42 Mallowfen Crescent, Ternwick, ZZ1 1ZZ have been completed: the electric meter cabinet door hinges, the four nails and paint in Bedroom 1, and the sticker residue on the front door. We have recorded this and will close our file.

As you arranged your own company, we did not instruct any contractor, so there is no invoice from us for this work. If you have photos or paperwork from your contractor, please send them and we will add them to the file.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Note from Talia Wren (Property Manager, Northbridge Lettings) · Opened case NBL-028 for the move-out items: repair or replac
- event 002: Note from Talia Wren (Property Manager, Northbridge Lettings) · A check-out report is on file. The requested works are liste

- add_note: note added
- request_landlord_approval: approval request for "Move-out works at 42 Mallowfen Crescent, Ternwick, ZZ1 1ZZ (vacant), following the check-out inspection: (1) repair or replace the electric meter cabinet door hinges; (2) remove four wall nails in Bedroom 1 and touch up the paint as needed; (3) remove sticker residue from the front door. Contractor: Pineglass Property Repairs, quote ref NBL-028-Q1, a single bundled price with no item breakdown. Please note the quote is dated 10 September 2025, which is later than today, so we are asking Pineglass to confirm the date. The check-out report does not say who bears the cost, and we are not stating that here." (cost: £564.48 (bundled quote, Pineglass Property Repairs; VAT status not stated)) sent to the landlord
- hold: case on hold: Waiting for Landlord

### Run 2

- event 017: Email from Elowen Quill (Landlord, private owner) · Declined the agency provider's quote and said she would arra

- send_message: email to landlord queued in the outbox
- hold: ⚠ Workflow completion check: this end action was not executed. Review these applicable omissions against current evidence and policy, execute any required actions, or escalate if human judgement is needed: ["Access step for a vacant property: ask the landlord how access is arranged for her own contractor on Wednesday morning (keys, caretaker or other verified arrangement). The sent email only says to tell us if she needs anything. It does not ask her how access will be arranged, and no access arrangement is on record."]
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 3

- event 021: Email from Elowen Quill (Landlord, private owner) · Wrote: “The work has been completed at the property.” No com

- add_note: note added
- send_message: email to landlord queued in the outbox
- close_case: case closed

## Approvals requested

- Run 1: **Move-out works at 42 Mallowfen Crescent, Ternwick, ZZ1 1ZZ (vacant), following the check-out inspection: (1) repair or replace the electric meter cabinet door hinges; (2) remove four wall nails in Bedroom 1 and touch up the paint as needed; (3) remove sticker residue from the front door. Contractor: Pineglass Property Repairs, quote ref NBL-028-Q1, a single bundled price with no item breakdown. Please note the quote is dated 10 September 2025, which is later than today, so we are asking Pineglass to confirm the date. The check-out report does not say who bears the cost, and we are not stating that here.** (£564.48 (bundled quote, Pineglass Property Repairs; VAT status not stated))

## Final checks

| | |
|---|---|
| **Outcome** | work_completed |
| **Confirmed by** | landlord Elowen Quill [event 021] |
| **Landlord informed** | Yes |
| **Keys** | not_issued |
| **Invoice** | not_required |

## Notes

- Run 1: Property at 42 Mallowfen Crescent is vacant (no tenant in occupation), so there is no tenant contact on this case. Internal note says landlord approval was "already given" for move-out works, but no landlord message or approved cost is on record. Pineglass quote NBL-028-Q1 (£564.48, bundled, no item breakdown) is dated 10 Sept 2025, later than today (4 Sept 2025). Check-out report lists the works with no costs, material specs or responsibility allocation. Approval requested from landlord on the quoted figure; no contractor assigned yet.
- Run 3: Landlord reported the move-out works complete (own contractor) by email on 18 Sept 2025. No completion date, photos, invoice or contractor details were supplied, and her reply did not say which items were done or how access was arranged. Agency did not instruct Pineglass or any other contractor; no agency invoice expected. Missing photo and invoice documents recorded here. Property vacant; no keys issued by the agency on record.

## Escalation

None.

## Failed, refused or invalid actions

- **hold:** Workflow completion check: this end action was not executed. Review these applicable omissions against current evidence and policy, execute any required actions, or escalate if human judgement is needed: ["Access step for a vacant property: ask the landlord how access is arranged for her own contractor on Wednesday morning (keys, caretaker or other verified arrangement). The sent email only says to tell us if she needs anything. It does not ask her how access will be arranged, and no access arrangement is on record."] — agent recovered
