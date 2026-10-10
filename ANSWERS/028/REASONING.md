# Reasoning for case 028

## Run 1

### Events received

- [event 001]
- [event 002]

### Agent notes

None.

### Actions

- **add_note** (ok): Rule 11 requires a note that the property is not tenanted [event 001]. The note also records the approval gap and the quote's date anomaly [event 002].
- **request_landlord_approval** (ok): Our file only has an internal note that approval was "already given" [event 001]. There is no landlord message and no approved amount. Rule 5 requires approval on record, with the cost, before any contractor is assigned. The quote is £564.48 for the whole bundle, with no per-item costs or responsibility allocation [event 002]. I am asking for explicit approval of this scope and amount before dispatch.
- **hold** (ok): No contractor can be assigned until the landlord explicitly approves the scope and the £564.48 quote. The internal "already given" note is not a landlord approval of this cost [event 001]. The property is vacant, so no tenant message is needed. The case waits for the landlord's reply.

## Run 2

### Events received

- [event 017]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord declined the agency provider's quote and said she will arrange her own company for Wednesday morning [event 017]. Rule 8 says to let her and ask her to tell us when the work is done. The property is vacant, so there is no tenant to contact [event 001]. I am not assigning a contractor, because the quote was refused. I also offered help with access, since the vacant-property access arrangement is the landlord's to confirm.
- **hold** (failed): The landlord is using her own contractor [event 017]. The case waits for her to confirm the work is done, which is the proof of completion under rule 13 when the landlord arranged the work.
- **send_message** (ok): The landlord will use her own company on Wednesday morning at the vacant property [event 017]. No access arrangement is on record. The earlier email only invited her to tell us if she needed anything. This email asks directly how access will be arranged. It also repeats the request to tell us when the work is done, under rule 8. We are not instructing any contractor or promising key entry.
- **hold** (ok): The landlord is managing the work herself with her own company [event 017]. We are waiting for her to confirm how access to the vacant property will work on Wednesday, and then to confirm the work is done. Her confirmation will be the proof of completion under rule 13. No contractor has been assigned.

## Run 3

### Events received

- [event 021]

### Agent notes

None.

### Actions

- **add_note** (ok): The landlord confirmed completion without supporting documents [event 021]. Rule 15 says to record missing photos or documents in a note. The property is vacant and the landlord arranged her own contractor [event 017][event 001].
- **send_message** (ok): The landlord arranged the work herself and reported it complete [event 021][event 017]. Rule 14 requires telling her the result and the invoice position. No agency contractor was assigned, so no invoice is due from us. I asked only for optional photos or paperwork.
- **close_case** (ok): The landlord declined the agency quote and arranged her own company [event 017]. She then confirmed the work completed [event 021]. Under rule 13 her confirmation proves completion when she arranged the work. She is the source of the result and has been sent a summary. The agency issued no keys on record and assigned no contractor, so no invoice is due to us. The missing photos and documents are recorded in a note. No promised action remains open.
