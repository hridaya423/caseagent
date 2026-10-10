# Reasoning for case 018

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reports rats entering the kitchen, including beneath the sink, and says earlier baiting arranged by the landlord only reduced activity for a time; the earlier pest controller mentioned openings near the drains and a report to follow [event 001]. This is a fault needing a repair/treatment, so the landlord is asked first and approval is needed before any contractor visit or cost. The cost is unknown. Asking the landlord also for the earlier pest-control report.
- **send_message** (ok): Acknowledge the tenant's report and tell them the next step: the landlord has been asked for approval; no contractor is promised before approval [event 001].
- **hold** (ok): Approval requested from the landlord for the pest control visit; no contractor can be assigned until the landlord answers [event 001].

## Run 2

### Events received

- [event 004]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord asked for an urgent call back and gave a number, but gave no approval and did not say whether he will use his own contractor [event 004]. I cannot phone, so I tell him a colleague will call and ask for written approval or his own-contractor choice, restating the unknown cost, as the earlier request is still unanswered [event 001].
- **send_message** (ok): The tenant has had no update for 3 days; the landlord replied but did not approve [event 004], so I tell her honestly where things stand without promising a contractor [event 001].
- **escalate** (ok): The landlord requested an urgent call back and gave no approval [event 004]. Only a person can phone him. I have emailed him and updated the tenant, and have not assigned a contractor because there is no approval [event 001].
