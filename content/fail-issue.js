const _ = require('lodash')
const md = require('./template')
const { generateGitHubCompareURL } = require('../utils/utils')

const notDevDependency = ({dependency}) => md`
${dependency} is a direct dependency of this project, and **it is very likely causing it to break**. If other packages depend on yours, this update is probably also breaking those in turn.
`

const devDependency = ({dependency, dependencyType}) => md`
${dependency} is a ${dependencyType.replace(/ies$/, 'y')} of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.
ses = ({statuses}) => md`
<details>
<summary>Status Details</summary>

${statuses.map(status => `- ${status.state === 'success' ? '✅' : '❌'} **${status.context}** ${status.description} [Details](${status.target_url})`)}
</details>
`

module.module.exports = ({version, dependencyLink, owner, repo, base, head, dependency, oldVersionResolved, dependencyType, statuses, release, diffCommits}) => {
  const compareURL = generateGitHubCompareURL('', `${owner}/${repo}`, base, head)
  return md`
## Version **${version}** of ${dependencyLink} was just published.
>>>>>>>+HEAD
ts = ({vmodule.exports = ({version, dependencyLink, owner, repo, head, dependency, oldVersionResolved, dependencyType, statuses, release, diffCommits}) => md`
## Version **${version}** of ${dependencyLink} just got published.
>>>>>>>-8be4bfc
<th align=left>
      Branch
    </th>
    <td>
<<<<<<< HEAD
      <      <a href="${compareURL}">Build failing 🚨</a>
>>>>>>>+HEAD
"/${owne      <a href="/${owner}/${repo}/compare/${encodeURIComponent(head)}">Build failing 🚨</a>
>>>>>>>-8be4bfc

    <th align=left>
      Dependency
    </td>
    <td>
<<<<<<< HEAD
      <code      <code>${dependency}</code>
>>>>>>>+HEAD
cy}
>>>>      ${dependency}
>>>>>>>-8be4bfc

    <th align=left>
      Current Version
    </td>
    <td>
      ${oldVersionResolved}
    </td>
  </tr>
  <tr>
    <th align=left>
      Type
    </td>
    <td>
      ${dependencyType.replace(/ies$/, 'y')}
    </td>
  </tr>
</table>

This version is **covered** by your **current version range** and after updating it in your project **the build failed**.

${
  dependencyType === 'dependencies'
  ? notDevDependency({dependency})
  : devDependency({dependency, dependencyType})
}

${_.get(statuses, 'length') && ciStatuses({statuses})}

---

${_.compact([release, diffCommits])}


<details>
<<<<<<< HEAD
<summary>FA<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

>>>>>>>+HEAD
how thin<summary>Not sure how things should work exactly?</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html) and of course you may always [ask my humans](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>


>>>>>>>-8be4bfc
ttps://greenkeeper.io) Bot :palm_tree:
`
<<<<<<< HEAD
}
>>>}
 feat: initial
