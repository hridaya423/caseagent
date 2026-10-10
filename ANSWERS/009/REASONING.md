# Reasoning for case 009

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **add_note** (ok): The attachment [event 001] names another property and is unrelated to the window fault. I am recording the mismatch so it is not mistaken for evidence on this case.
- **request_landlord_approval** (ok): This is a repair fault, so the landlord is asked first [event 001]. The tenant has given the item (bedroom window), the symptom and the likely cause, and reports no special access needs. No cost is known yet, so I am asking for approval of the inspection and quote only.
- **send_message** (ok): The tenant reported the fault [event 001]. This acknowledges the report, says the landlord has been asked, and points out that the attachment relates to another property.
- **hold** (ok): Landlord approval for the inspection and quote has been requested [event 001]. No contractor can be assigned until the landlord replies.

## Run 2

### Events received

- [event 004]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord asked for a call and said he is waiting for the insurance excess [event 004]. That is not approval of the inspection requested earlier, so no contractor is assigned. I cannot phone, so I tell him a colleague will call and restate the approval needed.
- **escalate** (ok): The landlord asked the agency to call him [event 004]. A person must make that call because I cannot phone. His message is not approval, so I cannot assign a contractor. I have sent him an email saying a colleague will call.
