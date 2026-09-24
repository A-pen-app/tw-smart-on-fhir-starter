> 來源: https://hl7.org/fhir/smart-app-launch/app-launch.html

App Launch: Launch and Authorization - SMART App Launch v2.2.0

SMART App Launch

2.2.0 - STU 2.2

FHIR

Overview

Apps

Intro

Register App

Standalone Launch

EHR Launch

Discovery

Request Authorization Code

Request Access Token

Access FHIR API

Scopes and Launch Context

Persisting App State

Task Requesting Launch

Backend Services

Backend Services

Token Introspection

Authentication

Client Authentication - Asymmetric (public key)

Client Authentication - Symmetric (shared secret)

Conformance

Brands
New

User-Access Brands and Endpoints

User-Access Brand Examples

See also

Artifacts

Best Practices

Examples

References

History

- Table of Contents

- Apps

- App Launch: Launch and Authorization

This page is part of the Smart App Launch Implementation Guide (v2.2.0: STU 2.2) based on FHIR (HL7® FHIR® Standard) R4. This is the current published version.  For a full list of available versions, see the Directory of published versions

## App Launch: Launch and Authorization

- Profile audience and scope

- Security and Privacy Considerations

- SMART authorization & FHIR access: overview

- Top-level steps for SMART App Launch

- Register App with EHR

- Launch App: Standalone Launch

- Launch App: EHR Launch

- Retrieve .well-known/smart-configuration

- Obtain authorization code

- Obtain access token

- Access FHIR API

- Refresh access token

The SMART App Launch Framework connects third-party applications to Electronic
Health Record data, allowing apps to launch from inside or outside the user
interface of an EHR system. The framework supports apps for use by clinicians,
patients, and others via a PHR, Patient Portal, or any FHIR system where a user can launch an app. It provides a reliable, secure authorization protocol for
a variety of app architectures, including apps that run on an end-user’s device
as well as apps that run on a secure server.
The Launch Framework supports four key use cases:

- Patient apps that launch standalone

- Patient apps that launch from a portal

- Provider apps that launch standalone

- Provider apps that launch from a portal

These use cases support apps that perform data visualization, data collection,
clinical decision support, data sharing, case reporting, and many other
functions.

For additional functionality defined in this implementation guide, see section
Overview.

### Profile audience and scope

This profile on OAuth 2.0 is intended to be used by developers of apps that need to access user identity information or other FHIR resources by requesting authorization from OAuth 2.0-compliant authorization servers. It is compatible with FHIR R2 (DSTU2) and later; this publication includes explicit definitions for FHIR R4 and R4B.

OAuth 2.0 authorization servers are configured to mediate access based on
a set of rules configured to enforce institutional policy, which may
include requesting end-user authorization.  This profile
does not dictate the institutional policies that are implemented in the
authorization server.

The profile defines a method through which an app requests
authorization to access a FHIR resource, and then uses that authorization
to retrieve the resource.  Synchronization of patient context is not addressed;
for use cases that require context synchronization (e.g., learning about when
the in-context patient changes within an EHR session) see
FHIRcast.  In other words, if the patient chart is
changed during the session, the application will not inherently be updated.

Security mechanisms such as those mandated by HIPAA in the US (end-user
authentication, session time-out, security auditing, and accounting of
disclosures) are outside the scope of this profile.

This profile provides a mechanism to delegate an entity’s permissions (e.g., a user’s permissions) to a 3rd-party app. The profile includes mechanisms to delegate a limited subset of an entity’s permissions (e.g., only sharing access to certain data types). However, this profile does not model the permissions that the entity has in the first place (e.g., it provides no mechanism to specify that a given entity should or should not be able to access specific records in an EHR). Hence, this profile is designed to work on top of an EHR’s existing user and permissions management system, enabling a standardized mechanism for delegation.

### Security and Privacy Considerations

#### App protection

The app is responsible for protecting itself from potential misbehaving or
malicious values passed to its redirect URL (e.g., values injected with
executable code, such as SQL) and for protecting authorization codes, access
tokens, and refresh tokens from unauthorized access and use.  The app
developer must be aware of potential threats, such as malicious apps running
on the same platform, counterfeit authorization servers, and counterfeit
resource servers, and implement countermeasures to help protect both the app
itself and any sensitive information it may hold. For background, see the
OAuth 2.0 Threat Model and Security
Considerations.

Specific requirements are:

Apps SHALL ensure that when protocol steps include transmission of sensitive
information (authentication secrets, authorization codes, tokens), transmission
is ONLY to authenticated servers, over TLS-secured channels.

Apps SHALL generate an unpredictable state parameter for each user
session; SHALL include state with all authorization requests; and SHALL
validate the state value for any request sent to its redirect URL.

An app SHALL NOT execute untrusted user-supplied inputs as code.

An app SHALL NOT forward values passed back to its redirect URL to any
other arbitrary or user-provided URL (a practice known as an “open
redirector”).

An app SHALL NOT store bearer tokens in cookies that are transmitted
as clear text.

Apps SHOULD persist tokens and other sensitive data in app-specific
storage locations only, and SHOULD NOT persist them in
system-wide-discoverable locations.

#### Support for “public” and “confidential” apps

Within this profile we differentiate between the two types of apps defined in the OAuth 2.0 specification: confidential and public. The differentiation is based upon whether the execution environment within which the app runs
enables the app to protect secrets.   Pure client-side apps
(for example, HTML5/JS browser-based apps, iOS mobile
apps, or Windows desktop apps) can provide adequate security, but they may be unable to “keep a secret” in the OAuth2 sense.  In other words, any “secret” key, code, or
string that is statically embedded in the app can potentially be extracted by an end-user
or attacker. Hence security for these apps cannot depend on secrets embedded at
install-time.

For strategies and best practices to protecting a client secret refer to:

- OAuth 2.0 Threat Model and Security Considerations: 4.1.1. Threat: Obtaining Client Secrets

- OAuth 2.0 for Native Apps: 8.5. Client Authentication

- OAuth 2.0 Dynamic Client Registration Protocol

##### Determining the appropriate app type

To determine the appropriate app type, first answer the question “is your app able to protect a secret?”

- If “Yes”, use a confidential app

- Example: App runs on a trusted server with only server-side access to the secret

- Example: App is a native app that uses additional technology (such as dynamic client registration and universal redirect_uris) to protect the secret

- If “No”,  use a public app

- Example: App is an HTML5 or JS in-browser app (including single-page applications) that would expose the secret in user space

- Example: App is a native app that can only distribute a secret statically

#### Considerations for PKCE Support

All SMART apps SHALL support Proof Key for Code Exchange (PKCE).  PKCE is a standardized, cross-platform technique for clients to mitigate the threat of authorization code interception or injection. PKCE is described in IETF RFC 7636. SMART servers SHALL support the S256 code_challenge_method and SHALL NOT support the plain method.

#### Considerations for Cross-Origin Resource Sharing (CORS) support

Servers that support purely browser-based apps SHALL enable Cross-Origin Resource Sharing (CORS) as follows:

- For requests from any origin, CORS configuration permits access to the public discovery endpoints (.well-known/smart-configuration and metadata)

- For requests from a client’s registered origin(s), CORS configuration permits access to the token endpoint and to FHIR REST API endpoints

#### Related reading

Implementers can review the OAuth Security Topics guidance from IETF as a collection of Best Current Practices.

Some resources shared with apps following this IG may be considered Patient Sensitive; implementers should review the Core FHIR Specification’s Security Page for additional security and privacy considerations.

### SMART authorization & FHIR access: overview

An app can launch from within an existing session in an EHR, Patient Portal, or other FHIR system. Alternatively, it can launch as a standalone app.

In an EHR launch, an opaque handle to
the EHR context is passed along to the app as part of the launch URL.  The app
later will include this handle as a request parameter when it requests
authorization to access resources. The server will provide the application with
EHR context based on this handle. Note that the complete URLs of
all apps approved for use by users of this EHR will have been registered with
the EHR authorization server.

In a standalone launch, when the app
launches from outside an EHR session, the app can request context from the EHR
authorization server. The context will then be determined during the
authorization process as described below.

Once an app receives a launch request, it requests authorization to access FHIR resources by
instructing the browser to navigate to the EHR’s authorization endpoint. Based
on pre-defined rules and possibly end-user authorization, the EHR authorization
server either grants the request by returning an authorization code to the app’s
redirect URL or denies the request. The app then exchanges the authorization
code for an access token. The app presents the access token to the EHR’s resource server to
access requested FHIR resources. If a refresh token is returned along with the
access token, the app may use it to request a new access token with the same
scope, once the old access token expires.

This specification is agnostic about how the EHR resource server and the EHR
authorization server are integrated, as long as they implement the required
app-facing behaviors

### Top-level steps for SMART App Launch

The top-level steps for Smart App Launch are:

- Register App with EHR (one-time step, can be out-of-band)

- Launch App:  Standalone Launch or EHR Launch

- Retrieve .well-known/smart-configuration

- Obtain authorization code

- Obtain access token

- Access FHIR API

- Refresh access token

The actors involved in each step and the order in which steps are used is illustrated in the figure below.

- AppAppEHR with Authorization ServerEHR with Authorization ServerFHIR ServerFHIR Serveropt[Precondition: Client Registration]
- (may be out of band)alt[EHR Launch]
- EHR userlaunches app
- Launch request
- [Standalone Launch]
- App userconnects to EHR
- Discovery request
- Discovery response
- Authorization requestopt
- EHR incorporates user inputinto authorization decisionalt[Granted]
- Authorization granted
- Access token request
- Access token response
- Request Resources
- [Denied]
- Authorization error

More detail on each of these steps is provided in the sections below.

### Register App with EHR

Before a SMART app can run against an EHR, the app must be registered with that
EHR’s authorization service.  SMART does not specify a standards-based registration process, but we
encourage EHR implementers to consider the OAuth 2.0 Dynamic Client
Registration Protocol
for an out-of-the-box solution.

Note that this is a one-time setup step, and can occur out-of-band.

#### Request

No matter how an app registers with an EHR’s authorization service, at registration time every SMART app SHALL:

- Register zero or more fixed, fully-specified launch URL with the EHR’s authorization server

- Register one or more fixed, fully-specified redirect_uris with the EHR’s authorization server.

For confidential clients, additional registration-time requirements are defined based on the client authentication method.

- For asymmetric client authentication: a JSON Web Key Set or JWSK URL is established

- For symmetric client authentication: a client secret is established

#### Response

The EHR confirms the app’s registration parameters and communicates a client_id to the app.

### Launch App: Standalone Launch

In SMART’s standalone
launch flow, a user selects an app from outside the EHR
(for example, by tapping an app icon on a mobile phone home screen).

#### Request

There is no explicit request associated with this step of the SMART App Launch process.

#### Response

The app proceeds to the next step of the SMART App Launch flow.

#### Examples

- Public client

- Confidential client, asymmetric authentication

- Confidential client, symmetric authentication

### Launch App: EHR Launch

In SMART’s EHR launch flow,
a user has established an EHR session and then decides to launch an app. This
could be a single-patient app that runs in the context of a patient record, or
a user-level app (like an appointment manager or a population dashboard).

#### Request

The EHR initiates a “launch sequence” by opening a new browser instance (or iframe)
pointing to the app’s registered launch URL and passing some context.

The following parameters are included:

Parameters

iss
required

Identifies the EHR's FHIR endpoint, which the app can use to obtain
additional details about the EHR including its authorization URL.

launch
required

Opaque identifier for this specific launch and any EHR context associated
with it. This parameter must be communicated back to the EHR  at authorization
time by passing along a launch parameter (see example below).

##### For example

A launch might cause the browser to navigate to:

```
Location: https://app/launch?iss=https%3A%2F%2Fehr%2Ffhir&launch=xyz123
```

Later, when the app prepares its authorization request, it includes
launch as a requested scope and includes a launch={launch id} URL
parameter echoing the value it received from the EHR in this
notification.

#### Response

The app proceeds to the next step of the SMART App Launch flow.

### Retrieve .well-known/smart-configuration

In order to obtain launch context and request authorization to access FHIR
resources, the app discovers the EHR FHIR server’s SMART configuration metadata,
including OAuth authorization_endpoint and token_endpoint URLs.

#### Request

The discovery URL is constructed by appending .well-known/smart-configuration to the FHIR Base URL.  The app issues an HTTP GET to the discovery URL with an Accept header supporting application/json.

#### Response

The EHR responds with a SMART configuration JSON document as described in the Conformance section.

#### Examples

- Example request and response

### Obtain authorization code

To proceed with a launch, the app constructs a request for an authorization code.

#### Request

The app supplies the following parameters to the EHR’s “authorize” endpoint.

Note on PKCE Support: the EHR SHALL ensure that the code_verifier is present and valid when the code is exchanged for an access token.

Parameters

response_type
required
Fixed value: code. 

client_id
required
The client's identifier. 

redirect_uri
required
Must match one of the client's pre-registered redirect URIs.

launch
conditional
When using the EHR Launch flow, this must match the launch value received from the EHR. Omitted when using the Standalone Launch.

scope
required

Must describe the access that the app needs, including scopes like
patient/*.rs, openid and fhirUser (if app
needs authenticated end-user identity) and either:

-  a launch value indicating that the app wants to receive already-established launch context details from the EHR 

-  a set of launch context requirements in the form launch/patient, which asks the EHR to establish context on your behalf.

See the section on SMART on FHIR Access
Scopes for details.

state
required

An opaque value used by the client to maintain state between the request and
callback. The authorization server includes this value when redirecting the
user-agent back to the client. The parameter SHALL be used for preventing
cross-site request forgery or session fixation attacks.  The app SHALL use
an unpredictable value for the state parameter with at least 122 bits of
entropy (e.g., a properly configured random uuid is suitable).

aud
required

URL of the EHR resource server from which the app wishes to retrieve FHIR data.
This parameter prevents leaking a genuine bearer token to a counterfeit
resource server. (Note that in the case of an EHR launch
flow, this aud value is the same as the launch's iss value.)

Note that the aud parameter is semantically equivalent to the
resource parameter defined in RFC8707.  SMART's
aud parameter predates RFC8707 and we have decided not to rename it
for reasons of backwards compatibility. We might consider renaming SMART's
aud parameter in the future if implementer feedback indicates that
alignment would be valuable.

For the current release, servers SHALL support the aud parameter
and MAY support a resource parameter as a synonym for
aud.

code_challenge
required
This parameter is generated by the app and used for the code challenge, as specified by PKCE.  For example, when code_challenge_method is 'S256', this is the S256 hashed version of the code_verifier parameter.  See considerations-for-pkce-support.

code_challenge_method
required
Method used for the code_challenge parameter.  Example value: S256.  See considerations-for-pkce-support.

The app SHOULD limit its requested scopes to the minimum necessary (i.e.,
minimizing the requested data categories and the requested duration of access).

If the app needs to authenticate the identity of or retrieve information about
the end-user, it should include two OpenID Connect scopes:  openid and
fhirUser.   When these scopes are requested and the request is granted, the
app will receive an id_token along with the access token.  For full details,
see SMART launch context parameters.

The following requirements are adopted from OpenID Connect Core 1.0 Specification section 3.1.2.1:

- Authorization Servers SHALL support the use of the HTTP GET and POST methods at the Authorization Endpoint.

- Clients SHALL use either the HTTP GET or the HTTP POST method to send the Authorization Request to the Authorization Server.  If using the HTTP GET method, the request parameters are serialized using URI Query String Serialization.  If using the HTTP POST method, the request parameters are serialized using Form Serialization and the application/x-www-form-urlencoded content type.

###### For example

If an app needs demographics and observations for a single
patient and wants information about the current logged-in user, the app  can request:

- patient/Patient.r

- patient/Observation.rs

- openid fhirUser

If the app was launched from an EHR, the app adds a launch scope and a
launch={launch id} URL parameter echoing the value it received from the EHR
to be associated with the EHR context of this launch notification.

Apps using the standalone launch flow
won’t have a launch id at this point.  These apps can declare launch context
requirements by adding specific scopes to the authorization request: for
example, launch/patient to indicate that the app needs a patient ID, or
launch/encounter to indicate it needs an encounter.  The EHR’s “authorize”
endpoint will take care of acquiring the context it needs (making it available to the app).

For example, if your app needs patient context, the EHR may
provide the end-user with a patient selection widget.  For full details, see SMART launch
context parameters.

The app then instructs the browser to navigate to the EHR’s authorization URL as
determined above. For example to cause the browser to issue a GET:

```
Location: https://ehr/authorize?
            response_type=code&
            client_id=app-client-id&
            redirect_uri=https%3A%2F%2Fapp%2Fafter-auth&
            launch=xyz123&
            scope=launch+patient%2FObservation.rs+patient%2FPatient.rs+openid+fhirUser&
            state=98wrghuwuogerg97&
            aud=https://ehr/fhir
```

Alternatively, the following example shows one way for a client app to cause the browser to issue a POST using HTML and javascript:

```
<html>
  <body onload="javascript:document.forms[0].submit()">
    <form method="post" action="https://ehr/authorize">
      <input type="hidden" name="response_type" value="code"/>
      <input type="hidden" name="client_id" value="app-client-id"/>
      <input type="hidden" name="redirect_uri" value="https://app/after-auth"/>
      <input type="hidden" name="launch" value="xyz123"/>
      <input type="hidden" name="scope" value="launch patient/Observation.rs patient/Patient.rs openid fhirUser"/>
      <input type="hidden" name="state" value="98wrghuwuogerg97"/>
      <input type="hidden" name="aud" value="https://ehr/fhir"/>
    </form>
  </body>
</html>
```

#### Response

The authorization decision is up to the EHR authorization server which may request authorization from the end-user. The EHR authorization
server will enforce access rules based on local policies and optionally direct
end-user input.

The EHR decides whether to grant or deny access.  This decision is
communicated to the app when the EHR authorization server returns an
authorization code or, if denying access, an error response.  Authorization codes are short-lived, usually expiring
within around one minute.  The code is sent when the EHR authorization server
causes the browser to navigate to the app’s redirect_uri with the
following URL parameters:

Parameters

code
required

The authorization code generated by the authorization server. The
authorization code needs to expire shortly after it is issued to mitigate the
risk of leaks.

state
required
The exact value received from the client.

The app SHALL validate the value of the state parameter upon return to the
redirect URL and SHALL ensure that the state value is securely tied to the
user’s current session (e.g., by relating the state value to a session
identifier issued by the app).

###### For example

Based on the client_id, current EHR user, configured policy, and perhaps
direct user input, the EHR makes a decision to approve or deny access.  This
decision is communicated to the app by instructing the browser to navigate to the app’s registered
redirect_uri. For example:

```
Location: https://app/after-auth?
  code=123abc&
  state=98wrghuwuogerg97
```

#### Examples

- Public client

- Confidential client, asymmetric authentication

- Confidential client, symmetric authentication

### Obtain access token

After obtaining an authorization code, the app trades the code for an access
token.

#### Request

The app issues an HTTP POST to the EHR authorization server’s token endpoint URL using content-type application/x-www-form-urlencoded as described in
section 4.1.3 of RFC6749.

For public apps, authentication is not required because a client with no secret cannot prove its
identity when it issues a call. (The end-to-end system can still be secure
because the client comes from a known, https-protected endpoint specified and
enforced by the redirect uri.)  For confidential
apps, authentication is required. Confidential clients SHOULD use
Asymmetric Authentication if available, and
MAY use Symmetric Authentication.

Parameters

grant_type
required
Fixed value: authorization_code

code
required
Code that the app received from the authorization server

redirect_uri
required
The same redirect_uri used in the initial authorization request

code_verifier
required
This parameter is used to verify against the code_challenge parameter previously provided in the authorize request.

client_id
conditional
Required for public apps. Omit for confidential apps.

#### Response

The EHR authorization server SHALL return a JSON object that includes an access token
or a message indicating that the authorization request has been denied. The JSON structure
includes the following parameters:

Parameters

access_token
required
The access token issued by the authorization server

token_type
required
Fixed value: Bearer

expires_in
recommended
Lifetime in seconds of the access token, after which the token SHALL NOT be accepted by the resource server

scope
required
Scope of access authorized. Note that this can be different from the scopes requested by the app.

id_token
optional
Authenticated user identity and user details, if requested

refresh_token
optional
Token that can be used to obtain a new access token, using the same or a subset of the original authorization grants

authorization_details EXP
optional
Additional details describing where this token can be used, and any per-location context (experimental; see details)

In addition, if the app was launched from within a patient context,
parameters to communicate the context values MAY BE included. For example,
a parameter like "patient": "123" would indicate the FHIR resource
https://[fhir-base]/Patient/123. Other context parameters may also
be available. For full details see the SMART launch context parameters section.

The parameters are included in the entity-body of the HTTP response, as
described in section 5.1 of RFC6749.

The access token is a string of characters as defined in
RFC6749 and
RFC6750.  The token is essentially
a private message that the authorization server
passes to the FHIR Resource Server telling the FHIR server that the
“message bearer” has been authorized to access the specified resources.

Defining the format and content of the access token is left up to the
organization that issues the access token and holds the requested resource.

The authorization server’s response SHALL
include the HTTP “Cache-Control” response header field with a value
of “no-store,” as well as the “Pragma” response header field with a
value of “no-cache.”

The EHR authorization server decides what expires_in value to assign to an
access token and whether to issue a refresh token, as defined in section 1.5
of RFC6749, along with the
access token.  If the app receives a refresh token along with the access
token, it can exchange this refresh token for a new access token when the
current access token expires (see step 5 below).

Apps SHOULD store tokens in app-specific storage locations only, and not in
system-wide-discoverable locations.  Access tokens SHOULD have a valid
lifetime no greater than one hour.  Confidential
clients may be issued longer-lived tokens than public clients.

A large range of threats to access tokens can be mitigated by digitally
signing the token as specified in RFC7515
or by using a Message Authentication Code (MAC) instead.  Alternatively,
an access token can contain a reference to authorization information,
rather than encoding the information directly into the token itself.

To be effective, such references must be infeasible for an attacker to
guess.  Using a reference may require an extra interaction between the
resource server and the authorization server; the mechanics of such an
interaction are not defined by this specification.

At this point, the authorization flow is complete.

##### Experimental: Authorization Details for Multiple Servers EXP

If an authorization server wishes to provide a token that can be used with more than one FHIR server (i.e., the token can be used with app’s requested aud as well as additional endpoints), the following structures from rfc9396 can be included in the access token response:

- authorization_details array of objects, where each object may include

- type (required): fixed value smart_on_fhir

- locations (required): array of FHIR base URLs. Including a URL in this list indicates that the access token may be used with this FHIR server.

- fhirVersions (required): array of FHIR Version codes (e.g., 4.0.1 for R4). Including a version in this list indicates that all servers in the locations array of this “authorization_details” object will support this version. Commonly there will be only a single location and a single version per “authorization details” object.

- scope (optional): string with space-separate SMART scopes. When present, indicates scopes that are granted for use at the locations. When absent, the top-level scopes from the access token response will apply at the locations.

- patient, encounter, fhirContext (optional). When present, these indicate the SMART Launch Context that applies at the locations. This allows server-specific context (e.g., allowing for different patient IDs for an R4 server vs R2 server). When a context parameter is absent, the top-level value from the access token response will apply at the locations.

For example, an access request to an R4 FHIR server could potentially result in a token response for the requested R4 server as well as an R2 server. Note that the launch context and scopes for the R2 server differ from the top-level values in this example (accounting for different resource types and ids):

```
{
  "token_type": "Bearer",
  "patient": "r4-123-id",
  "scope": "launch/patient patient/MedicationRequest.rs patient/Patient.rs",
  "expires_in": 3600,
  "access_token": "eyJhbG...",
  "authorization_details": [{
    "type": "smart_on_fhir",
    "locations": ["https://ehr.example.org/fhir/r4"],
    "fhirVersions": ["4.0.1"],
  }, {
    "type": "smart_on_fhir",
    "locations": ["https://ehr.example.org/fhir/r2"],
    "fhirVersions": ["1.0.2"],
    "scope": "launch/patient patient/MedicationOrder.rs patient/Patient.rs",
    "patient": "r2-456-id"
  }]
}
```

#### Examples

- Public client

- Confidential client, asymmetric authentication

- Confidential client, symmetric authentication

### Access FHIR API

With a valid access token, the app can access protected EHR data by issuing a
FHIR API call to the FHIR endpoint on the EHR’s resource server.

#### Request

From the access token response, an app has received an OAuth2 bearer-type access token (access_token property) that can be used to fetch FHIR Resources.  The app issues a request that includes an
Authorization header that presents the access_token as a “Bearer” token:

```
Authorization: Bearer {{access_token}}
```

(Note that in a real request, {{access_token}} is replaced
with the actual token value.)

#### Response

The resource server SHALL validate the access token and ensure that it has not expired and that its scope covers the requested resource.  The
resource server also validates that the aud parameter associated with the
authorization (see section Obtain authorization code) matches the resource server’s own FHIR
endpoint.  The method used by the EHR to validate the access token is beyond
the scope of this specification but generally involves an interaction or
coordination between the EHR’s resource server and the authorization server.

On occasion, an app may receive a FHIR resource that contains a “reference” to
a resource hosted on a different resource server.  The app SHOULD NOT blindly
follow such references and send along its access_token, as the token may be
subject to potential theft.   The app SHOULD either ignore the reference, or
initiate a new request for access to that resource.

#### Example Request and Response

Example

```
GET https://ehr/fhir/Patient/123
Authorization: Bearer i8hweunweunweofiwweoijewiwe
```

Response

```
{
  "resourceType": "Patient",
  "birthDate": ...
}
```

### Refresh access token

Refresh tokens are issued to enable sessions to last longer than the validity period of an access token.  The app can use the expires_in field from the token response (see section Obtain access token) to determine when its access token will expire.  EHR implementers are also encouraged to consider using the OAuth 2.0 Token Introspection Protocol to provide an introspection endpoint that clients can use to examine the validity and meaning of tokens. An app with “online access” can continue to get new access tokens as long as the end-user remains online.  Apps with “offline access” can continue to get new access tokens without the user being interactively engaged for cases where an application should have long-term access extending beyond the time when a user is still interacting with the client.

The app requests a refresh token in its authorization request via the online_access scope (for EHR Launch) or offline_access scope (for EHR or Standalone launch). See section SMART on FHIR Access Scopes for details.  A server can decide which client types (public or confidential) are eligible for offline access and able to receive a refresh token.  If granted, the EHR supplies a refresh_token in the token response.  A refresh token SHALL be bound to the same client_id and SHALL contain the same or a subset of the claims authorized for the access token with which it is associated. After an access token expires, the app requests a new access token by providing its refresh token to the EHR’s token endpoint.

#### Request

An HTTP POST transaction is made to the EHR authorization server’s token URL, with content-type application/x-www-form-urlencoded. The decision about how long the refresh token lasts is determined by a mechanism that the server chooses.  For clients with online access, the goal is to ensure that the user is still online.

- For public apps, authentication is not possible (and thus not required). For confidential apps, see authentication considerations in
step 5.

The following request parameters are defined:

Parameters

grant_type
required
Fixed value: refresh_token. 

refresh_token
required
The refresh token from a prior authorization response

scope
optional

The scopes of access requested. If present, this value must be a strict sub-set
of the scopes granted in the original launch (no new permissions can be
obtained at refresh time). A missing value indicates a request for the same
scopes granted in the original launch.

#### Response

The response is a JSON object containing a new access token, with the following claims:

JSON Object property name

access_token
required
New access token issued by the authorization server.

token_type
required
Fixed value: bearer

expires_in
required
The lifetime in seconds of the access token. For example, the value 3600 denotes that the access token will expire in one hour from the time the response was generated.

scope
required
Scope of access authorized. Note that this will be the same as the scope of the original access token, and it can be different from the scopes requested by the app.

refresh_token
optional
The refresh token issued by the authorization server. If present, the app should discard any previous refresh_token associated with this launch and replace it with this new value.

authorization_detailsEXP
optional
Additional details describing where this token can be used, and any per-location context (experimental; see details)

In addition, if the app was launched from within a patient context,
parameters to communicate the context values MAY BE included. For example,
a parameter like "patient": "123" would indicate the FHIR resource
https://[fhir-base]/Patient/123. Other context parameters may also
be available. For full details see SMART launch context parameters.

#### Examples

- Public client

- Confidential client, asymmetric authentication

- Confidential client, symmetric authentication

IG © 2020+ HL7 International / FHIR Infrastructure and Boston Children's Hospital.  Package hl7.fhir.uv.smart-app-launch#2.2.0 based on FHIR 4.0.1. Generated 2024-04-30

Links: Table of Contents |
QA Report

| Version History |
|

Propose a change

