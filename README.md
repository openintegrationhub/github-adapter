<p align="center">
  <img src="https://github.com/openintegrationhub/openintegrationhub/blob/master/Assets/medium-oih-einzeilig-zentriert.jpg" alt="Sublime's custom image" width="400"/>
</p>

# Github-Adapter

<img src="logo.png" alt="Sublime's custom image" width="40"/> Open Integration Hub adapter for [**The world's leading software development platform · GitHub**](https://github.com).

## Authentication

The following env vars must be configured:

- `CLIENT_ID`
- `CLIENT_SECRET`

This [**guide**](https://auth0.com/docs/connections/social/github) shows how those values can be found on GitHub.

## Functionality

The adapter supports the following functionailities.

```markdown
Root
||
||
||_ _lib
||   ||
||   |_ _Actions
||   ||      ||
||   ||      |_ createIssues
||   ||      |_ createPullRequest
||   ||
||   |_ _Triggers
||   ||      ||
||   ||      |_ getIssues
||   ||      |_ getPullRequests
||   ||      |_ getOrganizations
||   ||      |_ getOrganizationMembers
```

### Triggers

#### Get Issues

Fetches all issues assigned to the current user.

Outgoing message format: [**outgoing message format**](lib/schemas/getIssues.out.json)

#### Get Pull Requests

Fetches all pull requests assigned to the current user.

Outgoing message format: [**outgoing message format**](lib/schemas/getPullRequests.out.json)

#### Get Organizations

Fetches all organizations the current user belongs to.

Outgoing message format: [**outgoing message format**](lib/schemas/getOrganizations.out.json)

#### Get Organization Members

Fetches all organization members of the organizations the current user belongs to.

Outgoing message format: [**outgoing message format**](lib/schemas/getOrganizationMembers.out.json)

### Actions

#### Create Issue

Creates a new issue on behalf of the user in the specified repsitory.

Incoming message format: [**incoming message format**](lib/schemas/createIssues.in.json)

Outgoing message format: [**outgoing message format**](lib/schemas/createIssues.out.json)

##### Required Fields

- repository
- owner
- title (The title of the issue.)

#### Create Pull Request

Creates a new pull request on behalf of the user, in the specified repository.

Incoming message format: [**incoming message format**](lib/schemas/createPullRequest.in.json)

Outgoing message format: [**outgoing message format**](lib/schemas/createPullRequest.out.json)

##### Required Fields

- repository
- owner
- title (The title of the new pull request.)
- head (The name of the branch where your changes are implemented.)
- base (The name of the branch you want the changes pulled into.)

## Version

Version 2.0

## License

Apache-2.0 © [Cloud Ecosystem e.V.](https://www.cloudecosystem.org/)
