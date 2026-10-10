# Case 003: Bathroom and kitchen maintenance

## Decision

- **Status:** hold (Waiting for Provider)
- **Next step:** Wait for the provider's reply.
- **Why:** The invoice describes tap work but names a different property and has no amount [event 022][event 001]. The work was not approved beforehand, as approval covered assessment only [event 004]. I cannot close the case until a corrected invoice matching Juniper Mews is on file, and until the vent and damp findings are known. The landlord and the tenant have been written to, and I have asked the plumber for a corrected invoice, the amount, the date, photos and the vent and damp findings.

## Summary

**Final status:** hold (Waiting for Provider)
**Runs:** 9 · **Events seen:** up to event 22 · **Loaded with:** lenient

## Outbox

**Run 1, to tenant, email:**

Dear Elian,

Thank you for your report about Flat 4, 8-12 Juniper Mews: the dripping kitchen tap, the bathroom hot tap that is hard to shut off, rain coming through the bathroom vent, and the damp patches in the smaller bedroom.

I have asked the landlord to approve a plumber visit to assess these. I will update you as soon as I have their answer.

The invoice attached to your report is for a different address (28 Larkspur Quay, Brindlewick) and is dated 14 September. Could you check whether it was attached by mistake? If you meant to send something else, please resend it. If you have photos of the damp patches or the vent, please send them again, as I could not see them on the report.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 2, to tenant, email:**

Dear Elian,

The landlord has approved a plumber visit to assess the dripping kitchen tap, the bathroom hot tap, the rain coming through the bathroom vent and the damp patches in the smaller bedroom at Flat 4, 8-12 Juniper Mews.

The plumber will contact you to arrange a convenient time. The visit is to assess the problems. Any repair will be quoted to the landlord for approval first.

If you have photos of the damp patches or the vent, please send them to us, as they did not come through with your report. Please also let me know whether the invoice attached to your report was sent by mistake.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 2, to landlord, email:**

Dear Mr Vale,

Thank you for your reply. I have instructed a plumber to attend Flat 4, 8-12 Juniper Mews to assess the dripping kitchen tap, the bathroom hot tap and the rain coming through the bathroom vent, with the damp patches in the smaller bedroom. The plumber will arrange access with the tenant. This visit is for assessment only. Any repair will be sent to you as a quote for your approval before work starts.

On your other two points:
- Insurance: I cannot confirm what the building insurance covers, as I have no policy details on this case. The plumber has been asked to record the findings with photos, which I will pass on to you after the visit. Please check the policy or contact your insurer about notifying the roof and vent leak.
- Flat history: the record for this case holds no earlier reports of roof leaks at the flat. If you have dates or earlier reports, please send them so I can add them to the case.

I will update you when the plumber has reported.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 3, to contractor, email:**

Hello,

Access details for the assessment visit at Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ (dripping kitchen tap, bathroom hot tap that drips and is hard to shut off, rain coming through the bathroom vent, damp patches in the smaller bedroom).

The tenant, Elian Voss, has offered several all-day options, including Friday 12 September, with no preferred time. The tenant is happy for you to attend while they are out, and suggests keys could be collected from our office. Please reply with the date you propose and tell us whether you will need keys, so we can confirm the arrangements with the tenant before the visit. Please do not collect or use keys until we have confirmed.

As before, the landlord has approved the assessment visit only. Please do not start any repair or incur any cost. Send a written quote with your findings, with options and prices if there are any, and photos of the damp and the vent.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 3, to tenant, email:**

Dear Elian,

Thank you for your availability, including Friday 12 September, and for agreeing that the plumber can attend while you are out. I have passed this to the plumber and asked them to propose a date and tell us whether they need keys. I will confirm the booked date and the key arrangements with you before the visit. Please do not leave keys with anyone until you hear from me.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 4, to contractor, email:**

Hello Gareth,

Thank you. Friday 12 September at around 09:00 suits the tenant, so please treat the assessment visit at Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ as booked. The tenant has said you may attend while they are out.

One point is still open: please tell us whether you need keys. If you do, we will confirm the key arrangements with you before the visit. Please do not collect or use any keys until we have confirmed.

As before, the landlord has approved the assessment visit only. Please do not start any repair or incur any cost. Send a written quote with your findings, with options and prices if there are any, and photos of the damp and the vent.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 4, to tenant, email:**

Dear Elian,

The plumber, Gareth Lune of Copper Finch Plumbing, will attend Flat 4, 8-12 Juniper Mews on Friday 12 September at around 09:00 to assess the dripping kitchen tap, the bathroom hot tap, the rain coming through the bathroom vent and the damp patches in the smaller bedroom. This fits the availability you gave us.

We have asked the plumber whether they need keys and will confirm the arrangements with you before the visit. Please do not leave keys with anyone until you hear from me. If this date no longer suits you, please let me know.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 5, to contractor, email:**

Hello Gareth,

Thank you for your message about Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ. Before we cancel the appointment on Friday 12 September, I need some details, as your message does not say what was done:

1. Which of the reported issues did you attend to: the kitchen tap, the bathroom hot tap, the rain coming through the bathroom vent, the damp patches in the smaller bedroom?
2. Was this assessment only, or did you carry out any repair or fit any parts? The landlord approved the assessment visit only, and no repair or cost has been approved.
3. How did you get access today, and were any keys used?
4. Please send your written findings, photos of the damp and the vent, and your invoice or quote with the amount.

Please also note that the invoice we hold under reference NBL-003-INV-14 names a different address (28 Larkspur Quay, Brindlewick) and carries a date of 14 September. Please confirm the correct address and date for any invoice for this job.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 5, to tenant, email:**

Dear Elian,

The plumber, Gareth Lune, has told us he has asked to cancel the visit booked for Friday 12 September at Flat 4, 8-12 Juniper Mews, and says work was done today. He has not yet told us what was done, so I am checking with him and have not cancelled anything yet.

Could you let me know:
- whether the plumber or anyone else attended the flat today, and if so what was done;
- whether the kitchen tap, the bathroom hot tap and the bathroom vent leak are now fixed, and whether the damp patches in the smaller bedroom are unchanged.

I will update you once I have the plumber's answer.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 5, to landlord, email:**

Dear Mr Vale,

An update on Flat 4, 8-12 Juniper Mews (dripping kitchen tap, bathroom hot tap, rain through the bathroom vent, damp patches in the smaller bedroom).

Today the plumber, Gareth Lune of Copper Finch Plumbing, wrote asking us to cancel the visit booked for Friday 12 September and saying the job was done today. That is all we have so far. He has not said which of the reported issues he dealt with, whether he carried out any repair, or sent a report, photos or an invoice.

You approved an assessment visit only. No repair or cost has been approved. I have asked the plumber for a description of the work, his findings, photos of the damp and the vent, and his invoice or quote. I have also asked the tenant to confirm whether anyone attended and what the current state is.

Until I have that, I cannot confirm that any work was completed. I will write again as soon as I have the answers, including any amount you are asked to consider. You do not need to take any action now.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 6, to contractor, email:**

Hello Gareth,

Thank you for your correction. Your two messages today do not agree, so please confirm both points for Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ:

1. Is the assessment visit still going ahead tomorrow, Friday 12 September, at around 09:00? Until you confirm otherwise, I am treating it as booked and have not cancelled it.
2. Did you carry out any work at the flat today, 11 September? If so, please say what was done, and whether you used keys or had access.

My earlier questions still stand: please send your findings, photos of the damp and the vent, and your quote or invoice with the amount. The landlord has approved the assessment visit only. Please do not start any repair or incur any cost without his approval.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 7, to tenant, email:**

Dear Elian,

Thank you for taking the plumber's call. I understand Gareth Lune of Copper Finch Plumbing will attend Flat 4, 8-12 Juniper Mews tomorrow, Friday 12 September, likely late morning, and that this suits you. The visit is to assess the dripping kitchen tap, the bathroom hot tap, the rain coming through the bathroom vent and the damp patches in the smaller bedroom. Any repair will be quoted to the landlord for approval first.

My earlier question is still open. Please could you tell me whether the plumber or anyone else attended the flat today, 11 September, and whether anything was done to the taps or the vent? I am checking this with the plumber too.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 7, to contractor, email:**

Hello Gareth,

Thank you for calling the tenant. I have noted that you will attend Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ tomorrow, Friday 12 September, likely late morning, and that the tenant has agreed to this. The appointment stands and is not cancelled.

Your message earlier today said the job was done today. Please still tell me: did you do any work at the flat on 11 September, and if so what, and how did you get access? Please also send the invoice or quote for this job with the amount. The invoice we hold (NBL-003-INV-14) names 28 Larkspur Quay, Brindlewick and is dated 14 September, so it cannot be used for this property. Please send a corrected one if it relates to this job.

The landlord has approved the assessment visit only. Please do not start any repair or incur any cost without his approval. Please send your findings, photos of the damp and the vent, and a quote with options and prices if any.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 8, to contractor, email:**

Hello Gareth,

I understand you are at Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ today, Friday 12 September. Please note the correct address is 8-12 Juniper Mews.

The landlord has approved the assessment visit only. Please do not start any repair, fit any parts or incur any cost. If repair is needed, send me a written quote with your findings, with options and prices if there are any, and the landlord will be asked to approve before any work starts.

Please also send photos of the damp and the vent. I still need to know whether you did any work at the flat on 11 September, and if so what and how you got access. The invoice we hold (NBL-003-INV-14) names 28 Larkspur Quay, Brindlewick and is dated 14 September, so it cannot be used for this property. If you have an invoice for this job, please send a corrected copy.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 9, to contractor, email:**

Hello Gareth,

Thank you for your invoice. I cannot accept it as it stands for Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ:

1. It names Flat 4, 28 Larkspur Quay, Brindlewick, not Juniper Mews. Please confirm that the work was done at Flat 4, 8-12 Juniper Mews and send a corrected invoice.
2. It shows no amount. Please send the total, with a breakdown of parts and labour and whether VAT is included.
3. Please confirm the date or dates the work was done. Your earlier message said the job was done on 11 September, and your visit was on 12 September.
4. Please send photos of the work, and your findings on the rain coming through the bathroom vent and the damp patches in the smaller bedroom. The invoice does not mention them.

The landlord approved an assessment visit only. No repair or cost was approved before the new kitchen tap and the basin tap parts were fitted. Please do not carry out any further work, including any work on the vent or the damp, without written approval from the landlord. I will pass your corrected invoice to him.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 9, to landlord, email:**

Dear Mr Vale,

An update on Flat 4, 8-12 Juniper Mews. The plumber, Gareth Lune of Copper Finch Plumbing, attended on 12 September. He has now sent an invoice saying he installed a new kitchen mixer tap and fitted a new brass insert and chrome head to the bathroom basin hot tap.

Please note:
- You approved an assessment visit only. Neither the repairs nor any cost were approved before this work was done. I told him not to start repairs.
- The invoice shows no amount, and it names a different address (28 Larkspur Quay, Brindlewick). I have asked him for a corrected invoice with the total and for confirmation that the work was done at Juniper Mews. I will send you the amount as soon as I have it, and you can then decide about payment.
- The invoice does not mention the rain through the bathroom vent or the damp patches in the smaller bedroom. I have asked him for his findings and photos. As far as I know, those two issues have not been dealt with. I have asked the tenant to confirm the state of the taps.

You do not need to take any action now. I will write again when I have the corrected invoice.

Kind regards,
Priya Nair
Northbridge Lettings

**Run 9, to tenant, email:**

Dear Elian,

Thank you for letting the plumber in on Friday 12 September. He has told us he installed a new kitchen mixer tap and fitted new parts to the bathroom basin hot tap at Flat 4, 8-12 Juniper Mews.

Could you please tell me:
- whether the kitchen tap and the bathroom hot tap now stop dripping and shut off properly;
- whether the rain through the bathroom vent and the damp patches in the smaller bedroom are unchanged. The plumber's invoice does not mention them.

If you have photos of the damp or the vent, please send them. I am checking the paperwork with the plumber and will update you.

Kind regards,
Priya Nair
Northbridge Lettings

## Timeline

### Run 1

- event 001: Portal from Elian Voss (Tenant) · Submitted a maintenance request covering the dripping kitche

- add_note: note added
- request_landlord_approval: approval request for "Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ: plumber to attend and assess (1) dripping kitchen tap, (2) bathroom basin hot tap that drips and is hard to shut off, (3) rainwater coming through the bathroom vent during heavy rain, with damp patches on the ceiling and wall of the smaller bedroom. The visit covers assessment only. Any repair or cost will be sent to you as a quote for separate approval." (cost: unknown) sent to the landlord
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Landlord

### Run 2

- event 004: Email from Owen Vale (Landlord) · Replied, “Yes, please proceed.” Also asked Northbridge Letti

- assign_contractor: Plumber contractor assigned
- send_message: email to tenant queued in the outbox
- send_message: email to landlord queued in the outbox
- add_note: note added
- hold: case on hold: Waiting for Provider

### Run 3

- event 007: Email from Elian Voss (Tenant) · Offered several all-day options, including Friday 12 Septemb

- send_message: email to contractor queued in the outbox
- send_message: email to tenant queued in the outbox
- add_note: note added
- hold: case on hold: Waiting for Provider

### Run 4

- event 009: Email from Gareth Lune (Plumber, Copper Finch Plumbing) · Proposed Friday 12 September at around 09:00 for attendance.

- send_message: email to contractor queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Provider

### Run 5

- event 014: Email from Gareth Lune (Plumber, Copper Finch Plumbing) · Wrote, “Please cancel appointment. Job was done today.” The 

- send_message: email to contractor queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: ⚠ Workflow completion check: this end action was not executed. Review these applicable omissions against current evidence and policy, execute any required actions, or escalate if human judgement is needed: ["Send the landlord an interim update, as the PB03 result step requires. It should say what is confirmed and what is still being checked: the plumber says the job was done on 11 Sep, but the issues covered, any repair and any invoice are unverified. It should not invent a cause, a completion date or photo contents. The contractor and tenant messages do not meet this obligation, and the hold only promises to tell the landlord once the evidence is in. The landlord approved an assessment visit only, and Northbridge told him he would be updated when the plumber reported."]
- send_message: email to landlord queued in the outbox
- hold: case on hold: Waiting for Provider

### Run 6

- event 015: Email from Gareth Lune (Plumber, Copper Finch Plumbing) · Sent a correction: “Booked for tomorrow.” No time or explana

- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Provider

### Run 7

- event 016: Call from Gareth Lune (Plumber, Copper Finch Plumbing) · Gareth called to confirm attendance the next day, likely lat

- send_message: email to tenant queued in the outbox
- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Provider

### Run 8

- event 020: Call from Gareth Lune (Plumber, Copper Finch Plumbing) · Gareth called from outside the building and asked about the 

- send_message: email to contractor queued in the outbox
- hold: case on hold: Waiting for Provider

### Run 9

- event 022: Document from Gareth Lune (Plumber, Copper Finch Plumbing) · Submitted invoice text stating that a new kitchen mixer tap 

- send_message: email to contractor queued in the outbox
- send_message: email to landlord queued in the outbox
- send_message: email to tenant queued in the outbox
- hold: case on hold: Waiting for Provider

## Approvals requested

- Run 1: **Flat 4, 8-12 Juniper Mews, Vellumford, ZZ1 1ZZ: plumber to attend and assess (1) dripping kitchen tap, (2) bathroom basin hot tap that drips and is hard to shut off, (3) rainwater coming through the bathroom vent during heavy rain, with damp patches on the ceiling and wall of the smaller bedroom. The visit covers assessment only. Any repair or cost will be sent to you as a quote for separate approval.** (unknown)

## Notes

- Run 1: Attachment tap-works-invoice.pdf (Copper Finch Plumbing, ref NBL-003-INV-14) does not match this case. It is for Flat 4, 28 Larkspur Quay, Brindlewick, not Flat 4, 8-12 Juniper Mews, Vellumford. It is dated 14 Sep 2025, after today (3 Sep 2025). It is not evidence of any work or invoice for this case. Not filed as the invoice. Ask the tenant how it came to be attached. Photos mentioned in the report were not visible in the case record.
- Run 2: Landlord asked for a check of building insurance cover and a review of the flat's history, saying roof leaks had recurred and some damage looks severe. No policy details or earlier leak records are on this case. Landlord told this and asked for dates and earlier reports. Plumber's findings and photos to be passed to the landlord after the visit. Approval covers assessment only; repairs need a quote and fresh approval.
- Run 3: Tenant allows unaccompanied access and offered several all-day slots incl. Fri 12 Sep; suggested keys from Northbridge. Not yet confirmed that we hold keys or that the plumber needs them. If keys are issued, record it and check return before closing. Appointment not yet confirmed.

## Escalation

None.

## Failed, refused or invalid actions

- **hold:** Workflow completion check: this end action was not executed. Review these applicable omissions against current evidence and policy, execute any required actions, or escalate if human judgement is needed: ["Send the landlord an interim update, as the PB03 result step requires. It should say what is confirmed and what is still being checked: the plumber says the job was done on 11 Sep, but the issues covered, any repair and any invoice are unverified. It should not invent a cause, a completion date or photo contents. The contractor and tenant messages do not meet this obligation, and the hold only promises to tell the landlord once the evidence is in. The landlord approved an assessment visit only, and Northbridge told him he would be updated when the plumber reported."] — agent recovered
