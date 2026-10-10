# Case 014: Heating service request at 7 Mallowmere Walk

## Decision

- **Status:** escalated
- **Next step:** A person decides: Treat as urgent no-heat for a vulnerable tenant: decide how to obtain landlord approval now (phone if needed) and dispatch a heating engineer promptly, passing on the tenant's call-from-outside access request.
- **Why:** No conflict. Not yet known: boiler make/age, whether a simple power/fuse check could restore it, landlord approval and cost. Tenant disclosed a mobility impairment and cannot use stairs quickly; she asks that any attendee phone from outside rather than arrive unannounced [event 003]. Hot water is still available, but heating is off in January.

## Escalation

- **Checked:** Tenant report: radiators cold, controller unresponsive, hot water still working [event 001]. Tenant confirmed no gas smell, no visible leak, boiler display blank [event 003]. Property manager already asked safety and access questions [event 002]. No landlord contact or approval yet; no contractor assigned.
- **Missing or in conflict:** No conflict. Not yet known: boiler make/age, whether a simple power/fuse check could restore it, landlord approval and cost. Tenant disclosed a mobility impairment and cannot use stairs quickly; she asks that any attendee phone from outside rather than arrive unannounced [event 003]. Hot water is still available, but heating is off in January.
- **Decision needed:** Treat as urgent no-heat for a vulnerable tenant: decide how to obtain landlord approval now (phone if needed) and dispatch a heating engineer promptly, passing on the tenant's call-from-outside access request.

## Summary

**Final status:** escalated
**Runs:** 1 · **Events seen:** up to event 3 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Leah,

Thank you for the details about the heating at 7 Mallowmere Walk. As the heating is off, the boiler display is blank and the weather is cold, a member of our team is dealing with your case now as a priority.

We have noted that you cannot use the stairs quickly, and that anyone attending should call you from outside rather than arrive unannounced. We will pass this on.

Please tell us at once if you smell gas or see a leak, or if your hot water stops.

Kind regards,
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Leah Venn (Tenant) · Reported that the radiators are cold and the heating control
- event 002: Update from Maya Chen (Property Manager, Northbridge Lettings) · Acknowledged the report and asked about the boiler display, 
- event 003: SMS from Leah Venn (Tenant) · Said there was no gas smell or visible leak and the boiler d

- send_message: email to tenant queued in the outbox
- escalate: case escalated to a person

## Approvals requested

None.

## Notes

None.

## Failed, refused or invalid actions

None.
