# Reasoning for case 026

## Run 1

### Events received

- [event 001]
- [event 002]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reported damp staining and lifting paint below the kitchen window. She said the patch has grown since last week and asked for an inspection [event 001]. This is a repair-type fault, so the landlord must approve before any contractor visit or cost (rule 5). The item and room are clear, and no safety emergency is reported. No quote exists yet, so the cost is unknown [event 002].
- **send_message** (ok): The tenant asked to be told when someone can attend [event 001]. No access preference is recorded beyond email contact [event 002]. I have told her that landlord approval is pending, that the contractor will contact her once it is given, and that she can share access preferences. I have promised no date.
- **hold** (ok): Approval for the inspection has been requested from the landlord, with the cost stated as unknown. No contractor can be assigned until the landlord approves [event 001].

## Run 2

### Events received

- [event 004]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant gave a fuller description and access times (weekdays after 13:00) [event 004]. I acknowledged them and said the landlord's approval is still pending from my earlier request [event 001, event 002], so no date can be promised. No water or safety emergency is described, so no escalation is needed. Contractor assignment must wait for the landlord's approval (rule 5).
- **add_note** (ok): Records the tenant's access window and condition details from [event 004] for the later contractor assignment, as no access preference was recorded before [event 002].
- **hold** (ok): The landlord has not yet replied to the inspection approval request sent in run 1 [event 001]. No contractor can be assigned until approval is given. The tenant's access details are recorded [event 004]. Chase after 3 days without an answer (rule 9).

## Run 3

### Events received

- [event 007]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor offered a slot for 6 March after 13:00 [event 007], but the landlord has not yet approved the inspection requested in run 1 [event 001, event 002]. Rule 5 requires approval before any contractor visit, so I have told him not to attend or book yet. The slot fits the tenant's access window of weekdays after 13:00 [event 004]. I have not confirmed a date to anyone. The request is under 3 days old, so no chase is due.
- **add_note** (ok): This records the offered slot and its limits [event 007] for the next run, as approval is still pending from the request in run 1.
- **hold** (ok): The inspection approval requested in run 1 has had no landlord reply yet. The contractor's slot offer [event 007] cannot be accepted without it. Chase the landlord after 3 days without an answer (rule 9).

## Run 4

### Events received

- [event 009]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant gave a date she is home [event 009] and asked earlier to be told when someone can attend [event 001]. I have answered that the visit is not yet confirmed because landlord approval is outstanding. I told her a person is dealing with the case now, as damp beside a socket is possible water near electrics (rule 18). I added no repair advice of my own (messages rule).
- **escalate** (ok): The new tenant report puts damp staining next to a socket [event 009]. Rule 18 requires immediate escalation where water near electrics could make the home unsafe before a normal repair arrives. The landlord has not approved anything [event 001], so I cannot assign the contractor. A person must phone the landlord and judge the risk. I have told the tenant that a person is dealing with it.
