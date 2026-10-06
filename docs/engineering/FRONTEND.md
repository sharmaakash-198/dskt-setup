# Frontend Architecture and Guidelines

## Foundation

The frontend will be an independent React and Vite TypeScript repository. Konva with React Konva renders both map experiences. An authentication client interface selects local cookie sessions in the local environment and MSAL with Microsoft Entra in deployed environments. The backend’s OpenAPI artifact generates API types and request clients.

Exact package choices beyond these foundations are implementation-time decisions and should remain minimal.

## Experience architecture

### Facilities experience

The editor layout should provide:

- full-viewport map canvas;
- collapsible searchable template catalog;
- clear tool and revision status controls;
- properties and validation panel;
- visible Editing Scale separate from Zoom;
- undo/redo, autosave status, keyboard shortcuts, and selection summary;
- explicit validation and publication flow.

Dragging a catalog item shows a snapped placement preview. Invalid positions are visibly distinct and cannot be committed. Selection and manipulation handles must remain legible across zoom levels.

### Workplace experience

The assignment experience should provide:

- prominent employee and space search;
- published map with clean white interiors and category-colored borders;
- occupant, template, label, and assignment details on selection or hover;
- efficient multi-selection and label sequencing;
- side-by-side context for an Employee’s existing Assignments;
- clear current, future, unassigned, inactive, and conflict states.

It must not expose geometry editing controls. Its language should focus on people and spaces rather than vertices and templates.

## Rendering

Use one shared map renderer with mode-specific interaction policies.

Suggested layer order:

1. adaptive grid;
2. boundary and zones;
3. obstacles;
4. physical elements;
5. labels;
6. assignment/status styling;
7. selection and manipulation handles;
8. transient previews.

Konva world coordinates map to screen space through Stage pan and Zoom. Domain geometry remains integer-based. HTML overlays provide menus, tooltips, dialogs, validation, and accessible details.

Do not copy Arcada Planner’s local JSON document model or manual hit-detection design by default. Its interaction patterns may inform DSKT, but DSKT’s renderer must use its own orthogonal polygon and backend command models.

## State ownership

- Remote server state uses a query/cache layer.
- Editor interaction state uses a small dedicated store.
- Form state remains local unless shared.
- Persisted domain state must not exist only in a global frontend store.
- API resources are converted into renderer models through explicit adapters.
- Undo/redo stores semantic editor commands.

## Accessibility

Canvas content is not inherently accessible. Therefore:

- every selected map object appears in an accessible HTML details panel;
- search results provide a non-canvas route to spaces and Employees;
- map actions have keyboard-accessible equivalents where practical;
- focus is moved deliberately when dialogs and panels open;
- color is never the only status indicator;
- controls meet contrast, label, target-size, and visible-focus requirements;
- reduced-motion preference is respected.

## Responsive support

The editing and assignment workflows target desktop and large laptop screens. Read-only search may adapt to tablet widths. Mobile map editing is explicitly unsupported in the MVP and should receive a clear message rather than a broken editor.

## Error and loading states

Every route defines loading, empty, permission-denied, recoverable error, and unavailable states. Mutation feedback distinguishes validation, conflict, offline, and unexpected failure. Optimistic updates are limited to operations with safe rollback.

## Performance

- Render only visible detail appropriate to Zoom.
- Cache derived transformed polygon paths by geometry and transform.
- Avoid React rerenders for pointer movement where imperative Konva updates suffice.
- Keep transient drag state out of remote caches.
- Profile with a representative 2,000-element floor.
- Load employee details and historical Assignments on demand.

## UI consistency

Use a small tokenized design system for spacing, type, color, elevation, focus, and state. Build shared components for navigation, panels, dialogs, forms, tables, status badges, empty states, and confirmation flows. Domain colors from templates do not replace application semantic colors.

## Frontend testing

- Unit-test coordinate transforms, adapters, label ordering, and reducers.
- Component-test permission states, forms, previews, and errors.
- Interaction-test selection, snapping, quarter-turn rotation, invalid placement, and undo/redo.
- End-to-end test the critical MVP journeys with synthetic employee data.
- Include automated accessibility checks and targeted keyboard tests.
