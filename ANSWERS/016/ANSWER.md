# Case 016: Smoke alarm maintenance request

## Decision

- **Status:** hold (Waiting for Landlord)
- **Next step:** Wait for the landlord's reply.
- **Why:** The landlord is managing the repair with his own electrician [event 004, event 007]. I have asked him to confirm whether the unverified visitor reported by the tenant was his electrician, and for the electrician's details and the work status [event 015]. I wait for his answer. If the answers still conflict or he stays silent, a person will need to take over.

## Summary

**Final status:** hold (Waiting for Landlord)
**Runs:** 6 · **Events seen:** up to event 15 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Elise,

Thank you for letting us know about the smoke alarm at 26 Tallowmere Close, Fenbarrow.

So that we can take this to the landlord, could you please tell us:
1. Which room and which smoke alarm has come away from the ceiling (for example, hallway or landing)?
2. Whether the alarm is still attached to its wiring or battery, or is completely loose.
3. If you are able to, a photograph of the alarm and the ceiling around it.

Once we have this, we will move the matter forward.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 2, to landlord, email:**

Dear Ronan,

Thank you for your reply about the smoke alarm that has come away from the ceiling at 26 Tallowmere Close, Fenbarrow.

We understand you will arrange your own electrician to have a look, so we will not send anyone from our side. We have not passed the tenant's contact details to your electrician. If you would like them to be shared, we will first check with the tenant.

Please let us know when the work has been done, and send the invoice if one is due. We have asked the tenant which room the alarm is in and will pass that on once we have it.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 2, to tenant, email:**

Dear Elise,

An update on the smoke alarm at 26 Tallowmere Close: the landlord has said they will arrange their own electrician to have a look. We do not yet have a visit date. We will not share your contact details with the electrician unless you agree.

We are still waiting to hear which room the alarm is in, so please reply with that, and a photo if you can.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 3, to tenant, email:**

Dear Elise,

An update on the smoke alarm at 26 Tallowmere Close, Fenbarrow. The landlord has told us their electrician will contact you and complete the work by the end of next weekend at the latest. We do not yet have the electrician's name or a confirmed appointment.

We have not passed your contact details to the electrician. Please reply to confirm whether you are happy for them to contact you directly, and if so, which phone number or email you would like them to use.

We also still need to know which room the smoke alarm is in, and a photo if you can. Please reply with this when you can.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 3, to landlord, email:**

Dear Ronan,

Thank you for your update on the smoke alarm at 26 Tallowmere Close, Fenbarrow. We note your electrician will contact the tenant and complete the work by the end of next weekend at the latest.

We have not given the tenant's contact details to your electrician. We have asked the tenant whether she agrees to be contacted directly, and we will pass on her details only if she does. If you can send us the electrician's name and contact number, we can make sure she expects the call. We have also asked her which room the alarm is in and will tell you when we hear.

Please let us know once the work has been done, and send the invoice if one is due.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 4, to landlord, email:**

Dear Ronan,

We are following up on the smoke alarm that has come away from the ceiling at 26 Tallowmere Close, Fenbarrow. You told us on 12 August that your electrician would complete the work by the following weekend at the latest. We have not heard since, and the tenant has now told us the work is not finished.

The tenant is currently unavailable and expects to arrange access once she is home. Please could you tell us:
1. Whether your electrician has attended, and if not, when you expect the work to be done.
2. The electrician's name and contact details, so that we can pass on to the tenant who will be in touch.

Please let us know once the work has been done, and send the invoice if one is due.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 4, to tenant, email:**

Dear Elise,

Thank you for letting us know, and we are sorry to hear you have been unwell. Please focus on recovering; there is nothing you need to do about the smoke alarm at 26 Tallowmere Close, Fenbarrow, for now.

We are asking the landlord for an update on when their electrician can attend. We have not shared your contact details with anyone. When you are home and ready, please email us to say so, and also let us know which room the alarm is in. We will update you once we hear from the landlord.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 5, to tenant, email:**

Dear Elise,

Thank you for your message, and we are glad you are home. We will leave you in peace and will not contact you about the smoke alarm at 26 Tallowmere Close, Fenbarrow, unless we have to. Please email us when the alarm has been fixed, or sooner if you need anything from us.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 5, to landlord, email:**

Dear Ronan,

We are following up again on the smoke alarm that has come away from the ceiling at 26 Tallowmere Close, Fenbarrow. You told us on 12 August that your electrician would finish by the following weekend. The tenant has now told us the alarm is still not fixed.

Please could you tell us:
1. Whether your electrician has attended, and if not, when the work will be done.
2. The electrician's name and contact details.

The tenant has asked for contact to be kept to a minimum for now, so it would help if your electrician could arrange access through us or with the tenant directly once you have confirmed a date with us. Please tell us when the work is done, and send the invoice if one is due.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 6, to landlord, email:**

Dear Ronan,

We need a quick answer on the smoke alarm at 26 Tallowmere Close, Fenbarrow.

The tenant has told us that on Saturday morning an unannounced person came to the door saying they were there to check something. The tenant did not let them in because they could not verify who it was. We do not know whether this was connected to the alarm work.

Please could you tell us:
1. Whether the visitor was your electrician or anyone else you arranged.
2. The electrician's name and contact details, and the date you have agreed for the visit, so that we can confirm it with the tenant.
3. Whether the alarm work has been done, and if not, when it will be.

We have not given your electrician the tenant's contact details. Please ask your electrician to arrange any visit through us first.

Kind regards,
Maya Chen
Northbridge Lettings

**Run 6, to landlord, sms:**

Northbridge Lettings: please read our email about 26 Tallowmere Close. An unverified visitor called there on Saturday. Was it your electrician? Please reply today.

**Run 6, to tenant, email:**

Dear Elise,

Thank you for telling us about the person who called at 26 Tallowmere Close on Saturday morning. You were right to check before letting anyone in.

We have no name or appointment for any visitor, so we cannot say whether this was linked to the smoke alarm. We are asking the landlord today whether it was their electrician and will tell you what we hear. We have not shared your contact details with anyone.

You do not need to reply to this email.

Kind regards,
Maya Chen
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Elise Rowan (Tenant) · Reported that the smoke alarm had come away from the ceiling

- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 2

- event 004: Email from Ronan Vale (Landlord) · Replied briefly that they would use their own electrician to

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 3

- event 007: Email from Ronan Vale (Landlord) · Said the electrician would contact the tenant and complete t

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Tenant

### Run 4

- event 012: Email from Elise Rowan (Tenant) · Confirmed that the alarm work was not finished. Tenant said 

- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 5

- event 013: Email from Elise Rowan (Tenant) · Said the fitter had still not completed the alarm and that t

- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 6

- event 015: Call from Elise Rowan (Tenant) · Reported an unannounced person knocking at the property on S

- send_message: email to landlord queued in the outbox
- send_message: sms to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

## Approvals requested

None.

## Notes

None.

## Escalation

None.

## Failed, refused or invalid actions

None.
