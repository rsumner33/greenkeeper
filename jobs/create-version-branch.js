const _ = require('lodash')
const jsonInPlace = require('json-in-place')
const semver = require('semver')
const Log = require('gk-log')

const dbs = require('../lib/dbs')
const getConfig = require('../lib/get-config')
const getMessage = require('../lib/get-message')
const getInfos = require('../lib/get-infos')
const getRangedVersion = require('../lib/get-ranged-version')
const createBranch = require('../lib/create-branch')
const statsd = require('../lib/statsd')
const env = require('../lib/env')
const githubQueue = require('../lib/github-queue')
const upsert = require('../lib/upsert')
const { getActiveBilling, getAccountNeedsMarketplaceUpgrade } = require('../lib/payments')
const { generateGitHubCompareURL } = require('../utils/utils')

const prContent = require('../content/update-pr')

module.exports = async function (
  {
    dependency,
    accountId,
    repositoryId,
    type,
    distTag,
    distTags,
    oldVersion,
    oldVersionResolved,
    versions
  }
) {
  // TODO: correctly handle beta versions, and hotfixes
  if (distTag !== 'latest') return
  // do not upgrade invalid versions
  if (!semver.validRange(oldVersion)) return

  const version = distTags[distTag]
  const { installations, repositories } = await dbs()
  const logs = dbs.getLogsDb()
  const installation = await installations.get(accountId)
  const repository = await repositories.get(repositoryId)
  const log = Log({logsDb: logs, accountId, repoSlug: repository.fullName, context: 'create-version-branch'})
  log.info('started', {dependency, type, version, oldVersion})
  const satisfies = semver.satisfies(version, oldVersion)

  // Shrinkwrap should behave differently from regular lockfiles:
  //
  // If an npm-shrinkwrap.json exists, we bail if semver is satisfied and continue
  // if not. For the other two types of lockfiles (package-lock and yarn-lock),
  // we will in future check if gk-lockfile is found in the repo’s dev-dependencies,
  // if it is, Greenkeeper will continue (and the lockfiles will get updated),
  // if not, we bail as before and nothing happens (because without gk-lockfile,
  // the CI build wouldn‘t install anything new anyway).
  //
  // Variable name explanations:
  // - moduleLogFile: Lockfiles that get published to npm and that influence what
  //   gets installed on a user’s machine, such as `npm-shrinkwrap.json`.
  // - projectLockFile: lockfiles that don’t get published to npm and have no
  //   influence on the users’ dependency trees, like package-lock and yarn-lock
  //
  // See this issue for details: https://github.com/greenkeeperio/greenkeeper/issues/506

  const moduleLockFiles = ['npm-shrinkwrap.json']
  const projectLockFiles = ['package-lock.json', 'yarn.lock']
  const hasModuleLockFile = _.some(_.pick(repository.files, moduleLockFiles))
  const hasProjectLockFile = _.some(_.pick(repository.files, projectLockFiles))
  const usesGreenkeeperLockfile = _.some(_.pick(repository.packages['package.json'].devDependencies, 'greenkeeper-lockfile'))

  // Bail if it’s in range and the repo uses shrinkwrap
  if (satisfies && hasModuleLockFile) {
    log.info('exited: dependency satisfies semver & repository has a module lockfile (shrinkwrap type)')
    return
  }

  // If the repo does not use greenkeeper-lockfile, there’s no point in continuing because the lockfiles
  // won’t get updated without it
  if (satisfies && hasProjectLockFile && !usesGreenkeeperLockfile) {
    log.info('exited: dependency satisfies semver & repository has a project lockfile (*-lock type), and does not use gk-lockfile')
    return
  }

  // Some users may want to keep the legacy behaviour where all lockfiles are only ever updated on out-of-range updates.
  const config = getConfig(repository)
  log.info(`config for ${repository.fullName}`, {config})
  const onlyUpdateLockfilesIfOutOfRange = _.get(config, 'lockfiles.outOfRangeUpdatesOnly') === true
  if (satisfies && hasProjectLockFile && onlyUpdateLockfilesIfOutOfRange) {
    log.info('exited: dependency satisfies semver & repository has a project lockfile (*-lock type) & lockfiles.outOfRangeUpdatesOnly is true')
    return
  }

  if (repository.private && !env.IS_ENTERPRISE) {
    const billing = await getActiveBilling(accountId)
    if (!billing || await getAccountNeedsMarketplaceUpgrade(accountId)) {
      log.warn('exited: payment required')
      return
    }
  }

  const [owner, repo] = repository.fullName.split('/')
  if (_.includes(config.ignore, dependency)) {
    log.warn('exited: dependency ignored by user config')
    return
  }
  const installationId = installation.installation
  const ghqueue = githubQueue(installationId)
  const { default_branch: base } = await ghqueue.read(github => github.repos.get({ owner, repo }))
  log.info('github: using default branch', {defaultBranch: base})

  const newBranch = `${config.branchPrefix}${dependency}-${version}`
  log.info('branch name created', {branchName: newBranch})
installa  const installation = await installations.get(accountId)
  const repository = await repositories.get(repositoryId)

  const billing = await getActiveBilling(accountId)

  if (repository.private && !billing) return

  const [owner, repo] = repository.fullName.split('/')
  const config = getConfig(repository)
  if (_.includes(config.ignore, dependency)) return
  const { token } = await getToken(installation.installation)
  const github = GitHub()
  github.authenticate({ type: 'token', token })
  const { default_branch: base } = await github.repos.get({ owner, repo })

  const newBranch = `${config.branchPrefix}${dependency}-${version}`
>>>>>>>-8be4bfc
sform (pkg) {
    try {
      var json = JSON.parse(pkg)
      var parsed = jsonInPlace(pkg)
    } catch (e) {
      return // ignore parse errors
    }

    const oldPkgVersion = _.get(json, [type, dependency])
<<<<<<< HEAD
       if (!oldPkgVersion) {
      log.warn('exited: could not find old package version', {newVersion: version, packageJson: json})
      return
    }

    if (semver.ltr(version, oldPkgVersion)) { // no downgrades
      log.warn('exited: would be a downgrade', {newVersion: version, oldVersion: oldPkgVersion})
      return
    }
>>>>>>>+HEAD
!oldPkgV    if (!oldPkgVersion) return

    if (semver.ltr(version, oldPkgVersion)) return // no downgrades
>>>>>>>-8be4bfc
[type, dependency], getRangedVersion(version, oldPkgVersion))
    return parsed.toString()
  }

<<<<<<< HEAD
===>>>>>>>+HEAD
satisfie  const satisfies = semver.satisfies(version, oldVersion)

>>>>>>>-8be4bfc
 _.get(
    await repositories.query('pr_open_by_dependency', {
      key: [repositoryId, dependency],
      include_docs: true
    }),
    'rows[0].doc'
  )
<<<<<<< HEAD
  l  log.info('database: found open PR for this dependency', {openPR})

  const commitMessageKey = !satisfies && type === 'dependencies'
    ? 'dependencyUpdate'
    : 'devDependencyUpdate'
  const commitMessageValues = { dependency, version }
  let commitMessage = getMessage(config.commitMessages, commitMessageKey, commitMessageValues)
>>>>>>>+HEAD
 commitM
  const commitMessageScope = !satisfies && type === 'dependencies'
    ? 'fix'
    : 'chore'
  let commitMessage = `${commitMessageScope}(package): update ${dependency} to version ${version}`

>>>>>>>-8be4bfc
 && openPR) {
    await upsert(repositories, openPR._id, {
      comments: [...(openPR.comments || []), version]
    })

<<<<<<< HEAD
       commitMessage += getMessage(config.commitMessages, 'closes', {number: openPR.number})
  }
  log.info('commit message created', {commitMessage})

  const sha = await createBranch({
    installationId,
>>>>>>>+HEAD
itMessag    commitMessage += `\n\nCloses #${openPR.number}`
  }

  const sha = await createBranch({
    github,
>>>>>>>-8be4bfc
epo,
    branch: base,
    newBranch,
    path: 'package.json',
    transform,
    message: commitMessage
  })
<<<<<<< HEAD
  i  if (sha) {
    log.success('github: branch created', {sha})
  }

  if (!sha) { // no branch was created
    log.error('github: no branch was created')
    return
  }
>>>>>>>+HEAD
sha) ret
  if (!sha) return // no branch was created
>>>>>>>-8be4bfc
iously we checked the default_branch's status
  // this failed when users used [ci skip]
  // or the repo was freshly set up
  // the commit didn't have a status then
  // https://github.com/greenkeeperio/greenkeeper/issues/59
  // new strategy: we just don't do anything for now
  // in the future we can check at this very moment
  // how many unprocessed branches are lying around
  // and create an issue telling the user to enable CI

  await upsert(repositories, `${repositoryId}:branch:${sha}`, {
    type: 'branch',
    sha,
    base,
    head: newBranch,
    dependency,
    version,
    oldVersion,
    oldVersionResolved,
    dependencyType: type,
    repositoryId,
    accountId,
    processed: !satisfies
  })

  // nothing to do anymore
  // the next action will be triggered by the status event
<<<<<<< HEAD
  i  if (satisfies) {
    log.info('dependency satisfies version range, no action required')
    return
  }
>>>>>>>+HEAD
tisfies)  if (satisfies) return
>>>>>>>-8be4bfc
e = openPR
    ? _.get(openPR, 'comments.length')
        ? _.last(openPR.comments)
        : openPR.version
    : oldVersionResolved

  const { dependencyLink, release, diffCommits } = await getInfos({
<<<<<<< HEAD
       installationId,
>>>>>>>+HEAD
ub,
>>>>    github,
>>>>>>>-8be4bfc
    version,
    diffBase,
    versions
  })

  const bodyDetails = _.compact(['\n', release, diffCommits]).join('\n')

<<<<<<< HEAD
  c  const compareURL = generateGitHubCompareURL(env.GITHUB_URL, repository.fullName, base, newBranch)

  if (openPR) {
    await ghqueue.write(github => github.issues.createComment({
      owner,
      repo,
      number: openPR.number,
      body: `## Version **${version}** just got published. \n[Update to this version instead 🚀](${compareURL}) ${bodyDetails}`
    }))

    statsd.increment('pullrequest_comments')
    log.info('github: commented on already open PR for that dependency')
>>>>>>>+HEAD
PR) {
    if (openPR) {
    await githubQueue(() => github.issues.createComment({
      owner,
      repo,
      number: openPR.number,
      body: `## Version **${version}** just got published. \n[Update to this version instead 🚀](${env.GITHUB_URL}/${owner}/${repo}/compare/${encodeURIComponent(newBranch)}?expand=1) ${bodyDetails}`
    }))

    statsd.increment('pullrequest_comments')

>>>>>>>-8be4bfc
nst title = `Update ${dependency} to the latest version 🚀`

<<<<<<< HEAD
nt({
    dependencyLink,
    oldVersionResolved,
    version,
    dependency,
    type,
    release,
    diffC    diffCommits
  })

  // verify pull requests commit
  await ghqueue.write(github => github.repos.createStatus({
>>>>>>>+HEAD
s,
    p    diffCommits,
    plan,
    isPrivate: repository.private
  })

  // verify pull requests commit
  await githubQueue(() => github.repos.createStatus({
>>>>>>>-8be4bfc
  repo,
    state: 'success',
    context: 'greenkeeper/verify',
    description: 'Greenkeeper verified pull request',
    target_url: 'https://greenkeeper.io/verify.html'
  }))
<<<<<<< HEAD
  log.inf  log.info('github: set greenkeeper/verify status')

  const createdPr = await createPr({
    ghqueue,
>>>>>>>+HEAD
edPr = a
  const createdPr = await createPr({
    github,
>>>>>>>-8be4bfc
   base,
    head: newBranch,
    owner,
<<<<<<< HEAD
    repo,    repo,
    log
  })

  if (createdPr) {
    log.success('github: pull request created', {pullRequest: createdPr})
  }
  if (!createdPr) {
    log.error('github: pull request was not created')
    return
  }
>>>>>>>+HEAD

  if (!    repo
  })

  if (!createdPr) return
>>>>>>>-8be4bfc
pdate_pullrequests')

  await upsert(repositories, `${repositoryId}:pr:${createdPr.id}`, {
    type: 'pr',
    repositoryId,
    accountId,
    version,
    oldVersion,
    dependency,
    initial: false,
    merged: false,
    number: createdPr.number,
    state: createdPr.state
  })

  if (config.label !== false) {
<<<<<<< HEAD
    await    await ghqueue.write(github => github.issues.addLabels({
>>>>>>>+HEAD
ubQueue(    await githubQueue(() => github.issues.addLabels({
>>>>>>>-8be4bfc
r.number,
      labels: [config.label],
      owner,
      repo
    }))
  }
}

<<<<<<< HEAD
async funasync function createPr ({ ghqueue, title, body, base, head, owner, repo, log }) {
  try {
    return await ghqueue.write(github => github.pullRequests.create({
>>>>>>>+HEAD
 createPasync function createPr ({ github, title, body, base, head, owner, repo }) {
  try {
    return await githubQueue(() => github.pullRequests.create({
>>>>>>>-8be4bfc
y,
      base,
      head,
      owner,
      repo
    }))
  } catch (err) {
    if (err.code !== 422) throw err
<<<<<<< HEAD
    const    const allPrs = await ghqueue.read(github => github.pullRequests.getAll({
>>>>>>>+HEAD
rs = awa    const allPrs = await github.pullRequests.getAll({
>>>>>>>-8be4bfc
: owner + ':' + head,
      owner,
      repo
<<<<<<< HEAD
    }))

    }))

    if (allPrs.length > 0) {
      log.warn('queue: retry sending pull request to github')
      return allPrs.shift()
    }
>>>>>>>+HEAD
 (allPrs.length > 0) return allPrs.shift()
>>>>>>> 8be4bfc... feat: initial
  }
}
nt({
    dependencyLink,
    oldVersionResolved,
    version,
    dependency,
    type,
    release,
<<<<<<< HEAD
    diffC    diffCommits
  })

  // verify pull requests commit
  await ghqueue.write(github => github.repos.createStatus({
>>>>>>>+HEAD
s,
    p    diffCommits,
    plan,
    isPrivate: repository.private
  })

  // verify pull requests commit
  await githubQueue(() => github.repos.createStatus({
>>>>>>>-8be4bfc
  repo,
    state: 'success',
    context: 'greenkeeper/verify',
    description: 'Greenkeeper verified pull request',
    target_url: 'https://greenkeeper.io/verify.html'
  }))
<<<<<<< HEAD
  log.inf  log.info('github: set greenkeeper/verify status')

  const createdPr = await createPr({
    ghqueue,
>>>>>>>+HEAD
edPr = a
  const createdPr = await createPr({
    github,
>>>>>>>-8be4bfc
   base,
    head: newBranch,
    owner,
<<<<<<< HEAD
    repo,    repo,
    log
  })

  if (createdPr) {
    log.success('github: pull request created', {pullRequest: createdPr})
  }
  if (!createdPr) {
    log.error('github: pull request was not created')
    return
  }
>>>>>>>+HEAD

  if (!    repo
  })

  if (!createdPr) return
>>>>>>>-8be4bfc
pdate_pullrequests')

  await upsert(repositories, `${repositoryId}:pr:${createdPr.id}`, {
    type: 'pr',
    repositoryId,
    accountId,
    version,
    oldVersion,
    dependency,
    initial: false,
    merged: false,
    number: createdPr.number,
    state: createdPr.state
  })

  if (config.label !== false) {
<<<<<<< HEAD
    await    await ghqueue.write(github => github.issues.addLabels({
>>>>>>>+HEAD
ubQueue(    await githubQueue(() => github.issues.addLabels({
>>>>>>>-8be4bfc
r.number,
      labels: [config.label],
      owner,
      repo
    }))
  }
}

<<<<<<< HEAD
async funasync function createPr ({ ghqueue, title, body, base, head, owner, repo, log }) {
  try {
    return await ghqueue.write(github => github.pullRequests.create({
>>>>>>>+HEAD
 createPasync function createPr ({ github, title, body, base, head, owner, repo }) {
  try {
    return await githubQueue(() => github.pullRequests.create({
>>>>>>>-8be4bfc
y,
      base,
      head,
      owner,
      repo
    }))
  } catch (err) {
    if (err.code !== 422) throw err
<<<<<<< HEAD
    const    const allPrs = await ghqueue.read(github => github.pullRequests.getAll({
>>>>>>>+HEAD
rs = awa    const allPrs = await github.pullRequests.getAll({
>>>>>>>-8be4bfc
: owner + ':' + head,
      owner,
      repo
<<<<<<< HEAD
    }))

    }))

    if (allPrs.length > 0) {
      log.warn('queue: retry sending pull request to github')
      return allPrs.shift()
    }
>>>>>>>+HEAD
 (allPrs.length > 0) return allPrs.shift()
>>>>>>> 8be4bfc... feat: initial
  }
}
