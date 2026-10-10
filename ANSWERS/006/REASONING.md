# Reasoning for case 006

## Run 1

### Events received

- [event 001]
- [event 002]
- [event 003]

### Agent notes

None.

### Actions

- **send_message** (ok): The landlord only asked for current solar generation readings and no fault or visit was described [event 001]. No reading or meter details are on record [event 002], so per the reading-request guidance we must ask for readable evidence rather than invent a value. Reading a display is a simple check the tenant can do, and no contractor or cost is involved, so no landlord approval is needed [event 003].
- **send_message** (ok): The landlord's request [event 001] has not been answered yet. We have no reading on file [event 002], so I am telling him we have asked the tenant for readable evidence, without inventing a value, and that no visit or cost is involved [event 003].
- **hold** (ok): The readable solar generation reading has not been delivered; a promise or mention does not count. We asked the tenant for a photo of the meter or inverter display [event 001, event 002], and we wait for it before replying to the landlord with the value.

## Run 2

### Events received

- [event 017]

### Agent notes

None.

### Actions

- **send_message** (ok): The tenant says the readings were supplied about two weeks ago by phone and email, but his reply has no figures or image [event 017]. The case record shows no reading received, only the original landlord request and no meter details [event 001, event 002]. A mention of earlier delivery is not a readable reading, so I will not invent a value and will ask again for the actual photo or figure, politely acknowledging his point. No contractor, cost or landlord approval is involved [event 003].
- **hold** (ok): No readable solar reading is on the case; the tenant's statement that it was sent earlier is not evidence of delivery and he included no figures or image [event 017]. We have asked him to resend it, and will pass it to the landlord once received [event 001].
