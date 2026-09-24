> 來源: https://hl7.org/fhir/smart-app-launch/client-confidential-asymmetric.html

Client Authentication: Asymmetric (public key) - SMART App Launch v2.2.0

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

- Client Authentication

- Client Authentication: Asymmetric (public key)

This page is part of the Smart App Launch Implementation Guide (v2.2.0: STU 2.2) based on FHIR (HL7® FHIR® Standard) R4. This is the current published version.  For a full list of available versions, see the Directory of published versions

## Client Authentication: Asymmetric (public key)

- Profile Audience and Scope

- Underlying Standards

- Advertising server support for this profile

- Registering a client (communicating public keys)

- Authenticating to the Token endpoint

- Worked example

### Profile Audience and Scope

This profile describes SMART’s
client-confidential-asymmetric authentication mechanism.  It is intended
for SMART clients that can manage and sign assertions with asymmetric keys.
Specifically, this profile describes the registration-time metadata required for
a client using asymmetric keys, and the runtime process by which a client can
authenticate to an OAuth server’s token endpoint. This profile can be
implemented by user-facing SMART apps in the context of the SMART App Launch
flow or by SMART Backend Services that
establish a connection with no user-facing authorization step.

#### Use this profile when the following conditions apply:

- The target FHIR authorization server supports SMART’s client-confidential-asymmetric capability

- The client can manage asymmetric keys for authentication

- The client is able to protect a private key

Note: The FHIR specification includes a set of security
considerations including security, privacy,
and access control. These considerations apply to diverse use cases and provide
general guidance for choosing among security specifications for particular use
cases.

### Underlying Standards

- HL7 FHIR RESTful API

- RFC5246, The Transport Layer Security Protocol, V1.2

- RFC6749, The OAuth 2.0 Authorization Framework

- RFC7515, JSON Web Signature

- RFC7517, JSON Web Key

- RFC7518, JSON Web Algorithms

- RFC7519, JSON Web Token (JWT)

- RFC7521, Assertion Framework for OAuth 2.0 Client Authentication and Authorization Grants

- RFC7523, JSON Web Token (JWT) Profile for OAuth 2.0 Client Authentication and Authorization Grants

- RFC7591, OAuth 2.0 Dynamic Client Registration Protocol

### Advertising server support for this profile

As described in the Conformance section, a server advertises its support for SMART Confidential Clients with Asymmetric Keys by including the client-confidential-asymmetric capability at is .well-known/smart-configuration endpoint; configuration properties include token_endpoint, scopes_supported, token_endpoint_auth_methods_supported (with values that include private_key_jwt), and token_endpoint_auth_signing_alg_values_supported (with values that include at least one of RS384, ES384).

#### Example .well-known/smart-configuration Response

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token_endpoint": "https://ehr.example.com/auth/token",
  "token_endpoint_auth_methods_supported": ["private_key_jwt"],
  "token_endpoint_auth_signing_alg_values_supported": ["RS384", "ES384"],
  "scopes_supported": ["system/*.rs"]
}
```

### Registering a client (communicating public keys)

Before a SMART client can run against a FHIR server, the client SHALL generate
or obtain an asymmetric key pair and SHALL register its public key set with that
FHIR server’s authorization service (referred to below as the “FHIR authorization server”).
SMART does not require a
standards-based registration process, but we encourage FHIR service implementers to
consider using the OAuth 2.0 Dynamic Client Registration
Protocol.

No matter how a client registers with a FHIR authorization server, the
client SHALL register the public key that the
client will use to authenticate itself to the FHIR authorization server.  The public key SHALL
be conveyed to the FHIR authorization server in a JSON Web Key (JWK) structure presented within
a JWK Set, as defined in
JSON Web Key Set (JWKS).  The client SHALL
protect the associated private key from unauthorized disclosure
and corruption.

For consistency in implementation, FHIR authorization servers SHALL support registration of client JWKs using both of the following techniques (clients SHALL choose a server-supported method at registration time):

URL to JWK Set (strongly preferred). This URL communicates the TLS-protected
endpoint where the client’s public JWK Set can be found.
This endpoint SHALL be accessible via TLS without client authentication or authorization. Advantages
of this approach are that
it allows a client to rotate its own keys by updating the hosted content at the
JWK Set URL, assures that the public key used by the FHIR authorization server is current, and avoids the
need for the FHIR authorization server to maintain and protect the JWK Set. The client SHOULD return a “Cache-Control” header in its JWKS response

JWK Set directly (strongly discouraged). If a client cannot host the JWK
Set at a TLS-protected URL, it MAY supply the JWK Set directly to the FHIR authorization server at
registration time.  In this case, the FHIR authorization server SHALL protect the JWK Set from corruption,
and SHOULD remind the client to send an update whenever the key set changes.  Conveying
the JWK Set directly carries the limitation that it does not enable the client to
rotate its keys in-band.  Including both the current and successor keys within the JWK Set
helps counter this limitation.  However, this approach places increased responsibility
on the FHIR authorization server for protecting the integrity of the key(s) over time, and denies the FHIR authorization server the
opportunity to validate the currency and integrity of the key at the time it is used.

The client SHALL be capable of generating a JSON Web Signature in accordance with RFC7515. The client SHALL support both RS384 and ES384 for the JSON Web Algorithm (JWA) header parameter as defined in RFC7518.
The FHIR authorization server SHALL be capable of validating signatures with at least one of RS384 or ES384.
Over time, best practices for asymmetric signatures are likely to evolve. While this specification mandates a baseline of support clients and servers MAY support and use additional algorithms for signature validation.
As a reference, the signature algorithm discovery protocol token_endpoint_auth_signing_alg_values_supported property is defined in OpenID Connect as part of the OAuth2 server metadata.

No matter how a JWK Set is communicated to the FHIR authorization server, each JWK SHALL represent an
asymmetric key by including kty and kid properties, with content conveyed using
“bare key” properties (i.e., direct base64 encoding of key material as integer values).
This means that:

- For RSA public keys, each JWK SHALL include n and e values (modulus and exponent)

- For ECDSA public keys, each JWK SHALL include crv, x, and y values (curve,
x-coordinate, and y-coordinate, for EC keys)

Upon registration, the client SHALL be assigned a client_id, which the client SHALL use when
requesting an access token.

### Authenticating to the Token endpoint

This specification describes how a client authenticates using an asymmetric key, e.g., when requesting an access token during: SMART App Launch or SMART Backend Services, authentication is based on the OAuth 2.0 client credentials flow, with a JWT
assertion as the client’s authentication mechanism.

To begin the exchange, the client SHALL use the Transport Layer Security
(TLS) Protocol Version 1.2 (RFC5246) or a more recent version of TLS to
authenticate the identity of the FHIR authorization server and to establish an encrypted,
integrity-protected link for securing all exchanges between the client
and the FHIR authorization server’s token endpoint.  All exchanges described herein between the client
and the FHIR server SHALL be secured using TLS V1.2 or a more recent version of TLS .

#### Request

Before a client can request an access token, it SHALL generate a
one-time-use JSON Web Token (JWT) that will be used to authenticate the client to
the FHIR authorization server. The authentication JWT SHALL include the
following claims, and SHALL be signed with the client’s private
key (which SHOULD be an RS384 or ES384 signature). For a practical reference on JWT, as well as debugging
tools and client libraries, see https://jwt.io.

Authentication JWT Header Values

alg
required
The JWA algorithm (e.g., RS384, ES384) used for signing the authentication JWT.

kid
required
The identifier of the key-pair used to sign this JWT. This identifier SHALL
be unique within the client's JWK Set.

typ
required
Fixed value: JWT.

jku
optional
The TLS-protected URL to the JWK Set that contains the public key(s) accessible without authentication or authorization. When present, this SHALL match the JWKS URL value that the client supplied to the FHIR authorization server at client registration time. When absent, the FHIR authorization server SHOULD fall back on the JWK Set URL or the JWK Set supplied at registration time. See section Signature Verification for details.

Authentication JWT Claims

iss
required
Issuer of the JWT -- the client's client_id, as determined during registration with the FHIR authorization server
(note that this is the same as the value for the sub claim)

sub
required
The client's client_id, as determined during registration with the FHIR authorization server
(note that this is the same as the value for the iss claim)

aud
required
The FHIR authorization server's "token URL" (the same URL to which this authentication JWT will be posted -- see below)

exp
required
Expiration time integer for this authentication JWT, expressed in seconds since the "Epoch" (1970-01-01T00:00:00Z UTC). This time SHALL be no more than five minutes in the future.

jti
required
A nonce string value that uniquely identifies this authentication JWT.

After generating an authentication JWT, the client requests an access token following either the SMART App Launch or the SMART Backend Services specification.  Authentication details are conveyed using the following additional properties on the token request:

Parameters

client_assertion_type
required
Fixed value: urn:ietf:params:oauth:client-assertion-type:jwt-bearer

client_assertion
required
Signed authentication JWT value (see above)

#### Response

##### Signature Verification

The FHIR authorization server SHALL validate the JWT according to the
processing requirements defined in Section 3 of RFC7523 including validation of the signature on the JWT.

In addition, the authentication server SHALL:

- check that the jti value has not been previously encountered for the given iss within the maximum allowed authentication JWT lifetime (e.g., 5 minutes). This check prevents replay attacks.

- ensure that the client_id provided is known and matches the JWT’s iss claim.

To resolve a key to verify signatures, a FHIR authorization server SHALL follow this algorithm:

- If the jku header is present, verify that the jku is whitelisted (i.e., that it
matches the JWKS URL value supplied at registration time for the specified client_id).

- If the jku header is not whitelisted, the signature verification fails.

- If the jku header is whitelisted, create a set of potential keys by dereferencing the jku URL. Proceed to step 3.

- If the jku header is absent, create a set of potential key sources consisting of all keys found in the registration-time JWKS or found by dereferencing the registration-time JWK Set URL. Proceed to step 3.

- Identify a set of candidate keys by filtering the potential keys to identify the single key where the kid matches the value supplied in the client's JWT header, and the kty is consistent with the signature algorithm supplied in the client's JWT header (e.g., RSA for a JWT using an RSA-based signature, or EC for a JWT using an EC-based signature). If no keys match, or more than one key matches, the verification fails.

- Attempt to verify the JWK using the key identified in step 3.

To retrieve the keys from a JWKS URL in step 1 or step 2, a FHIR authorization server issues a HTTP GET request for that URL to obtain a JWKS response. For example, if a client has registered a JWKS URL of https://client.example.com/path/to/jwks.json, the server retrieves the client’s JWKS with a GET request for that URL, including a header of Accept: application/json.

If an error is encountered during the authentication process, the server SHALL
respond with an invalid_client error as defined by
the OAuth 2.0 specification.

- The FHIR authorization server SHALL NOT cache a JWKS for longer than the client’s cache-control header indicates.

- The FHIR authorization server SHOULD cache a client’s JWK Set according to the client’s cache-control header; it doesn’t need to retrieve it anew every time. 

Processing of the access token request proceeds according to either the SMART App Launch or the SMART Backend Services specification.

### Worked example

Assume that a “bilirubin result monitoring service” client has registered with a FHIR authorization server whose token endpoint is at “https://authorize.smarthealthit.org/token”, establishing the following

- JWT “issuer” URL: https://bili-monitor.example.com

- OAuth2 client_id: https://bili-monitor.example.com

- JWK identifier: kid value (see example JWK)

The client protects its private key from unauthorized access, use, and modification.

At runtime, when the bilirubin monitoring service needs to authenticate to the token endpoint, it generates a one-time-use authentication JWT.

JWT Headers:

```
{
  "typ": "JWT",
  "alg": "RS384",
  "kid": "eee9f17a3b598fd86417a980b591fbe6"
}
```

JWT Payload:

```
{
  "iss": "https://bili-monitor.example.com",
  "sub": "https://bili-monitor.example.com",
  "aud": "https://authorize.smarthealthit.org/token",
  "exp": 1422568860,
  "jti": "random-non-reusable-jwt-id-123"
}
```

Using the client’s RSA private key, with SHA-384 hashing (as specified for
an RS384 algorithm (alg) parameter value in RFC7518), the signed token
value is:

```
eyJhbGciOiJSUzM4NCIsImtpZCI6ImVlZTlmMTdhM2I1OThmZDg2NDE3YTk4MGI1OTFmYmU2IiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2JpbGktbW9uaXRvci5leGFtcGxlLmNvbSIsInN1YiI6Imh0dHBzOi8vYmlsaS1tb25pdG9yLmV4YW1wbGUuY29tIiwiYXVkIjoiaHR0cHM6Ly9hdXRob3JpemUuc21hcnRoZWFsdGhpdC5vcmcvdG9rZW4iLCJleHAiOjE0MjI1Njg4NjAsImp0aSI6InJhbmRvbS1ub24tcmV1c2FibGUtand0LWlkLTEyMyJ9.D5kAqNJwaftCqsRdVVQDq6dMBxuGFOF5svQJuXbcYp-oEyg5qOwK9ZE5cGLTHxqwfpUPNzRKgVdIGuhawAA-8g0s1nKQae8CuKs33hhKh4J34xSEwW3MYs1gwI4GHTtR_g3kYSX6QCi14Ed3GIAvYFgqRqt-gD7sewMUXL4SB8I8cXcDbCqVizm7uPVhjw6QaeKZygJJ_AVLhM4Xs9LTy4HAhdCHpN0FrNmCerUIYJvHDpcod7A0jDmxdoeW1KIBYlhdhQNwjtsTvT1ce4qacN_3KIv_fIzCKLIgDv9eWxkjAtxOmIm8aW5gX9xX7X0nbd0QglIyiic_bZVNNEh0kg
```

Note: to inspect this example JWT, you can visit https://jwt.io. Paste the signed
JWT value above into the “Encoded”  field, and paste the sample public signing key (starting with the {"kty": "RSA" JSON object, and excluding the { "keys": [ JWK Set wrapping array) into the “Public Key” box.
The plaintext JWT will be displayed in the “Decoded:Payload”  field, and a “Signature Verified” message will appear.

For a complete code example demonstrating how to generate this assertion, see: rendered Jupyter Notebook, source .ipynb file.

#### Requesting an Access Token

A client_assertion generated in this fashion can be used to request an access token as part of a SMART App Launch authorization flow, or as part of a SMART Backend Services authorization flow. See complete example:

- SMART App Launch: specification; full example

- SMART Backend Services: specification; full example

IG © 2020+ HL7 International / FHIR Infrastructure and Boston Children's Hospital.  Package hl7.fhir.uv.smart-app-launch#2.2.0 based on FHIR 4.0.1. Generated 2024-04-30

Links: Table of Contents |
QA Report

| Version History |
|

Propose a change

