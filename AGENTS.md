# Architecture rules
- Keep monetization eligibility and manual rejection precedence in the browser-safe account-status module so cards, filters, and totals agree.
- Persist manual rejection on accounts and mirror it through the existing Pantry snapshot flow; profile synchronization must update only profile fields.