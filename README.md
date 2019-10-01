# Github-Adapter

![logo](logo.png) ![oih](https://github.com/openintegrationhub/openintegrationhub/blob/master/Assets/medium-oih-einzeilig-zentriert.jpg)

Open Integration Hub adapter for [**The world's leading software development platform · GitHub**](https://github.com).

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

#### Get Pull Requests

Fetches all pull requests assigned to the current user.

#### Get Organizations

Fetches all organizations the current user belongs to.

#### Get Organization Members

Fetches all organization members of the organizations the current user belongs to.

### Actions

#### Create Issue

Creates a new issue on behalf of the user in the specified repsitory.

#### Create Pull Request

Creates a new pull request on behalf of the user, in the specified repository.

## License

Apache-2.0 © [Cloud Ecosystem e.V.](https://www.cloudecosystem.org/)
