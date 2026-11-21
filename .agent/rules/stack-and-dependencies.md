# stack-and-dependencies.md

One job: control which tools and packages enter a project. The list of approved and undecided choices lives in the project's own AGENTS.md.

1. Pin exact versions of the framework, the ORM, and the runtime at project start. Use no `^` or `~`. Commit the lockfile. Put the Node version in `package.json` under `engines`. Ask before adding any other version file. Why: a silent upgrade changes behaviour and breaks builds.
2. Ask before adding or upgrading any dependency, dev dependencies included. State the package, the version, what it does, and whether Node, the framework, or the browser already does the job. Why: every package is a supply-chain and maintenance decision.
3. Anything not on the project's pre-approved list needs the question in rule 2. Why: the list is the person's decision, not the agent's.
4. For each choice that AGENTS.md or the PRD lists as undecided, ask once, before first use. After the person answers, do not ask again in that project. Why: an early guess becomes expensive to reverse.
5. A suggestion in the project documents is not a decision. Use a suggested or [ASSUMPTION] option only after the person confirms it. Why: unconfirmed options may be wrong for the business.
6. Add no client, key, or dependency for a feature that is out of scope. Why: unused SDKs and keys add attack surface.
