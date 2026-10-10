# Case 006: Solar generation readings

## Decision

- **Status:** hold (Waiting for Tenant)
- **Next step:** Wait for the tenant's reply.
- **Why:** No readable solar reading is on the case; the tenant's statement that it was sent earlier is not evidence of delivery and he included no figures or image [event 017]. We have asked him to resend it, and will pass it to the landlord once received [event 001].

## Summary

**Final status:** hold (Waiting for Tenant)
**Runs:** 2 · **Events seen:** up to event 17 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Hello, the landlord of 14 Brindlefern Walk, Larkmere, ZZ1 1ZZ has asked for the current solar generation readings for the property. Could you please send us a clear photo of the solar generation meter or inverter display showing the current reading? If you can also tell us the date and time you took it, that would help. If you are not sure where the meter or display is, please let us know and we will help. There is no fault to report and no visit is needed. Thank you.

**Run 1, to landlord, email:**

Dear Edwin, thank you for your call about the current solar generation readings for 14 Brindlefern Walk, Larkmere, ZZ1 1ZZ. We do not hold a reading at the moment, so we have asked the tenant for a clear photo of the generation meter or inverter display. We will pass it on once we receive it. No contractor visit or cost is involved. If you would rather use a reading from your own monitoring portal, or want something different, please let us know.

**Run 2, to tenant, email:**

Hello Ivo, thank you for your reply about 14 Brindlefern Walk, Larkmere, ZZ1 1ZZ. I am sorry for the repetition. We cannot see a solar generation reading or photo on the case yet, so we cannot pass anything on to the landlord. Could you please reply to this email with a clear photo of the generation meter or inverter display, or type out the figure shown with the date and time it was taken? If your wife's earlier email is easy to find, forwarding it would also be fine. There is no fault and no visit is needed. Thank you for your help.

## Timeline

### Run 1

- event 001: Call from Edwin Vale (Landlord) · Edwin requested the property's current solar generation read
- event 002: Note from Maya Chen (Property Manager, Northbridge Lettings) · Logged as a maintenance request based on the landlord's call
- event 003: Update from Northbridge Lettings workflow (System) · Workflow prompt says landlord approval is needed before arra

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 2

- event 017: Email from Ivo Mercer (Tenant) · Ivo replied that the readings had already been supplied abou

- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Tenant

## Approvals requested

None.

## Notes

None.

## Escalation

None.

## Failed, refused or invalid actions

None.
