# Billotter license API

Mints a unique Pro unlock code per Ko-fi purchase (webhook), lets buyers
retrieve their code by purchase email, and verifies codes at activation.
No invoice data ever touches this service — it only ever sees the buyer
email Ko-fi already has, and the code itself.
