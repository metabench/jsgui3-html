# Jsgui3 HTML

This is the isomorphic \(for both the client and server\) core of the jsgui framework\. It uses the "lang\-mini" package for utility functions as well as its Evented\_Class\, which Control inherits from\. Evented\_Class allows events to be listened to and raised\.

Its main functionality is the Control. It is somewhat synonymous with React Components. Its pupose is to represent an item within the DOM that is composed from HTML (or SVG) elements, and can be interacted with by the user.

Server-side rendering, client-side activation.

Controls are identified with their dom attribute "data-jsgui-id". The 'id' property generally does not get used or defined by jsgui3.

Control lifecycle:

Contruction
Composition
Activation (client-side only)
Event responses (usually client-side only)