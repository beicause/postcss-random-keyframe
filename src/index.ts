import { AtRule, Container, PluginCreator } from 'postcss'
import { Seed, seedRandom } from './utils'

export * from './utils'
export type Options = {
  scope?: 'Keyframe' | 'global',
  floatingPoint?: number,
  randomSeed?: number,
  offset?: number
}
export type OptionsResolved = Omit<Required<Options>, 'randomSeed'> & { randomSeed: Seed }

const randomRegex = /random\s*\(.*?\)/g

function replaceRandom(input: string, onNaN: (nanStr: string) => void, seed: Seed, floatingPoint?: number): string {
  const [s1, s2] = input.replace('random', '').replace(/[()]/g, '').split(',')
  let a = Number(s1)
  isNaN(a) && onNaN(s1)
  let b: number
  if (s2) {
    b = Number(s2)
    isNaN(b) && onNaN(s2)
  }
  else {
    b = a
    a = 0
  }
  return seedRandom(seed, a, b).toFixed(floatingPoint)
}

function replaceRandoms(container: Container, opts: OptionsResolved): void {
  container.replaceValues(randomRegex, { fast: 'random' }, random => {
    return '' + replaceRandom(random, nanStr => {
      throw container.error(`Invalid number "${nanStr}"`, { word: nanStr })
    }, opts.randomSeed, opts.floatingPoint)
  })
}

function selectorToNumber(selector: string) {
  return selector === 'from' ? 0
    : selector === 'to' ? 100
      : parseFloat(selector.substring(0, selector.length - 1))
}

function replaceKeyframeRule(atRule: AtRule, count: number, offset: number) {
  atRule.nodes.forEach(rule => {
    if (rule.type !== 'rule') return
    let _offset = 0
    for (let i = 0; i < count; i++) {
      rule.cloneBefore({
        selectors: rule.selectors.map(selector => {
          let time = (100 * i + selectorToNumber(selector)) / count
          if (_offset === 0) _offset = time * offset
          time += _offset * i
          return (time > 100 ? 100 : time) + '%'
        })
      })
    }
    rule.remove()
  })
}

const plugin: PluginCreator<Options> = (opts) => {

  const optsResolved: OptionsResolved = {
    scope: opts?.scope || 'Keyframe',
    floatingPoint: opts?.floatingPoint || 7,
    randomSeed: { seed: opts?.randomSeed || 0 },
    offset: opts?.offset || 0.0000001
  }
  return {
    postcssPlugin: 'postcss-random-keyframe',
    OnceExit(root) {
      if (optsResolved.scope === 'global') replaceRandoms(root, optsResolved)
      else if (optsResolved.scope === 'Keyframe') root.walkAtRules('keyframes', atRule => replaceRandoms(atRule, optsResolved))

    },
    AtRule: {
      keyframes(atRule) {
        let count = 1
        atRule.nodes.forEach(node => {
          if (node.type === 'decl' && node.prop === 'iteration-count') count = parseInt(node.value)
        })
        if (count <= 1) return
        replaceKeyframeRule(atRule, count, optsResolved.offset)
      }
    }
  }
}
plugin.postcss = true

export default plugin