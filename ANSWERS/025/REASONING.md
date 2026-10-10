# Reasoning for case 025

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reports a constantly dripping kitchen mixer tap, wasting water, with cloudy water when filling a glass, and asks whether a new tap could be considered [event 001]. This is a repair fault and the item and room are clear, so it goes to the landlord first (rules 1 and 5). No urgency or safety issue is reported [event 001]. The cost is unknown, so I am asking for approval of the inspection visit only and will return with any quote.
- **send_message** (ok): The tenant asked whether a new tap could be considered [event 001]. This answers that question honestly without promising anything the agency does not control, and says the landlord has been asked first (rules 1, 5, 6).
- **add_note** (ok): The attachment [event 001] is a billing document with a future date, no amount, and no matching approved job. Rule 13 requires a real contractor completion or invoice, and rule 21 treats attachments as evidence only. I record the anomaly for the file.
- **hold** (ok): Approval for the plumber inspection has been requested from the landlord and the tenant has been informed [event 001]. No contractor can be assigned until the landlord approves (rule 5).

## Run 2

### Events received

- [event 003]

### Agent notes

None.

### Actions

- **assign_contractor** (ok): The landlord replied approving the works [event 003], and the automatic check shows the reply as approval. The request that approval answered covered the inspection visit only, with repair or replacement to be quoted separately [event 001]. So I am assigning a plumber for inspection only and limiting the notes to that scope and the quote boundary (rules 5, 6, 7). The landlord did not name their own contractor.
- **send_message** (ok): The landlord approved [event 003], so I tell the tenant the contractor will contact them to arrange the visit (rule 6). I make clear the approval covers inspection only, which fits her question about a new tap [event 001] without promising a replacement.
- **hold** (ok): A plumber is assigned for the inspection the landlord approved [event 003], and the tenant has been told to expect contact. We now wait for the plumber to book the visit and report findings or a quote. The landlord is abroad until Wednesday and prefers email [event 003], so any quote will be sent to them by email.

## Run 3

### Events received

- [event 007]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant offered 11, 13 and 14 August, all day [event 007]. The plumber is already assigned for the inspection the landlord approved [event 003], so I pass on the availability so the plumber can book a slot, and repeat that the approval covers the visit only (rules 6, 7; PB10).
- **send_message** (ok): The tenant sent her availability [event 007]. I confirm it has gone to the plumber, who is assigned for the approved inspection [event 003], and ask her to tell us if there is no contact or a change.
- **hold** (ok): The tenant's dates have been given to the assigned plumber, and we now wait for the plumber to confirm an appointment [event 007]. No work beyond inspection is approved [event 003].

## Run 4

### Events received

- [event 010]

### Agent notes

None.

### Actions

- **send_message** (failed): The tenant's latest message says she is home every day the following week except Monday [event 010]. This differs from her earlier offer of 11, 13 and 14 August [event 007], and no appointment has been reported. I pass the newest availability to the assigned plumber so they can book it, say the earlier dates may be superseded rather than choosing for her, and repeat that approval covers inspection only [event 003] (rules 6, 7; PB10)."
- **send_message** (failed): The tenant gave new availability for next week except Monday [event 010], which differs from her earlier offer of 11, 13 and 14 August [event 007]. I confirm it has gone to the plumber and ask her to confirm whether 13 and 14 August still stand, rather than deciding which dates apply (rule 19; PB10).
- **hold** (failed): The plumber is assigned for the approved inspection [event 003] and now has the tenant's latest availability [event 010]. We wait for the plumber to confirm an appointment, and for the tenant to say whether 13 and 14 August still stand.
- **send_message** (ok): The tenant's latest message says she is home every day the following week except Monday [event 010]. This differs from her earlier offer of 11, 13 and 14 August [event 007], and no appointment has been reported. I pass the newest availability in her own words to the assigned plumber so they can book it, say the earlier dates may be superseded rather than choosing for her, and repeat that approval covers inspection only [event 003] (rules 6, 7; PB10).
- **send_message** (ok): The tenant gave new availability for the following week except Monday [event 010], which differs from her earlier offer of 11, 13 and 14 August [event 007]. I confirm it has gone to the plumber and ask her to confirm whether 13 and 14 August still stand, rather than deciding which dates apply (rule 19; PB10).
- **hold** (ok): The plumber is assigned for the approved inspection [event 003] and now has the tenant's latest availability [event 010]. We wait for the plumber to confirm an appointment, and for the tenant to say whether 13 and 14 August still stand.

## Run 5

### Events received

- [event 012]

### Agent notes

None.

### Actions

- **add_note** (ok): The tenant raised a separate drawer fault alongside the tap complaint [event 012]. Rule 17 says to record unrelated matters with add_note and keep this case on the tap. The plumber's approval covers only the tap inspection [event 003].
- **send_message** (ok): The tenant reports no contact from the plumber despite giving availability [event 012], after we passed on her dates [event 007] and her updated availability [event 010]. For a delay complaint I need current status from the active provider and must push for an appointment (PB03, PB10). I repeat that approval covers inspection only [event 003] (rule 7). This is a chase, not yet a third unanswered reminder (rule 10).
- **send_message** (ok): The tenant says she is still waiting for contact [event 012]. I give an honest acknowledgement that the plumber has been chased, and answer her drawer question without promising anything the agency does not control. The approval covers the tap inspection only [event 003], and the drawer is an unrelated matter recorded by note (rule 17).
- **hold** (ok): The plumber has been chased for an appointment and a status update after the tenant reported no contact [event 012]. The drawer matter is noted separately. The invoice attachment is dated in the future with no amount, so it does not prove completion. We wait for the plumber's reply.

## Run 6

### Events received

- [event 014]

### Agent notes

None.

### Actions

- **send_message** (ok): The plumber offered tomorrow afternoon and asked whether the tenant is available [event 014]. Her last availability is old and she has since said she is still waiting [event 010, event 012], so I need her to confirm the specific slot (PB10: ask the party who can resolve the missing field; rule 19).
- **send_message** (ok): The plumber's offered slot is tomorrow afternoon, so the email needs a fast answer [event 014]; the SMS points the tenant to the email.
- **send_message** (ok): The contractor asked whether the tenant is available [event 014]. That question is answered by saying I am checking with her. Approval covers inspection only [event 003], so I repeat that limit (rules 7, 19).
- **hold** (ok): The plumber offered tomorrow afternoon [event 014] and the tenant must confirm she is available. I will pass her answer on to the plumber once received. The invoice attachment still shows no amount and is not proof of completion.

## Run 7

### Events received

- [event 015]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant says she is at work from 11:00 tomorrow and authorises entry with the agency's spare key [event 015]. The plumber offered tomorrow afternoon and asked about her availability [event 014], so I answer that and ask them to confirm attendance and key timing (PB10: consent for entry is now given; key handover still to arrange). Approval covers inspection only [event 003], so I repeat that limit (rule 7).
- **send_message** (ok): The tenant gave her availability and consent to key entry [event 015]. I confirm what has been passed on without promising attendance, which the plumber has yet to confirm [event 014].
- **add_note** (ok): The tenant authorised entry with the spare key [event 015]. A key may be issued to the contractor, so the final key check must be tracked (rule 15).
- **hold** (ok): The tenant has given availability and consent for key entry [event 015]. We now wait for the plumber to confirm attendance tomorrow afternoon and key timing [event 014]. Approval remains inspection only [event 003]. The invoice attachment has no amount and a future date, so it does not prove completion.

## Run 8

### Events received

- [event 017]

### Agent notes

None.

### Actions

- **send_message** (ok): The plumber says late confirmation made scheduling hard, will try to accommodate the visit, and wants earlier confirmation in future [event 017]. No attendance is confirmed. The tenant has given consent to key entry from 11:00 [event 015], so I ask the plumber for attendance and key timing (PB10, PB03), and repeat that approval covers inspection only [event 003] (rule 7). The invoice attachment is future-dated with no amount and is not completion proof, as already noted [event 001]."
- **send_message** (ok): The plumber has only said they will try to accommodate the visit [event 017], so attendance is unconfirmed. The tenant has authorised key entry and is out from 11:00 [event 015]; I keep her informed without promising attendance (PB10)."
- **hold** (ok): The plumber has not confirmed attendance or key timing [event 017]. Tenant consent for key entry is on record [event 015]. We wait for the plumber's confirmation or a new date. Approval is inspection only [event 003]; no work is proven done.

## Run 9

### Events received

- [event 019]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor sent an invoice for supply and install of a new tap with no amount, and the postcode is queried [event 019]. Landlord approval covered inspection only [event 003], and no quote or replacement approval exists. I need the amount, date, findings, postcode confirmation, photos and key return before treating the work as verified (PB03, PB09, rules 7, 14, 15). The tenant allowed spare key entry [event 015], so key status must be checked.
- **send_message** (ok): The invoice for a replacement tap arrived [event 019] although the landlord approved only an inspection [event 003] and no quote or cost approval is on record. Rule 14 says to tell the landlord that nobody approved the cost before the work and let them decide about payment. The amount is unknown, so I say details will follow, and I do not state the work is verified.
- **send_message** (ok): The invoice [event 019] is the only sign of any visit. The tenant has not reported an attendance, and the key was authorised for entry [event 015]. I ask her to confirm whether the tap was fitted and works, and what she knows about the key, to verify before any closure (PB03, rule 15).
- **add_note** (ok): Records the invoice query, the missing amount, the unapproved replacement and the open key check [event 019, event 003, event 015] so the final checks are not missed (rule 15).
- **hold** (ok): I have asked the plumber for the invoice amount, work date, findings, photos, postcode confirmation and key return [event 019]. The tenant has been asked to confirm the result, and the landlord has been told the replacement was not approved before the work [event 003]. The case cannot close until these answers arrive.

## Run 10

### Events received

- [event 022]

### Agent notes

None.

### Actions

- **add_note** (ok): The new document [event 022] fixes the postcode but adds no amount or proof of the work. The replacement was never approved [event 003]. I am recording the position so the final checks are not missed (rules 13, 15).
- **hold** (ok): The corrected invoice has the matching postcode but still shows no amount, work date or quote [event 022, event 019]. My questions to the plumber about the amount, the unapproved replacement, the attendance date, photos and the key were sent a short time ago and are unanswered. The tenant was also asked to confirm the result. Those answers are still needed before the landlord can decide on payment or the case can close. The landlord has already been told the replacement was not approved before the work [event 003]. No further message is needed yet.
