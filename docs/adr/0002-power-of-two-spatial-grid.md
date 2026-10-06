---
status: accepted
---

# Preserve geometry across power-of-two grid scales

DSKT stores integer world coordinates where one unit equals 10 centimetres and exposes editing scales of `2ⁿ` for `n = 0...8`. Changing scale resamples grid coordinates but never changes physical geometry; zoom remains an independent rendering concern.
