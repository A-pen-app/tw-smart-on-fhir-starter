> 來源: http://docs.smarthealthit.org/client-js/

SMART on FHIR JavaScript Library | SMART JS Client Library

Skip to the content.

# SMART on FHIR JavaScript Library

## JavaScript client for FHIR

View on GitHub

# SMART on FHIR JavaScript Library

This is a JavaScript library for connecting SMART apps to FHIR servers.
It works both in modern browsers and on the server (Node 18+).

## Table of Contents

- Installation

- Browser Usage

- Server Usage

- NodeJS API Details

- SMART API

- Full Documentation

- Client API

- Full Documentation

- API Documentation

- Working with multiple windows

- Connecting to open servers and/or multiple servers

- Contributing and Development

- Browser Examples

- Request examples

- Example request calls

- Server Examples

- Express Example

- Native Example

- HAPI Example

## Installation

### From NPM

```
npm i fhirclient
```

### From CDN

Include it with a script tag from one of the following locations:

From NPM (latest version):

- https://cdn.jsdelivr.net/npm/fhirclient/bundle/fhir-client.js

- https://cdn.jsdelivr.net/npm/fhirclient/bundle/fhir-client.min.js

From NPM (specific version):

- https://cdn.jsdelivr.net/npm/fhirclient@3.0.0/bundle/fhir-client.js

- https://cdn.jsdelivr.net/npm/fhirclient@3.0.0/bundle/fhir-client.min.js

## Browser Usage

In the browser you typically have to create two separate pages that correspond to your
launch_uri (Launch Page) and redirect_uri (Index Page).

### As Library

Launch Page

```
<!-- launch.html -->
<script src="https://cdn.jsdelivr.net/npm/fhirclient/bundle/fhir-client.min.js"></script>
<script>
FHIR.oauth2.authorize({
    "client_id": "my_web_app",
    "scope": "patient/*.read"
});
</script>
```

Index Page

```
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/fhirclient/bundle/fhir-client.min.js"></script>
<script>
FHIR.oauth2.ready()
    .then(client => client.request("Patient"))
    .then(console.log)
    .catch(console.error);
</script>
```

### As Module

If you are using a bundler like Webpack, Rollup, Parcel, or Vite
you can import the library as module:
Launch Page

```
// Using ESM syntax
import { authorize } from "fhirclient/browser";

// OR Using CommonJS syntax
// const { authorize } = require("fhirclient/browser");

authorize({
    "client_id": "my_web_app",
    "scope": "patient/*.read"
});
```

Index Page

```
// Using ESM syntax
import { ready } from "fhirclient/browser";

// OR Using CommonJS syntax
// const { ready } = require("fhirclient/browser");

ready()
    .then(client => client.request("Patient"))
    .then(console.log)
    .catch(console.error);
```

NOTE: When the library is used as module it will not create a global FHIR object as it does when included as script. If you want to be able to use it globally, you can export it yourself like so:

```
import FHIR from "fhirclient/browser";

// in JavaScript:
window.FHIR = FHIR;

// In TypeScript:
(window as any).FHIR = FHIR;
```

## Server Usage

The server is fundamentally different environment than the browser but the
API is very similar. Here is a simple Express example:

```
// Using ESM syntax
import { smart } from "fhirclient/node";

// OR Using CommonJS syntax
const { smart } = require("fhirclient/node");

// This is what the EHR will call
app.get("/launch", (req, res) => {
    smart(req, res).authorize({
        "client_id": "my_web_app",
        "scope": "patient/*.read"
    });
});

// This is what the Auth server will redirect to
app.get("/", (req, res) => {
    smart(req, res).ready()
        .then(client => client.request("Patient"))
        .then(res.json)
        .catch(res.json);
});
```

Read more at the NodeJS API Details.

## SMART API

The SMART API is a collection of SMART-specific methods (authorize, ready, init) for app
authorization and launch. If you are working in a browser, the SMART API is automatically created,
and available at window.FHIR.oauth2. In NodeJS, the library exports a function that should be
called with a http request and response objects, and will return the same SMART API as in the browser.

```
// BROWSER
const smart = FHIR.oauth2;
smart.authorize(options);

// SERVER
import { smart } from "fhirclient/node";
smart(request, response).authorize(options);
```

Read the SMART API Documentation

## Client

This is a FHIR client that is returned to you from the ready() or the init()
SMART API calls. You can also create it yourself if needed. For example, there
is no need to authorize against an open FHIR server. You can skip that and start
by creating a client instance:

```
// BROWSER
const client = FHIR.client({
    serverUrl: "https://r4.smarthealthit.org"
});

// SERVER
const client = fhirClient(req, res).client({
    serverUrl: "https://r4.smarthealthit.org"
});
```

The client instance exposes a super-powered request method that you use to query
the FHIR server and a bunch of other useful utilities and methods.
Read the full Client API docs.

client-js is maintained by smart-on-fhir.

This page was generated by GitHub Pages.

