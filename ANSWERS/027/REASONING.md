# Reasoning for case 027

## Run 1

### Events received

- [event 001]
- [event 002]
- [event 003]
- [event 004]

### Agent notes

None.

### Actions

- **send_message** (ok): The provider's quotation [event 004] shows a single lump sum of £3,865.68 with no stated VAT basis, covers only part of the checkout report [event 001], and carries a date (15 September 2025) that is after today. The earlier job email told the provider the works were agreed with the landlord [event 004], but nothing shows landlord approval [event 002 only says it is normally in place and must be checked]. I am correcting that and telling the contractor not to start. Under PB09 the missing quote facts go to the contractor first; the landlord approval request follows once a complete total is known.
- **add_note** (ok): Records that approval is outstanding, that the provider was misinformed [event 004], and what is needed next, so the next run does not assume approval exists [event 002, event 003].
- **hold** (ok): The quote is incomplete and not comparable (VAT basis unknown, no line prices, items missing, date inconsistent) [event 004]. I have asked the contractor for a complete quote and told them not to start without approval. I will request landlord approval once a full total is available.

## Run 2

### Events received

- [event 006]

### Agent notes

None.

### Actions

- **send_message** (ok): Iris Bell asked for the check-out report [event 006]. The report is available in full [event 001, attachment checkout-report.pdf], so I am answering her request by listing its items rather than leaving it unanswered. The property is vacant and keys are at the office [event 003]. Landlord approval is still unconfirmed [event 002, run 1 note], so I repeat that this is a quote only and nothing may start. I also remind her of the open clarifications on the earlier quote [event 004]: VAT basis, line prices, omitted items, boiler inspection and the date.
- **hold** (ok): The check-out report has been sent to the contractor [event 006]. A complete, comparable quote with a VAT-inclusive total is still needed [event 004]. Landlord approval is requested only once a full total is known, so the case waits for the contractor's quote.

## Run 3

### Events received

- [event 013]

### Agent notes

None.

### Actions

- **send_message** (ok): Iris Bell's new quotation still shows a single "Labour & Materials" figure of £3,865.68 with no VAT basis, no line prices and no stated exclusions [event 013]. It omits several check-out items [event 001] that we asked her to price or exclude [event 004, run 1 and run 2 emails]. Under PB09 the quote total, included work and tax basis must be complete before a landlord approval request, so the next action is a contractor clarification rather than asking the landlord for approval on an unknown total. Landlord approval is also still unconfirmed [event 002], so I repeat that nothing may start. Her point that she will only check scheduling after approval needs no answer beyond that.
- **hold** (ok): The latest quotation is still a lump sum with unknown VAT basis and omitted check-out items [event 013, event 001]. I have asked the contractor again for an itemised, VAT-inclusive, complete quote. Landlord approval will be requested once the total is known, as approval on file is not confirmed [event 002].
