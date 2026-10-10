# Reasoning for case 021

## Run 1

### Events received

- [event 001]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reports a fault that needs a repair: no hot water and a boiler with no power [event 001]. Under the rules the landlord is asked first, and approval is needed before any contractor visit or cost. The tenant has already checked the switch, so no further tenant check is needed first [event 001]. The cost is unknown until an engineer has assessed the boiler.
- **send_message** (ok): Acknowledges the tenant's report of no hot water and a boiler with no power [event 001] and says the landlord is being asked first. It promises only what the agency controls. It includes a short safety prompt, since the tenant mentioned birds are kept at the property and nothing in the report shows a gas or CO sign [event 001].
- **hold** (ok): Landlord approval for an engineer visit has been requested and no contractor can be assigned until the landlord replies [event 001].

## Run 2

### Events received

- [event 012]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): Our approval request of 6 May has had no landlord reply for 5 days, so under the 3-day rule we send it again and keep waiting [event 001]. The tenant has now confirmed that nothing has been done and no hot water or boiler power has been restored [event 012]. No contractor can be assigned without approval.
- **send_message** (ok): The tenant says nothing has been done and the fault persists [event 012]. The landlord has not answered the approval request for an engineer [event 001], so I tell the tenant honestly that I have chased and promise only what the agency controls.
- **hold** (ok): First chase sent to the landlord for the engineer-visit approval; no contractor can be assigned until the landlord approves [event 001][event 012]. Escalate after 3 unanswered chases.
