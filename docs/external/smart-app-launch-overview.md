> 來源: https://hl7.org/fhir/smart-app-launch/

Overview - SMART App Launch v2.2.0

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

- Overview

This page is part of the Smart App Launch Implementation Guide (v2.2.0: STU 2.2) based on FHIR (HL7® FHIR® Standard) R4. This is the current published version.  For a full list of available versions, see the Directory of published versions

Plain Language Summary Goes Here

## Overview

Official URL: http://hl7.org/fhir/smart-app-launch/ImplementationGuide/hl7.fhir.uv.smart-app-launch

Version:
2.2.0

Active

as of 2023-03-01

Computable Name: SmartAppLaunch

- Discovery of Server Capabilities and Configuration

- SMART Defines Two Patterns For Client Authorization

- SMART Defines Two Patterns For Client Authentication

- Scopes for Limiting Access

- Token Introspection

- User-Access Brands

- Persisting App State

- FHIR Publication Details

This implementation guide describes a set of foundational patterns based on OAuth 2.0 for client applications to authorize, authenticate, and integrate with FHIR-based data systems. The patterns defined in this specification are introduced in the sections below. For background on SMART Health IT, see smarthealthit.org.

Portions of the specification designated as Experimental are indicated by EXP and background shading.

### Discovery of Server Capabilities and Configuration

SMART defines a discovery document, available at .well-known/smart-configuration relative to a FHIR Server Base URL, allowing clients to learn the authorization endpoint URLs and features a server supports. This information helps client direct authorization requests to the right endpoint, and helps clients construct an authorization request that the server can support.

### SMART Defines Two Patterns For Client Authorization

#### Authorization via SMART App Launch

Authorizes a user-facing client application (“App”) to connect to a FHIR Server. This pattern allows for “launch context” such as a currently selected patient to be shared with the app, based on a user’s session inside an EHR or other health data software, or based on a user’s selection at launch time. Authorization allows for delegation of a user’s permissions to the app itself.

#### Authorization via SMART Backend Services

Authorizes a headless or automated client application (“Backend Service”) to connect to a FHIR Server. This pattern allows for backend services to connect and interact with an EHR when there is no user directly involved in the launch process, or in other circumstances where permissions are assigned to the client out-of-band.

### SMART Defines Two Patterns For Client Authentication

When clients need to authenticate, this implementation guide defines two methods.

Note that client authentication is not required in all authorization scenarios, and not all SMART clients are capable of authenticating (see discussion of “Public Clients” in the SMART App Launch overview).

#### Asymmetric (“private key JWT”) authentication

Authenticates a client using an asymmetric keypair. This is SMART’s preferred authentication method because it avoids sending a shared secret over the wire.

#### Symmetric (“client secret”) authentication

Authenticates a client using a secret that has been pre-shared between the client and server.

### Scopes for Limiting Access

SMART uses a language of “scopes” to define specific access permissions that can be delegated to a client application. These scopes draw on FHIR API definitions for interactions, resource types, and search parameters to describe a permissions model. For example, an app might be granted scopes like user/Encounter.rs, allowing it to read and search for Encounters that are accessible to the user who has authorized the app. Similarly, a backend service might be granted scopes like system/Encounter.rs, allowing it to read and search for Encounters within the overall set of data it is configured to access. User-facing apps can also receive “launch context” to indicate details about the current patient, other aspects of a user’s EHR session, or a user’s selections when launching the app.

Note that the scope syntax has changed since SMARTv1. Further details are in the section Scopes for requesting FHIR resources.

### Token Introspection

SMART defines a Token Introspection API allowing Resource Servers or software components to understand the scopes, users, patients, and other context associated with access tokens. This pattern allows a looser coupling between Resource Servers and Authorization Servers.

### User-Access Brands

SMART defines a publication format for API providers to make branding information available to patient-facing apps. This helps apps offer a “connect to my records” UX where providers appear with the names, logos, and descriptions they choose.

### Persisting App State

SMART defines an API for apps to persist state to an EHR, allowing apps to save configuration details including user- or patient-specific payloads.

### FHIR Publication Details

#### Intellectual Property Statements

This publication includes IP covered under the following statements.

- This material derives from the HL7 Terminology (THO). THO is copyright ©1989+ Health Level Seven International and is made available under the CC0 designation. For more licensing information see: https://terminology.hl7.org/license Show Usage

- Endpoint Payload Type: Bundle/example1, Bundle/example2, Bundle/example3, Bundle/example4 and UserAccessEndpoint

- Organization type: Bundle/example1, Bundle/example2... Show 4 more, Bundle/example3, Bundle/example4, UserAccessBrand and UserAccessCategoryValueSet

- This material derives from the HL7 Terminology (THO). THO is copyright ©1989+ Health Level Seven International and is made available under the CC0 designation. For more licensing information see: https://terminology.hl7.org/licenseSome content from IHE® Copyright © 2015 IHE International, Inc.    The IHE concepts are from the IHE Technical Frameworks and Supplements, available for free download and use at http://www.ihe.net/Technical_Frameworks/ Show Usage

- Endpoint Connection Type: Bundle/example1, Bundle/example2, Bundle/example3, Bundle/example4 and UserAccessEndpoint

#### Cross Version Analysis

Note: While this publication includes artifacts for FHIR R4, SMART App Launch is compatible with any version of FHIR from DSTU2 and onward.

This is an R4 IG. None of the features it uses are changed in R4B, so it can be used as is with R4B systems. Packages for both R4 (hl7.fhir.uv.smart-app-launch.r4) and R4B (hl7.fhir.uv.smart-app-launch.r4b) are available.

#### Package Dependencies

Note: While this publication includes artifacts for FHIR R4, SMART App Launch is compatible with any version of FHIR from DSTU2 and onward.

IGPackageFHIR
SMART App Launchhl7.fhir.uv.smart-app-launch#2.2.0R4

FHIR Extensions Packhl7.fhir.uv.extensions#5.1.0-snapshot1R5

HL7 Terminology (THO)hl7.terminology.r5#5.3.0R5

HL7 Terminology (THO)hl7.terminology#5.5.0R4

FHIR Extensions Packhl7.fhir.uv.extensions.r4#1.0.0R4

Package hl7.fhir.uv.extensions#5.1.0-snapshot1

This IG defines the global extensions - the ones defined for everyone. These extensions are always in scope wherever FHIR is being used (built Tue, Mar 12, 2024 13:29+1100+11:00)

Package hl7.fhir.uv.extensions.r4#1.0.0

This IG defines the global extensions - the ones defined for everyone. These extensions are always in scope wherever FHIR is being used (built Sun, Mar 26, 2023 08:46+1100+11:00)

#### Global Profile Definitions

There are no Global profiles defined

IG © 2020+ HL7 International / FHIR Infrastructure and Boston Children's Hospital.  Package hl7.fhir.uv.smart-app-launch#2.2.0 based on FHIR 4.0.1. Generated 2024-04-30

Links: Table of Contents |
QA Report

| Version History |
|

Propose a change

