// packages
import tap from 'tap'
import sinon from 'sinon'

import core from '@actions/core'
import fs from 'fs'

// module
import parse from '../../lib/parse.js'

function config (dep, target) {
  return [{ match: { dependency_name: dep, update_type: `semver:${target}` } }]
}

tap.test('title -> in range', async assert => {
  assert.plan(8)

  sinon.stub(core, 'info')
  sinon.stub(fs, 'existsSync').returns(false)

  const options = {
    title: 'chore(deps): bump api-problem from 6.1.2 to 6.1.4 in /path',
    config: config('api-problem', 'major')
  }

  assert.ok(parse(options))
  assert.ok(core.info.called)
  assert.equal(core.info.getCall(0)?.firstArg, 'title: "chore(deps): bump api-problem from 6.1.2 to 6.1.4 in /path"')
  assert.equal(core.info.getCall(1)?.firstArg, 'depName: api-problem')
  assert.equal(core.info.getCall(2)?.firstArg, 'from: 6.1.2')
  assert.equal(core.info.getCall(3)?.firstArg, 'to: 6.1.4')
  assert.equal(core.info.getCall(6)?.firstArg, 'config: api-problem:semver:major')
  assert.equal(core.info.getCall(7)?.firstArg, 'api-problem:semver:major detected, will auto-merge')

  core.info.restore()
  fs.existsSync.restore()
})

tap.test('title -> wildcard / regex', async assert => {
  assert.plan(8)

  sinon.stub(core, 'info')
  sinon.stub(fs, 'existsSync').returns(false)

  const options = {
    title: 'chore(deps): bump api-problem from 6.1.2 to 6.1.4 in /path',
    config: config('api-prob*', 'major')
  }

  assert.ok(parse(options))
  assert.ok(core.info.called)
  assert.equal(core.info.getCall(0)?.firstArg, 'title: "chore(deps): bump api-problem from 6.1.2 to 6.1.4 in /path"')
  assert.equal(core.info.getCall(1)?.firstArg, 'depName: api-problem')
  assert.equal(core.info.getCall(2)?.firstArg, 'from: 6.1.2')
  assert.equal(core.info.getCall(3)?.firstArg, 'to: 6.1.4')
  assert.equal(core.info.getCall(6)?.firstArg, 'config: api-prob*:semver:major')
  assert.equal(core.info.getCall(7)?.firstArg, 'api-prob*:semver:major detected, will auto-merge')

  core.info.restore()
  fs.existsSync.restore()
})

tap.test('parse -> out of range', async assert => {
  assert.plan(6)

  sinon.stub(core, 'info')
  sinon.stub(fs, 'existsSync').returns(false)

  const options = {
    title: 'chore(deps): bump api-problem from 6.1.2 to 7.0.0 in /path',
    config: config('api-problem', 'patch')
  }

  assert.notOk(parse(options), false)
  assert.ok(core.info.called)
  assert.equal(core.info.getCall(2)?.firstArg, 'from: 6.1.2')
  assert.equal(core.info.getCall(3)?.firstArg, 'to: 7.0.0')
  assert.equal(core.info.getCall(6)?.firstArg, 'config: api-problem:semver:patch')
  assert.equal(core.info.getCall(7)?.firstArg, 'manual merging required')

  core.info.restore()
  fs.existsSync.restore()
})
