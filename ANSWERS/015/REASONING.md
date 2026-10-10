# Reasoning for case 015

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **add_note** (ok): The property is vacant [event 001] and the inspection report confirms it, so this is recorded as the policy requires. The quote differs from the requested work and carries an odd date, so I am recording those points for whoever picks up the case.
- **request_landlord_approval** (ok): The inspection report and the property manager's note [event 001] show work is needed to prepare the vacant property. A cost needs landlord approval before any contractor is assigned. The quote on file does not match the logged scope, so I am sending the landlord the actual quote and the differences and not choosing for them.
- **hold** (ok): No approval is on file for the £665.00 quote or any contractor visit. The approval request has been sent to the landlord, and the property is vacant so there is no tenant to contact [event 001].

## Run 2

### Events received

- [event 004]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor asked whether to collect keys and inspect before pricing [event 004]. No landlord approval is on file for a visit or cost, so a visit or key issue is not allowed yet. The earlier approval request [event 001 and run 1] is still unanswered. I am asking the contractor to clarify the report discrepancy and the quote scope, without authorising any attendance.
- **request_landlord_approval** (ok): Our first approval request was sent on 3 September and has had no reply for over 3 days, so rule 9 requires sending it again. The contractor's key and inspection question [event 004] is new information the landlord needs in order to decide. Nothing can be assigned or visited without approval.
- **hold** (ok): The contractor has been told not to collect keys or visit [event 004]. The approval request has been re-sent to the landlord, and nothing can proceed without their reply.

## Run 3

### Events received

- [event 006]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor's new email [event 006] repeats the £665 quote, which matches the quote already on file. It does not cover the en-suite, the bagged dog waste or the disturbed soil, and it adds carpet shampooing that the inspection did not list [event 001]. The tax basis is also unstated. The workflow says to get a complete, comparable quote from the contractor before the landlord is asked to approve changed scope. No landlord approval is on file, so the contractor is told not to visit or start. The landlord was last chased on 7 September, less than 3 days ago, so no new chase is due yet.
- **hold** (ok): We need the contractor to confirm the total, tax basis and scope, and to price the listed items separately [event 006]. The landlord's approval request is still unanswered, and nothing can be assigned until they reply. The property is vacant.

## Run 4

### Events received

- [event 008]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord's reply approves only if the cost is recovered from the bond [event 008]. That is a condition the agency cannot confirm, so it is not approval under rule 5, and the automatic check also marked it unclear. I am telling the landlord plainly, without promising bond recovery or saying who pays, that nothing is booked yet.
- **escalate** (ok): The landlord's "approve if recovered from the bond" is a condition that is not met and that I cannot meet [event 008]. It is also a dispute about who pays, which rule 19 sends to a person. Rule 5 means there is no approval, so I cannot assign the contractor. The landlord has been told that a colleague will follow up.
