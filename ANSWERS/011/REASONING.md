# Reasoning for case 011

## Run 1

### Events received

- [event 001]
- [event 002]
- [event 003]
- [event 004]

### Agent notes

None.

### Actions

- **request_landlord_approval** (ok): The tenant reports a brown damp patch, about the size of a small plate, above the kitchen sink, with a few drops overnight, and says it returns after rain [event 001]. The tenant says no water is dripping now, no light is directly below the patch, the kitchen sockets appear dry, and there is a narrow crack but no sagging [event 003]. This is a repair fault, so the landlord must approve before any contractor visit or cost. The cost is unknown, so I say so. Nothing indicates an immediate safety risk that would need escalation.
- **send_message** (ok): The tenant reported the fault and gave access times [event 001], and described the current state [event 003]. I'm telling them that the landlord approval has been requested, that the contractor will contact them after approval, and what to report if things change. I promise nothing beyond what the agency controls.
- **hold** (ok): Approval for the inspection visit has been requested from the landlord and no contractor can be assigned until it is given [event 001] [event 003].

## Run 2

### Events received

- [event 006]

### Agent notes

None.

### Actions

- **add_note** (ok): Bren Talwick's reply [event 006] is useful background for the inspection but does not give approval or change the stage. I'm recording it on the case so it is available when the landlord answers the approval request [event 005].
- **hold** (ok): The landlord has not yet answered the request for approval of the inspection visit sent earlier today, and no contractor can be assigned without it. The building manager's message [event 006] gives no approval and raises no safety concern. The tenant reports no current dripping and no electrical involvement [event 003]. Under the 3-day rule I will chase the landlord if there is no answer.

## Run 3

### Events received

- [event 009]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor found moisture at a compression joint above the hatch and says a limited opening in the ceiling lining may be needed; no opening-up was done [event 009]. This changes scope and cost beyond the inspection-only approval requested [event 005]. I must not allow additional work until a complete quote is known and approved, so I am asking for a full all-inclusive quote and telling the contractor not to start.
- **send_message** (ok): The landlord should know the inspection result and that further work, with a cost not yet known, will need separate approval [event 009]. The earlier approval request covered the inspection only [event 005]. I make no claim of approval or cost.
- **hold** (ok): The contractor found the likely source but access needs a ceiling opening, which is beyond the inspection visit [event 009]. I have asked for a complete quote and told the contractor not to start. I will request landlord approval once the total is known.

## Run 4

### Events received

- [event 010]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant asked when the pipe repair might be arranged and said the hatch was left closed [event 010]. The contractor found moisture at a compression joint, could not reach it through the hatch, and may need a limited opening in the ceiling lining; nothing was opened or repaired [event 009]. I have asked the contractor for a full quote and told him not to start, and the landlord has been told that separate approval will be needed. I therefore give the tenant an honest status without promising a date, without saying who pays, and with the safety advice repeated.
- **hold** (ok): The tenant's question is answered [event 010]. The contractor has been asked for a complete all-inclusive quote and a date and told not to start [event 009]. I will request landlord approval once the total is known, and no repair can be assigned before then.

## Run 5

### Events received

- [event 011]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor's estimate gives the scope and exclusions but no total or VAT basis, and no date [event 011]. Landlord approval so far covered only the inspection and none has been recorded [event 005] [event 009]. Per the quote-scope guidance, an incomplete total must be clarified with the contractor before asking the landlord to approve. The exclusion for suspect material may change scope or cost, so I ask what it refers to. I am repeating that no work may start.
- **hold** (ok): The estimate lacks a complete total, tax basis and date, and has an exclusion for suspect material that could change cost [event 011]. I have asked the contractor to clarify and told him not to start. I will request landlord approval of the full proposal once the total is known.

## Run 6

### Events received

- [event 013]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord's conditional authorisation [event 013] caps the work at "the estimate amount", but the contractor's estimate gave no total, VAT basis or date [event 011], and my clarification request to him is unanswered [event 011]. The automatic check marks the reply as unclear. I confirm what she authorised, explain what I am clarifying, and promise to contact her before any increase, as she asked. I do not assign yet because the cap cannot be checked.
- **hold** (ok): The landlord authorised the quoted scope up to the estimate amount, safely carried out [event 013], but the estimate has no stated total, VAT basis or date, and its exclusion for suspect material is unexplained [event 011]. I have asked the contractor for these and told him not to start. I will assign once the complete total is confirmed and within the authorised amount, and will go back to the landlord if it is not.

## Run 7

### Events received

- [event 015]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor proposes to return on 13 June with tools for the ceiling opening and repair [event 015], but he has not answered my request for a complete total, VAT basis, making-good scope and an explanation of the suspect-material exclusion [event 011]. The landlord authorised the scope only up to the estimate amount and asked to be contacted before any increase [event 013], and the automatic check marks that reply as unclear, so the cap cannot be verified. I therefore will not assign or confirm the visit. I tell him not to attend for the work yet and repeat the missing questions, per the guidance to resolve quote facts with the contractor first. Nothing here is urgent: the tenant reports no current dripping and no electrical involvement [event 003]. A written reply can arrive in time.
- **hold** (ok): The contractor's proposed date [event 015] does not answer the open questions on total, VAT, making good and suspect material [event 011]. The landlord's authorisation is capped at an estimate amount that has no stated total [event 013]. I have told him not to attend for the work until I confirm, and I will assign only once the complete total is known and within the authorised amount, or go back to the landlord if it is not.

## Run 8

### Events received

- [event 017]

### Agent notes

None.

### Actions

- **send_message** (ok): The contractor is on site and has paused because the planned opening needs drilling or cutting near a pale, fibrous lining he cannot identify [event 017]. His estimate excludes investigation, testing, removal and disposal of suspect material [event 011]. The landlord authorised only the quoted plumbing scope up to the estimate amount, safely carried out, and wants contact before any scope or cost change [event 013]. Nobody has approved work on or near this material, so I confirm he must not start or disturb it, and I repeat the outstanding quote questions [event 015]. A written reply can reach the landlord in time since he has paused and nothing has been disturbed.
- **send_message** (ok): The contractor found an unidentified fibrous lining and paused before drilling or cutting [event 017]. His estimate excludes suspect material [event 011], and the landlord's authority was limited to the quoted plumbing scope up to the estimate amount, safely carried out, with contact required before any scope or cost increase [event 013]. This is a changed scope and risk with no known cost, so I must inform her and ask for her decision rather than choose for her. Nothing is disturbed and the contractor has stopped, so a written reply is sufficient and no urgent escalation is needed.
- **send_message** (ok): The tenant admitted the contractor, who has paused work because of an unidentified fibrous lining [event 017]. The tenant had been told the repair was awaiting approval and a date [event 010], so they need to know that today's work is not proceeding. I promise no date, say nothing about cost, and repeat the earlier safety instruction about leaks and electrics.
- **hold** (ok): The contractor has paused because of an unidentified fibrous lining and nobody has approved work that disturbs it or investigates it [event 017] [event 011]. The landlord's authority covers only the quoted plumbing scope up to the estimate amount [event 013]. I have asked her how to proceed and told the contractor and tenant that nothing goes ahead meanwhile.

## Run 9

### Events received

- [event 020]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant reports a small drip when the kitchen tap was used, has stopped using that tap, sees no sagging and has not touched the hatch [event 020]. I acknowledge this, say the landlord is being told, promise no date because the landlord has not yet decided how to proceed after the unidentified lining was found [event 017], and repeat the safety reporting instruction. Nothing in the report shows water near electrics or a sagging ceiling, and earlier reports found no fittings affected [event 003], so it does not need immediate escalation.
- **send_message** (ok): The tenant reports a continuing small drip when the tap is used [event 020]. The landlord's decision on the unidentified lining is still outstanding [event 017], and her authority is limited to the quoted plumbing scope with contact required before scope change [event 013]. She should know the leak is ongoing when she decides. I repeat the question without choosing for her.
- **hold** (ok): The tenant reports a small drip with the tap in use, no sagging, hatch untouched, and has stopped using the tap [event 020]. This is not an immediate safety escalation. The landlord has been told and asked how to proceed on the unidentified lining [event 017]; no work that disturbs it is approved [event 013]. Contractor stays stood down.

## Run 10

### Events received

- [event 022]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord says her authorisation covered the quoted plumbing work only, not a specialist material assessment, and asks for likely cost and timing before considering more spend [event 022]. The contractor paused because of an unidentified fibrous lining [event 017], his estimate excludes investigation and testing of suspect material, and it still has no stated total, VAT basis or making-good scope [event 011]. Per the changed-scope guidance, I must get the complete facts from the contractor before asking the landlord to approve, and no extra work can be instructed meanwhile. The work is paused and nothing is disturbed, so a written request is enough.
- **send_message** (ok): The landlord asked for the likely cost and timing before considering extra expenditure [event 022]. We do not have them: the estimate excludes investigation and testing of suspect material [event 011], and the contractor has paused over the unidentified lining [event 017]. I answer her by saying what we are obtaining and that nothing proceeds without her approval, consistent with her limit on scope [event 013].
- **hold** (ok): The landlord declined to widen her authority until she has the likely cost and timing of assessing the lining [event 022]. I have asked the contractor for those figures and a complete total [event 011] [event 017]. I will send them to the landlord for approval once known. The contractor remains stood down.

## Run 11

### Events received

- [event 023]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord asked for likely cost and timing before considering additional expenditure [event 022]. The contractor has now said he cannot price work involving the unidentified lining or specify the assessment needed, and has left without disturbing anything [event 023]. I tell her honestly that we have no figures, that the leak is still active [event 020], and that nothing further is instructed beyond her authorisation [event 013]. I name no cost and make no promise beyond a colleague following up.
- **escalate** (ok): The case is blocked. The landlord wants figures before approving anything [event 022], but the only contractor involved cannot price or specify the assessment [event 023]. Asking him again would not help, and I must not choose for the landlord. A person needs to decide how to source the specialist quote. I have told the landlord what we know and do not know in this run. The leak is still active but the tenant has stopped using the tap and reports no sagging or electrical involvement [event 020], so a person can handle this without an emergency response.
