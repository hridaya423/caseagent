# Reasoning for case 010

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reported a repair fault (peeling laminate, sharp edges, doors not closing) [event 001]. Repairs go to the landlord first, and approval is needed before any contractor visit or cost. The cuts make this a hazard, so I am asking for a prompt reply. No cost is known yet.
- **send_message** (ok): The tenant needs an acknowledgement and to know the landlord has been contacted. The dogs and advance access are noted [event 001]. I promise only what the agency controls.
- **hold** (ok): Approval has been requested from the landlord for a contractor inspection and quote [event 001]. No contractor can be assigned until the landlord replies.

## Run 2

### Events received

- [event 004]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The landlord asked us to obtain a quote for replacing the laminate but did not say we may send a contractor or incur any cost [event 004]. The automatic check rated the reply as unclear, so it is not approval. Rule 5 requires approval on record before any contractor visit or cost, so I am asking for the exact scope (inspection and quote only) with the cost stated as unknown. The tenant's report of cuts and doors not closing is the basis for the visit [event 001], and the earlier request had no clear answer.
- **hold** (ok): The landlord's reply asks for a quote but gives no clear approval for a contractor visit or cost [event 004]. I have sent a new request limited to inspection and quote. No contractor can be assigned until the landlord approves.

## Run 3

### Events received

- [event 010]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): Your 6 September reply asked for a quote but did not clearly approve a visit or cost [event 004]. Our second request has had no answer for 3 days, so I am sending it again under the chasing rule. The tenant has now offered access dates [event 010], so a quick reply lets us book. Approval must be on record before a contractor is assigned.
- **send_message** (ok): The tenant offered access dates [event 010]. No landlord approval is on record [event 004], so I cannot confirm a visit. I tell her honestly where things stand and that we have chased the landlord, without promising a date.
- **hold** (ok): The landlord has not approved a contractor visit or any cost [event 004]. I have chased with the tenant's access dates [event 010] and updated the tenant. No contractor can be assigned until approval arrives.

## Run 4

### Events received

- [event 012]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor says they previously quoted for a full new kitchen but gave no quote or amount [event 012]. The landlord only asked for a quote for replacing the laminate and never approved a visit or cost [event 004], and chases remain unanswered. Per the quote-boundary guidance, the total and scope are unknown, so I ask the contractor for a complete quote including tax basis and a separate laminate/door price, rather than asking the landlord to approve an unknown figure. I also tell them not to attend or start, since no approval is on record. The tenant's contact details are not passed on and no visit slot is chosen.
- **hold** (ok): I have asked the contractor for the full written quote, total, inclusions and VAT basis [event 012]. The landlord approval requests remain open and unanswered [event 004]. No contractor can be assigned or booked into the tenant's offered dates [event 010] until a complete quote exists and the landlord approves.

## Run 5

### Events received

- [event 014]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor's call said the laminate needs the kitchen stripping and a new kitchen is the practical option, but gave no current written estimate and no site visit was recorded [event 014]. The total, scope and VAT basis are unknown, so per the quote-boundary guidance the next step is to get a complete comparable quote from the contractor, not to ask the landlord to approve an unknown figure. The landlord only asked for a laminate quote and never approved a visit or cost [event 004], so I repeat that nothing is to start. My earlier request for the quote [event 012] is still not met.
- **send_message** (ok): The contractor's call widened the scope from laminate replacement to a possible new kitchen [event 014]. The landlord only asked for a laminate quote [event 004], so they should know about this change. No figures exist yet, so I do not ask for approval of an unknown total. I explain that nothing is approved and I will send both options with prices. I mention the cuts, reported by the tenant [event 001]. The last chase was sent recently [event 010], so this is an update, not a new chase.
- **hold** (ok): The contractor has given only a verbal opinion with no figures [event 014]. I have asked for a written quote with both options and the VAT basis, and told the landlord about the change in scope. No approval is on record [event 004], so nothing can be assigned or booked until the quote arrives and the landlord decides.

## Run 6

### Events received

- [event 015]

### Agent notes

None.

### Actions

- **add_note** (ok): The landlord's voicemail [event 015] says he is away until 14 September and refers enquiries to his office. It is not an approval and it gives no office contact. The next person needs to know this. Earlier requests are still unanswered [event 004], and the contractor quote is still outstanding [event 014].
- **send_message** (ok): The landlord is away until 14 September and directs enquiries to his office, but no office contact is on file [event 015]. He has not clearly approved a visit or cost [event 004]. I acknowledge the voicemail, ask for office contact details and whether the office may approve, and restate the open approval request and the tenant's dates [event 010]. I promise nothing the agency does not control.
- **send_message** (ok): The tenant is waiting for news of a visit [event 010]. The landlord's voicemail shows he is away until 14 September and gives no approval [event 015]. I explain the delay honestly and promise only what the agency controls. The tenant reported cuts [event 001], so the care reminder is brief.
- **hold** (ok): The landlord is away until 14 September and his voicemail gives no approval [event 015]. His earlier reply did not approve a visit or cost [event 004]. I have asked for his office contact details and updated the tenant. The contractor's written quote is still outstanding [event 014]. No contractor can be assigned until approval is on record.

## Run 7

### Events received

- [event 016]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord has agreed to obtain up-to-date estimates for a full new kitchen and for replacement cupboards and doors only, and says appliances, worktops and flooring are in good condition [event 016]. That is authority to get the quotes, not approval of either option or of any work [event 016]. The contractor has given only a verbal opinion and no figures [event 014], so I ask for both comparable estimates with inclusions and VAT basis. I keep the no-visit, no-work instruction in place because no visit or cost is approved [event 004], and I ask them to flag any visit fee before anything is booked.
- **send_message** (ok): The landlord asked for estimates for two alternatives and did not approve either option [event 016]. I confirm what has been requested and that nothing is approved, so no one assumes consent to work. I promise to send both options and prices for his choice, and to ask before any visit or fee [event 004].
- **hold** (ok): The landlord has requested estimates for a full new kitchen and for replacement cupboards and doors only, but has approved neither option nor any visit or cost [event 016]. I have asked the contractor for both written estimates with inclusions and VAT basis [event 014]. Once I have them I will send both to the landlord for a decision.

## Run 8

### Events received

- [event 019]

### Agent notes

None.

### Actions

- **hold** (ok): Alderline Joinery has acknowledged our request and said the updated quote will be sent. No figures, scope or visit time were given [event 019]. The landlord asked for estimates for a full new kitchen and for replacement cupboards and doors only, and approved neither option nor any visit or cost [event 016]. Approval for a visit or work has never been given [event 004]. The contractor has asked nothing that needs a reply. I will send both estimates to the landlord once they arrive. The landlord is due back on 14 September [event 015]. No contractor can be assigned or booked into the tenant's dates [event 010] until approval is on record.

## Run 9

### Events received

- [event 022]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor raised questions about commission basis, a cap and VAT that could change the quote [event 022]. I cannot settle them from the case, so I say so, tell him a colleague will respond, and keep asking for the complete written estimates with total and VAT basis the landlord requested [event 016]. I repeat that no visit or work is approved [event 004].
- **escalate** (ok): The contractor's commission and VAT questions are a money dispute over the agency's terms with him, and they could change the quote [event 022]. No message from me can settle it, so a person must decide. I have told the contractor that a colleague will respond and have asked again for the complete estimates, with no work approved [event 016].
