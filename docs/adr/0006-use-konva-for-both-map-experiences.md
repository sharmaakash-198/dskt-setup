---
status: accepted
---

# Use Konva for both map experiences

DSKT will render Facilities and Workplace maps with one React Konva geometry renderer and mode-specific interaction policies. Canvas rendering better supports the target of 2,000 interactive elements than a large SVG DOM, while HTML panels provide controls, tooltips, search, and accessible alternatives. Arcada Planner may inform interactions, but its local JSON, rectangular-item, and manual hit-testing architecture will not be adopted wholesale.
