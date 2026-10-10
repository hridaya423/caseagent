# Reasoning for case 003

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **add_note** (ok): The attachment names a different property and carries a future date [event 001]. It cannot count as completion evidence or an invoice for Juniper Mews, so I am recording the mismatch to stop it being relied on later.
- **request_landlord_approval** (ok): The tenant reports faults that need repair, so the landlord must approve before any contractor visit or spend [event 001]. The report names the items and rooms, so no tenant question is needed first. The cost is not known yet. The damp from the vent leak could worsen with further rain, so a prompt reply is useful.
- **send_message** (ok): The tenant should know the report is received and with the landlord, per the landlord-first rule [event 001]. The attached invoice is for a different address and has a future date, and the photos did not come through, so I ask the tenant to clarify. I promise no cost, date or outcome.
- **hold** (ok): Approval for the assessment visit has been requested and nothing may be assigned until the landlord replies [event 001].

## Run 2

### Events received

- [event 004]

### Agent notes

None.

### Actions

- **assign_contractor** (ok): The landlord replied "Yes, please proceed" to the assessment visit request, and the automatic check shows approved [event 004]. The approval covers the visit only. The scope was stated as assessment with any repair to be quoted separately, so the notes limit the contractor to assessing and quoting [event 001].
- **send_message** (ok): Rule 6: after approval, the tenant is told that the contractor will contact them to arrange the visit [event 004]. I repeat the open request about the photos and the mismatched invoice from the earlier run [event 001], and promise no cost or date.
- **send_message** (ok): The landlord approved the visit and also asked for an insurance check and a review of the flat's history, so those questions must be answered now [event 004]. The case holds no policy or history details, so I say so plainly, promise only the photos and findings, and invite the landlord to supply the history. I do not claim cover or fault.
- **add_note** (ok): The landlord's insurance and history request needs a record for the next handler [event 004]. The approval boundary is noted so no repair is authorised by mistake.
- **hold** (ok): The landlord approved the assessment visit and I assigned the plumber, limited to assessment and a quote [event 004]. The tenant has been told the plumber will make contact. The landlord has an answer on insurance and flat history. The case now waits for the plumber to book access and report findings or a quote. Any repair needs fresh landlord approval.

## Run 3

### Events received

- [event 007]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant gave availability including Friday 12 September and consent to attend while they are out [event 007]. The plumber was assigned but no appointment is confirmed, so I pass the access information on and ask for a proposed date and key need. I cannot confirm key holding from the case, so I do not promise it. I repeat the visit limit: approval covers assessment only [event 004].
- **send_message** (ok): The tenant offered dates and unaccompanied access [event 007]. They should know it has gone to the plumber and that a confirmed date will follow. I promise nothing about keys or dates, which the plumber has not yet confirmed.
- **add_note** (ok): Key issue affects the final checks if keys are issued [event 007].
- **hold** (ok): Access options passed to the plumber; waiting for a proposed date and key need so the appointment can be confirmed [event 007].

## Run 4

### Events received

- [event 009]

### Agent notes

None.

### Actions

- **send_message** (ok): The plumber proposed Friday 12 September at about 09:00 [event 009], which falls within the tenant's all-day availability that included 12 September and the consent to attend while they are out [event 007]. The slot is viable, so I confirm it. The plumber has not said whether keys are needed, so I ask and do not promise key entry. I repeat that the approval covers assessment only [event 004].
- **send_message** (ok): The tenant needs to know the proposed date and time [event 009], which matches their offered availability for 12 September and their consent to attend while they are out [event 007]. The key arrangement is not yet settled, so I promise nothing on keys and invite the tenant to tell us if the date stops suiting them.
- **hold** (ok): The appointment is set for Friday 12 September at about 09:00 [event 009], within the tenant's availability [event 007]. We are waiting for the plumber to say whether keys are needed so access can be confirmed. Approval covers assessment only [event 004].

## Run 5

### Events received

- [event 014]

### Agent notes

None.

### Actions

- **send_message** (ok): The plumber says the job was done today and asks to cancel, but gives no detail on which issues, no report and no invoice [event 014]. The booked visit was for 12 September [event 009], and approval covered assessment only [event 004]. The invoice on file names another address and a future date [event 001]. Completion is not proven, so I ask for specifics and evidence and flag the invoice mismatch.
- **send_message** (ok): The plumber's claim that the job was done today [event 014] conflicts with the booked 12 September visit [event 009] and has no detail. The tenant can confirm whether anyone attended and what the state of the items is, so I ask them and say I am checking, without deciding who is right.
- **hold** (failed): The plumber's message does not prove which issues were done or whether unapproved repairs were carried out [event 014]. I have asked him for the work description, access, photos and invoice, and asked the tenant to confirm attendance and the current state. The landlord will be told the result once the evidence is in.
- **send_message** (ok): The workflow requires an interim update to the landlord on what is confirmed and what is still being checked. The plumber claims the job was done today but gives no detail [event 014]. The landlord approved assessment only [event 004] and was promised an update when the plumber reported. I do not state completion, a cause, photo contents or any payer.
- **hold** (ok): The plumber's message does not prove which issues were done or whether unapproved repairs were carried out [event 014]. I have asked him for the work description, access, photos and invoice, asked the tenant to confirm attendance and the current state, and sent the landlord an interim update. The case waits for the plumber's evidence before any completion checks.

## Run 6

### Events received

- [event 015]

### Agent notes

None.

### Actions

- **send_message** (ok): Event 015 ("Booked for tomorrow") conflicts with event 014 ("Please cancel appointment. Job was done today."), and neither gives detail. The plumber can confirm the appointment date and whether work happened, so I ask him to confirm rather than choose one reading or escalate [event 009]. I keep the 12 September booking in place and repeat that approval covers assessment only [event 004]. The tenant and landlord have already been told we are checking [event 014].
- **hold** (ok): The plumber's two messages conflict on whether the visit is cancelled or booked for tomorrow, and on whether work was done today [event 014][event 015]. I have asked him to confirm. The tenant has also been asked what happened [event 014]. Completion is not proven, and no invoice is on file that matches this property [event 001].

## Run 7

### Events received

- [event 016]

### Agent notes

None.

### Actions

- **send_message** (ok): The plumber phoned the tenant and agreed attendance on 12 September, likely late morning, which the tenant accepted [event 016]. This settles the booking conflict between the cancel and "booked for tomorrow" messages in favour of tomorrow [event 014][event 015], and moves the time from 09:00 [event 009]. The call reported no completed work, so the tenant's answer on whether anyone attended today is still needed [event 014]. Approval covers assessment only [event 004].
- **send_message** (ok): The plumber's call with the tenant confirms attendance on 12 September, late morning [event 016], resolving the date conflict [event 015]. His claim that work was done today is still unexplained and unverified, and the invoice on file names another address and a future date [event 014][event 001]. I restate the open evidence requests and the assessment-only limit [event 004].
- **hold** (ok): The visit is now consistently set for tomorrow, 12 September, late morning, agreed by plumber and tenant [event 016]. Completion is not proven: the plumber has not explained his "job was done today" message and no matching invoice is on file [event 014][event 001]. The case waits for the plumber's answers and the visit report, and for the tenant's reply on whether anyone attended today.

## Run 8

### Events received

- [event 020]

### Agent notes

None.

### Actions

- **send_message** (ok): The call shows the plumber attending the flat on 12 September and being let in by the tenant [event 020]. Approval covers assessment only [event 004], so I repeat that no repair or cost may start without the landlord's approval. His earlier claim that the job was done on 11 September remains unexplained, and the invoice on file names a different address and a future date [event 014][event 001]. Those evidence requests stay open. He gave the address as 8-10, so I restate the correct address [event 020].
- **hold** (ok): The plumber is attending for the approved assessment on 12 September [event 020]. Completion is not proven: there is no visit report, no matching invoice and no explanation of his 11 September message [event 014][event 001]. The case waits for his findings, quote and photos. Any repair needs fresh landlord approval [event 004].

## Run 9

### Events received

- [event 022]

### Agent notes

None.

### Actions

- **send_message** (ok): The plumber's invoice reports a new kitchen mixer tap and a new insert and head on the basin hot tap [event 022]. The attached invoice names 28 Larkspur Quay, Brindlewick, and shows no amount [event 001]. The records do not agree, so the work cannot be matched to this property and I need a corrected invoice with the total. The landlord approved assessment only, so no repair or cost was approved beforehand [event 004]. The invoice is silent on the vent and the damp, which were in the report [event 001]. His earlier "done today" message conflicts with the 12 September visit [event 014][event 020].
- **send_message** (ok): The contractor's invoice reports repairs [event 022]. The landlord approved assessment only [event 004], so I must say in this message that the repairs and cost were not approved beforehand, and leave the payment decision to him. The amount is missing and the address on the invoice is wrong [event 001], so I say a corrected invoice will follow. The landlord was promised updates [event 004] and has had interim updates [event 014], so he is told what is confirmed and what is outstanding, including the vent and the damp. I name no payer.
- **send_message** (ok): The plumber reports tap work [event 022] after attending on 12 September [event 020]. The tenant has not yet answered my earlier questions on whether work was done and on the state of the items [event 014]. The tenant can confirm the current state of the taps, the vent and the damp. The photos requested in earlier messages are still missing [event 001].
- **hold** (ok): The invoice describes tap work but names a different property and has no amount [event 022][event 001]. The work was not approved beforehand, as approval covered assessment only [event 004]. I cannot close the case until a corrected invoice matching Juniper Mews is on file, and until the vent and damp findings are known. The landlord and the tenant have been written to, and I have asked the plumber for a corrected invoice, the amount, the date, photos and the vent and damp findings.
