# Case 022: Washer-dryer maintenance and replacement update

## Decision

- **Status:** hold (Waiting for Landlord)
- **Next step:** Wait for the landlord's reply.
- **Why:** The tenant's "job is completed" is unclear and the landlord, who arranged the replacement, has not confirmed installation or a date [event 031, event 029]. The tenant has been answered and asked to clarify; the landlord has been asked to confirm completion, date and invoice. The case cannot close until completion is proven, the landlord knows the result and the invoice position is known.

## Summary

**Final status:** hold (Waiting for Landlord)
**Runs:** 18 · **Events seen:** up to event 31 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Hello, thank you for reporting the error E13 on the washer-dryer at 8 Brackenmere Walk, and for trying to drain the water first. As that did not fix it, we have asked the landlord to approve an engineer's visit. We will update you as soon as we have their answer. Please do not use the machine until then.

**Run 2, to tenant, email:**

Hello Ari, thank you for your reply. It did not include the appliance details we asked for, so could you please send the make and model of the washer-dryer? These are usually on a label inside the door or on the back. We are still waiting for the landlord to approve an engineer's visit and have sent them a reminder. We will update you as soon as we hear back.

**Run 3, to landlord, email:**

Hello Nessa, thank you for your reply about the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ (error E13, not working). We understand you will contact your insurer, so we will not send an engineer for now. Please let us know once the insurer or their engineer has arranged a visit, repair or replacement, and when the work is done. If you would rather we arranged an engineer's diagnostic visit instead, just tell us and we will arrange it once you approve. We have asked the tenant for the make and model and will pass it on if you need it for the claim. We will not share the tenant's contact details with anyone unless the tenant agrees.

**Run 3, to tenant, email:**

Hello Ari, an update on the washer-dryer at 8 Brackenmere Walk. The landlord has said they will contact their insurer to sort this out, so we are not sending our own engineer for now. We will let you know what happens next. The make and model would still be useful, as it may be needed for the claim, so please send it when you can. It is usually on a label inside the door or on the back.

**Run 4, to landlord, email:**

Hello Nessa, thank you for your question about the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. The tenant reported that it shows error E13 and does not work, even after they tried draining the water. We have asked the tenant not to use it until this is sorted, as a precaution. We have no engineer's advice that says it is safe to use with the error showing. We are now asking the tenant to confirm whether any part of the machine still runs, and for the make and model. We will pass on their answer as soon as we have it. Please let us know what your insurer arranges and when the work is done.

**Run 4, to tenant, email:**

Hello Ari, the landlord has asked whether the washer-dryer at 8 Brackenmere Walk can still be used despite the E13 error. Could you please tell us whether any part of the machine still runs, or whether it does not work at all? Please also send the make and model if you can. It is usually on a label inside the door or on the back. Until the landlord's insurer has arranged things, please continue to leave the machine unused. Thank you.

**Run 5, to tenant, email:**

Hello Ari, an update on the washer-dryer at 8 Brackenmere Walk. The landlord is arranging an engineer and has asked what attendance time would suit you. Could you please tell us which days and times over the next week or so you would be at home? The date is not confirmed yet, and we will update you when we hear more. If you can, please also send the make and model of the machine (usually on a label inside the door or on the back) and tell us whether any part of it still runs. Please keep leaving the machine unused for now. Thank you.

**Run 5, to landlord, email:**

Hello Nessa, thank you for your update on the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. We understand you are arranging the engineer yourself. We have asked the tenant which days and times suit them and will pass on their answer as soon as we have it. We have not given the tenant's contact details to anyone. Please let us know the engineer's proposed date, and tell us when the work is done.

**Run 6, to landlord, email:**

Hello Nessa, thank you for letting us know the insurer has approved a repair to the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ (error E13, not working). We do not yet have the insurer's or the repair provider's details, so we cannot contact them. Could you please send: (1) the insurer's name and a contact number or email, (2) the claim or approval reference, (3) the repair provider's name and contact details if the insurer has named one, and (4) a copy of the approval, if you have it. With those we can coordinate the visit with the tenant. We will only share the tenant's contact details with the provider if the tenant agrees. If you would rather we arranged our own appliance engineer, tell us and we will send you the cost for your approval first. We are still waiting for the tenant's available times and will pass them on.

**Run 6, to tenant, email:**

Hello Ari, a quick update on the washer-dryer at 8 Brackenmere Walk. The landlord's insurer has approved a repair. We have asked the landlord for the insurer and repair provider details so the visit can be arranged. No date is confirmed yet. Please could you still tell us which days and times over the next week or so suit you, and send the make and model if you can (usually on a label inside the door or on the back). Please keep leaving the machine unused for now. Thank you.

**Run 7, to landlord, email:**

Hello Nessa, a reminder about the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ (error E13, not working). You asked for the tenant's preferred attendance time. The tenant says someone is generally home and asks for at least three hours' notice before a visit. The tenant is also frustrated by the delay and is washing laundry by hand. We still need the following from you so the insurer-approved repair can be arranged: (1) the insurer's name and a contact number or email, (2) the claim or approval reference, (3) the repair provider's name and contact details if the insurer has named one, and (4) a copy of the approval if you have it. Please also tell us the proposed visit date once known. We will not share the tenant's contact details unless the tenant agrees. If you would rather we arranged our own appliance engineer, tell us and we will send you the cost for your approval first. We have still not received the machine's make and model from the tenant.

**Run 7, to tenant, email:**

Hello Ari, thank you for letting us know, and we are sorry for the delay and for the inconvenience of washing by hand. We have passed on to the landlord that someone is generally home and that you need at least three hours' notice. The landlord's insurer has approved a repair, but we are still waiting for the landlord to send the insurer and repair provider details, and we have chased them today. No date is confirmed yet. We will update you as soon as we hear back. If you can, please send the make and model of the washer-dryer (usually on a label inside the door or on the back), as it may help the claim. Please keep leaving the machine unused for now.

**Run 8, to tenant, email:**

Hello Ari, thank you for your patience with the washer-dryer at 8 Brackenmere Walk. The repair provider will not book the visit until they have the machine's E-number and serial number. Could you please send us both? They are usually printed on the rating label, often inside the door or on the back of the machine. If you can, please send a photo of the label as well, plus the make and model. Once we have these we can pass them on so the visit can be booked. No date is confirmed yet, and we will update you as soon as we hear more. Please keep leaving the machine unused for now.

**Run 8, to landlord, email:**

Hello Nessa, thank you for your message about the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. We have asked the tenant today for the E-number and serial number, with a photo of the rating label if possible, and will pass them on as soon as we receive them. The tenant has not sent these so far, so we will chase them if needed. To book the visit, we will also need the repair provider's name and contact details and the claim reference, if you have them. We will not share the tenant's contact details unless the tenant agrees.

**Run 9, to landlord, email:**

Hello Nessa, thank you for your message about the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. We have not yet received the E-number and serial number from the tenant, so we have nothing to pass on. We asked them for both this morning, with a photo of the rating label if possible, and we are sending them a short text today to ask for a quick reply. We will send you the details as soon as they arrive. The tenant has said someone is generally home and needs at least three hours' notice before a visit. We will not share the tenant's contact details unless the tenant agrees.

**Run 9, to tenant, sms:**

Northbridge Lettings: please read our email today about the washer-dryer at 8 Brackenmere Walk. The repair cannot be booked until we have the E-number and serial number from the rating label. A photo of the label is fine. Thank you.

**Run 10, to tenant, email:**

Hello Ari, the landlord has told us an engineer is booked to visit 8 Brackenmere Walk about the washer-dryer on 9 September, between 12:00 and 17:00. The landlord says the engineer will call before arriving. We have not yet seen a booking confirmation, so please treat the date as provisional while we check. Could you please tell us: (1) whether someone will be home at that time, and (2) whether you are happy for us to give your phone number to the engineer so they can call you first? We will not share it unless you agree. You asked for at least three hours' notice, and we have told the landlord this. If you can, please also send the E-number and serial number from the rating label (a photo is fine). Please keep leaving the machine unused for now. Thank you.

**Run 10, to landlord, email:**

Hello Nessa, thank you for letting us know an engineer is booked for 9 September, between 12:00 and 17:00, for the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. We have asked the tenant to confirm that someone will be home and whether they agree to the engineer having their phone number so they can call before arriving. We will not share it unless they agree. The tenant has asked for at least three hours' notice before the visit, so please make sure the engineer knows. No booking confirmation was included, so could you please send it, or the engineer's or company's name and contact details? We still do not have the E-number and serial number from the tenant, and we are chasing them. Please tell us when the work is done.

**Run 11, to tenant, email:**

Hello Ari, thank you for your reply. To be sure we have this right for the washer-dryer at 8 Brackenmere Walk, could you please confirm two things: (1) that someone will be home on 9 September between 12:00 and 17:00, and (2) whether you are happy for us to give your phone number to the engineer so they can call before arriving. We will not share it unless you say yes. The date is still provisional until the landlord sends the booking confirmation. If you can, please also send the E-number and serial number from the rating label (a photo is fine), as the repair provider needs them. Please keep leaving the machine unused for now. Thank you.

**Run 12, to tenant, sms:**

Northbridge Lettings: the landlord says the engineer for the washer-dryer at 8 Brackenmere Walk expects to arrive within about 20 minutes. Please read our email.

**Run 12, to tenant, email:**

Hello Ari, the landlord has told us the engineer called them and expects to be at 8 Brackenmere Walk within about 20 minutes to look at the washer-dryer (error E13). Please could someone be home to let them in. We have not given your phone number to anyone, as you have not told us that you agree. If you are happy for the engineer to have it, please reply and say so. If you can, please also send the E-number and serial number from the rating label (a photo is fine). We will update you once we hear the outcome. Thank you.

**Run 12, to landlord, email:**

Hello Nessa, thank you for letting us know the engineer is due at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ within about 20 minutes. We have told the tenant to expect the visit and asked for someone to be home. The tenant has not yet agreed to the engineer having their phone number, so we have not shared it. Please tell us the result of the visit and when the work is done, and send any invoice or paperwork when you have it.

**Run 13, to landlord, email:**

Hello Nessa, thank you for your message about the washer-dryer at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. We note that a replacement machine is needed. We cannot confirm from here whether the new unit will fit. On your figures it is 5 units taller than the old one (825 against 820). Whether that fits depends on the height of the space, which we have not measured. We have asked the tenant to measure the height available where the machine sits and will pass it on. Your figures read as centimetres, which would be over 8 metres, so we assume you mean millimetres. Please confirm this, and send the width and depth of the new unit if you have them. Please also tell us the engineer's findings and any report or paperwork, and let us know when the replacement is arranged. We will not share the tenant's contact details unless they agree.

**Run 13, to tenant, email:**

Hello Ari, the landlord has told us the washer-dryer at 8 Brackenmere Walk needs to be replaced. They are checking whether a new unit will fit. Could you please measure the height of the space where the machine sits (floor to the underside of the worktop or any shelf above), and the width and depth if you can? Please send the measurements in millimetres or centimetres, and say which. The old machine was described as 820 mm high and the new one as 825 mm. No date is confirmed for a replacement, and we will update you as soon as we hear more. Please keep leaving the old machine unused for now. Thank you.

**Run 14, to landlord, email:**

Hello Nessa, an update on the washer-dryer replacement at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. The tenant estimates the available height at about 835 mm and says an 825 mm unit should fit. This is the tenant's own estimate, not a professional measurement. The tenant also says the existing appliance is integrated and fixed to the cabinet door. They could not check the rear connections without moving it. They did not give a width or depth. Please bear the integrated fitting in mind when choosing the replacement. We still need you to confirm that your figures are millimetres, and to send the engineer's findings and any report or paperwork. Please also tell us when the replacement is arranged. We will not share the tenant's contact details unless they agree.

**Run 14, to tenant, email:**

Hello Ari, thank you for measuring the space for the washer-dryer at 8 Brackenmere Walk. We have passed your estimate of about 835 mm, and the details about the integrated fitting, to the landlord. No date is confirmed for a replacement, and we will update you as soon as we hear more. Please keep leaving the old machine unused for now.

**Run 15, to landlord, email:**

Hello Nessa, thank you for letting us know a replacement washing machine has been ordered for 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ, and that installers will fit it and take the old unit away. Please send us the delivery and installation date as soon as you have it, so we can tell the tenant. The tenant has asked for at least three hours' notice before any visit. Please also tell us when the installation is complete, and send any invoice or paperwork when you have it. We have not shared the tenant's contact details with anyone, and will only do so if the tenant agrees.

**Run 15, to tenant, email:**

Hello Ari, the landlord has told us a replacement washing machine has been ordered for 8 Brackenmere Walk. They say installers will fit it and take the old machine away. The delivery date is not confirmed yet. We have asked the landlord for it and passed on your request for at least three hours' notice. We will update you as soon as we hear more. Please keep leaving the old machine unused for now. Thank you for your patience.

**Run 17, to landlord, email:**

Hello Nessa, thank you for your message about the washing machine at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. We are sorry the response took longer than you expected. We note that you have arranged delivery, setup and disposal of the old machine yourself, so we will not obtain a quote or instruct anyone, and we have not approved any work or cost. Please send us the delivery and installation date when you have it, so we can tell the tenant. The tenant has asked for at least three hours' notice before any visit. Please also let us know once the new machine is installed and the old one removed, and send any invoice or paperwork if there is any. We have not shared the tenant's contact details with anyone and will only do so if the tenant agrees.

**Run 17, to tenant, email:**

Hello Ari, the landlord has told us they have arranged delivery and setup of the replacement washing machine at 8 Brackenmere Walk, and removal of the old one. No date has been given yet. We have asked the landlord for it and passed on your request for at least three hours' notice. We will update you as soon as we hear more. Please keep leaving the old machine unused for now. Thank you for your patience.

**Run 18, to tenant, email:**

Hello Ari, thank you for your reply. On your question about the washing machine at 8 Brackenmere Walk: the landlord has told us a replacement was ordered and that delivery, setup and removal of the old machine are arranged. They have not yet given us a date, so we cannot confirm when it will happen. We have asked them for it. So that we record this correctly, could you please tell us what you meant by the job being completed? For example, has the new machine been fitted and the old one taken away, or did you mean something else, such as the engineer's visit? Thank you for your patience.

**Run 18, to landlord, email:**

Hello Nessa, an update on the washing machine at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. In reply to a follow-up, the tenant has said "the job is completed", but they also asked whether the planned washing-machine change is still happening, so it is not clear what they mean. We have asked them to clarify. Could you please confirm whether the new machine has been delivered and installed and the old one removed, and give us the date? If it is not yet done, please send us the planned delivery date, as the tenant has asked for at least three hours' notice. Please also send any invoice or paperwork, or tell us if none is due. We have not shared the tenant's contact details with anyone.

## Timeline

### Run 1

(no events)

- request_landlord_approval: approval request for "Appliance engineer to attend 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ to diagnose the washer-dryer, which shows error E13 and does not work. Approval sought for the diagnostic visit only. Any repair or replacement would be quoted to you for separate approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 003: Email from Ari Dalen (Tenant) · Replied without the requested appliance identification detai

- request_landlord_approval: approval request for "Reminder: appliance engineer to attend 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ to diagnose the washer-dryer, which shows error E13 and does not work. Approval sought for the diagnostic visit only. Any repair or replacement would be quoted to you for separate approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 3

- event 004: Email from Nessa Orin (Landlord) · Said they would contact their insurer to sort out the applia

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 4

- event 005: Email from Nessa Orin (Landlord) · Asked whether the tenant could still use the machine despite

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 5

- event 008: Email from Nessa Orin (Landlord) · Said they would inform the engineer and asked about a prefer

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 6

- event 010: Email from Nessa Orin (Landlord) · Reported that the insurer had approved a repair and asked No

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 7

- event 013: Email from Ari Dalen (Tenant) · Said someone was generally home but requested at least three

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 8

- event 015: Email from Nessa Orin (Landlord) · Said the repair provider would not book without the applianc

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 9

- event 016: Email from Nessa Orin (Landlord) · Said the appliance identification details requested in the p

- send_message: email to landlord queued in the outbox
- send_message: sms to tenant queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 10

- event 018: Email from Nessa Orin (Landlord) · Reported that an engineer had been booked for 9 September be

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 11

- event 020: Email from Ari Dalen (Tenant) · Acknowledged the appointment details with a brief thank-you.

- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 12

- event 021: Email from Nessa Orin (Landlord) · Said the engineer had called and would be at the property wi

- send_message: sms to tenant queued in the outbox
- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 13

- event 023: Email from Nessa Orin (Landlord) · Said a replacement washing machine was needed and asked whet

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 14

- event 025: Email from Ari Dalen (Tenant) · Estimated the available height at about 835 mm and said an 8

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 15

- event 027: Email from Nessa Orin (Landlord) · Said a new washing machine had been ordered, with delivery t

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 16

- event 028: Note from Nessa Orin (Landlord) · Requested a quote for removal and replacement of the washing

- request_landlord_approval: approval request for "Quotation only, no work to start: an appliance installer to provide a written quote for removal of the old integrated washer-dryer and supply and fitting of a replacement washing machine at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. Please confirm (1) that you want us to obtain this quote, including any call-out or survey charge if one applies, and (2) whether the replacement you ordered on 19 September and its installers still stand, or whether this quote replaces that arrangement. Any work would be sent to you as a quote for separate approval." (cost: unknown (quote only; no cost approved)) sent to the landlord
- hold: case on hold: Waiting for Landlord

### Run 17

- event 029: Email from Nessa Orin (Landlord) · Said they had sorted it and arranged delivery, setup, and di

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 18

- event 031: Email from Ari Dalen (Tenant) · Replied to a maintenance follow-up: “Yes, the job is complet

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Landlord

## Approvals requested

- Run 1: **Appliance engineer to attend 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ to diagnose the washer-dryer, which shows error E13 and does not work. Approval sought for the diagnostic visit only. Any repair or replacement would be quoted to you for separate approval.** (unknown)
- Run 2: **Reminder: appliance engineer to attend 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ to diagnose the washer-dryer, which shows error E13 and does not work. Approval sought for the diagnostic visit only. Any repair or replacement would be quoted to you for separate approval.** (unknown)
- Run 16: **Quotation only, no work to start: an appliance installer to provide a written quote for removal of the old integrated washer-dryer and supply and fitting of a replacement washing machine at 8 Brackenmere Walk, Vellumford, ZZ1 1ZZ. Please confirm (1) that you want us to obtain this quote, including any call-out or survey charge if one applies, and (2) whether the replacement you ordered on 19 September and its installers still stand, or whether this quote replaces that arrangement. Any work would be sent to you as a quote for separate approval.** (unknown (quote only; no cost approved))

## Notes

None.

## Escalation

None.

## Failed, refused or invalid actions

None.
