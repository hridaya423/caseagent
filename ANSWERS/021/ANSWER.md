# Case 021: Hot-water service report

## Decision

- **Status:** hold (Waiting for Landlord)
- **Next step:** Wait for the landlord's reply.
- **Why:** First chase sent to the landlord for the engineer-visit approval; no contractor can be assigned until the landlord approves [event 001][event 012]. Escalate after 3 unanswered chases.

## Summary

**Final status:** hold (Waiting for Landlord)
**Runs:** 2 · **Events seen:** up to event 12 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Iris,

Thank you for reporting the loss of hot water and shower at 17 Wrenfold Quay, and for checking the boiler switch. I have asked the landlord to approve an engineer to look at the boiler, and I will update you as soon as I have a reply. If the engineer is approved, they will contact you to arrange the visit.

If you notice a gas smell or a carbon monoxide alarm sounds, please contact us straight away.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 2, to tenant, email:**

Dear Iris,

Thank you for your update, and I am sorry the hot water at 17 Wrenfold Quay is still not working. I have not yet had a reply from the landlord on approving an engineer, so I have sent the request again today. As soon as the landlord replies I will let you know. If an engineer is approved, they will contact you to arrange the visit.

If you notice a gas smell or a carbon monoxide alarm sounds, please contact us straight away.

Kind regards,
Maya Chen
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Iris Vale (Tenant, resident) · Maintenance request NBL-021: shower and hot water are not wo

- request_landlord_approval: approval request for "17 Wrenfold Quay, Larkhollow, ZZ1 1ZZ: Tenant reports no hot water or shower and that the boiler has no power, after checking the boiler switch. Approval requested for a heating engineer to attend and diagnose the fault. Boiler make and model not yet known. Approval covers the visit only. Any repair or quote will be sent to you for a separate approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 012: Email from Iris Vale (Tenant, resident) · Tenant replied: “Nothing done about it thanks.” No restorati

- request_landlord_approval: approval request for "Reminder: 17 Wrenfold Quay, Larkhollow, ZZ1 1ZZ. The tenant reports no hot water or shower, and the boiler has no power after the tenant checked the boiler switch. The problem is still unresolved. Approval is requested for a heating engineer to attend and diagnose the fault. Boiler make and model are not yet known. Approval covers the visit only. Any repair or quote will be sent to you for a separate approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

## Approvals requested

- Run 1: **17 Wrenfold Quay, Larkhollow, ZZ1 1ZZ: Tenant reports no hot water or shower and that the boiler has no power, after checking the boiler switch. Approval requested for a heating engineer to attend and diagnose the fault. Boiler make and model not yet known. Approval covers the visit only. Any repair or quote will be sent to you for a separate approval.** (unknown)
- Run 2: **Reminder: 17 Wrenfold Quay, Larkhollow, ZZ1 1ZZ. The tenant reports no hot water or shower, and the boiler has no power after the tenant checked the boiler switch. The problem is still unresolved. Approval is requested for a heating engineer to attend and diagnose the fault. Boiler make and model are not yet known. Approval covers the visit only. Any repair or quote will be sent to you for a separate approval.** (unknown)

## Notes

None.

## Escalation

None.

## Failed, refused or invalid actions

None.
