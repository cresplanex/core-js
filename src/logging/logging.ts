/**
 * Isomorphic logging module with support for colors!
 *
 * @module logging
 */

import * as env from '../utils/environment'
import { CoreSet } from '../structure/set'
import * as pair from '../utils/pair'
import * as dom from '../utils/dom'
import * as json from '../utils/json'
import { CoreMap } from '../structure/map'
import * as eventloop from '../utils/eventloop'
import * as math from '../utils/math'
import * as common from './common'
import { CoreSymbol } from '../structure/symbol'

export { BOLD, UNBOLD, BLUE, GREY, GREEN, RED, PURPLE, ORANGE, UNCOLOR } from './common'

/**
 * @type {Object<Symbol,pair.Pair<string,string>>}
 */
const _browserStyleMap = {
  [common.BOLD.value]: pair.Pair.create('font-weight', 'bold'),
  [common.UNBOLD.value]: pair.Pair.create('font-weight', 'normal'),
  [common.BLUE.value]: pair.Pair.create('color', 'blue'),
  [common.GREEN.value]: pair.Pair.create('color', 'green'),
  [common.GREY.value]: pair.Pair.create('color', 'grey'),
  [common.RED.value]: pair.Pair.create('color', 'red'),
  [common.PURPLE.value]: pair.Pair.create('color', 'purple'),
  [common.ORANGE.value]: pair.Pair.create('color', 'orange'), // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [common.UNCOLOR.value]: pair.Pair.create('color', 'black')
}

/**
 * @param {Array<string|Symbol|Object|number|function():any>} args
 * @return {Array<string|object|number>}
 */
/* c8 ignore start */
const computeBrowserLoggingArgs = (args: Array<string|CoreSymbol|Symbol|Object|number|(() => any)>): Array<string|object|number> => {
  if (args.length === 1 && args[0]?.constructor === Function) {
    args = (args[0] as () => any)()
  }
  const strBuilder = []
  const styles = []
  const currentStyle = CoreMap.create<string, string>()
  /**
   * @type {Array<string|Object|number>}
   */
  let logArgs: Array<string|Object|number> = []
  // try with formatting until we find something unsupported
  let i = 0
  for (; i < args.length; i++) {
    let arg = args[i]
    if (arg instanceof CoreSymbol) {
      arg = arg.value
    }
    // @ts-ignore
    const style = _browserStyleMap[arg]
    if (style !== undefined) {
      currentStyle.set(style.left, style.right)
    } else {
      if (arg === undefined) {
        break
      }
      if (arg.constructor === String || arg.constructor === Number) {
        const style = dom.mapToStyleString(currentStyle.value)
        if (i > 0 || style.length > 0) {
          strBuilder.push('%c' + arg)
          styles.push(style)
        } else {
          strBuilder.push(arg)
        }
      } else {
        break
      }
    }
  }
  if (i > 0) {
    // create logArgs with what we have so far
    logArgs = styles
    logArgs.unshift(strBuilder.join(''))
  }
  // append the rest
  for (; i < args.length; i++) {
    let arg = args[i]
    if (arg instanceof CoreSymbol) {
      arg = arg.value
    }
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg)
    }
  }
  return logArgs
}

const computeLoggingArgs = env.supportsColor
  ? computeBrowserLoggingArgs
  : common.computeNoColorLoggingArgs

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
export const print = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
  console.log(...computeLoggingArgs(args))
  vconsoles.forEach((vc) => vc.print(args))
}

/* c8 ignore start */
/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
export const warn = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
  console.warn(...computeLoggingArgs(args))
  args.unshift(common.ORANGE.value)
  vconsoles.forEach((vc) => vc.print(args))
}

/**
 * @param {Error} err
 */
export const printError = (err: Error) => {
  console.error(err)
  vconsoles.forEach((vc) => vc.printError(err))
}
/* c8 ignore stop */

/**
 * @param {string} url image location
 * @param {number} height height of the image in pixel
 */
/* c8 ignore start */
export const printImg = (url: string, height: number) => {
  if (env.isBrowser) {
    console.log(
      '%c                      ',
      `font-size: ${height}px; background-size: contain; background-repeat: no-repeat; background-image: url(${url})`
    )
    // console.log('%c                ', `font-size: ${height}x; background: url(${url}) no-repeat;`)
  }
  vconsoles.forEach((vc) => vc.printImg(url, height))
}

/**
 * @param {string} base64
 * @param {number} height
 */
export const printImgBase64 = (base64: string, height: number) =>
  printImg(`data:image/gif;base64,${base64}`, height)

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
export const group = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
  console.group(...computeLoggingArgs(args))
  vconsoles.forEach((vc) => vc.group(args))
}

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 */
export const groupCollapsed = (...args: Array<string|CoreSymbol|Symbol|Object|number>) => {
  console.groupCollapsed(...computeLoggingArgs(args))
  vconsoles.forEach((vc) => vc.groupCollapsed(args))
}

export const groupEnd = () => {
  console.groupEnd()
  vconsoles.forEach((vc) => vc.groupEnd())
}

/**
 * @param {function():Node} createNode
 */
export const printDom = (createNode: () => Node) => {
  return vconsoles.forEach((vc) => vc.printDom(createNode()))
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} height
 */
export const printCanvas = (canvas: HTMLCanvasElement, height: number) =>
  printImg(canvas.toDataURL(), height)

export const vconsoles = CoreSet.create<VConsole>()

/**
 * @param {Array<string|CoreSymbol|Symbol|Object|number>} args
 * @return {Array<Element>}
 */
const _computeLineSpans = (args: Array<string|CoreSymbol|Symbol|Object|number>): Array<Element> => {
  const spans: Array<Element> = []
  const currentStyle = new CoreMap<string, string>()
  // try with formatting until we find something unsupported
  let i = 0
  for (; i < args.length; i++) {
    let arg = args[i]
    // @ts-ignore
    const style = _browserStyleMap[arg]
    if (style !== undefined) {
      currentStyle.set(style.left, style.right)
    } else {
      if (arg.constructor === String || arg.constructor === Number) {
        const textEl = dom.text(arg.toString())
        if (!textEl) {
          throw new Error('Could not create text element')
        }
        const span = dom.element('span', [
          pair.Pair.create('style', dom.mapToStyleString(currentStyle.value))
        ], [textEl])
        if (span.innerHTML === '') {
          span.innerHTML = '&nbsp;'
        }
        spans.push(span)
      } else {
        break
      }
    }
  }
  // append the rest
  for (; i < args.length; i++) {
    let content = args[i]
    if (!(content instanceof Symbol)) {
      if (content.constructor !== String && content.constructor !== Number) {
        content = ' ' + json.stringify(content) + ' '
      }
      const textEl = dom.text(content.toString())
      if (!textEl) {
        throw new Error('Could not create text element')
      }
      spans.push(
        dom.element('span', [], [textEl])
      )
    }
  }
  return spans
}
/* c8 ignore stop */

const lineStyle =
  'font-family:monospace;border-bottom:1px solid #e2e2e2;padding:2px;'

/* c8 ignore start */
export class VConsole {
  dom: Element
  ccontainer: Element
  depth: number

  /**
   * @param {Element} dom
   */
  constructor (dom: Element) {
    this.dom = dom
    /**
     * @type {Element}
     */
    this.ccontainer = this.dom
    this.depth = 0
    vconsoles.add(this)
  }

  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @param {boolean} collapsed
   */
  group (args: Array<string|Symbol|Object|number>, collapsed = false) {
    eventloop.enqueue(() => {
      const textElDown = dom.text('▼')
      const textElRight = dom.text('▶')
      const textElSpace = dom.text(' ')
      if (!textElDown || !textElRight || !textElSpace) {
        throw new Error('Could not create text element')
      }
      const triangleDown = dom.element('span', [
        pair.Pair.create('hidden', collapsed),
        pair.Pair.create('style', 'color:grey;font-size:120%;')
      ], [textElDown])
      const triangleRight = dom.element('span', [
        pair.Pair.create('hidden', !collapsed),
        pair.Pair.create('style', 'color:grey;font-size:125%;')
      ], [textElRight])
      const content = dom.element(
        'div',
        [pair.Pair.create(
          'style',
          `${lineStyle};padding-left:${this.depth * 10}px`
        )],
        [triangleDown, triangleRight, textElSpace].concat(
          _computeLineSpans(args)
        )
      )
      const nextContainer = dom.element('div', [
        pair.Pair.create('hidden', collapsed)
      ])
      const nextLine = dom.element('div', [], [content, nextContainer])
      dom.append(this.ccontainer, [nextLine])
      this.ccontainer = nextContainer
      this.depth++
      // when header is clicked, collapse/uncollapse container
      dom.addEventListener(content, 'click', (_event) => {
        nextContainer.toggleAttribute('hidden')
        triangleDown.toggleAttribute('hidden')
        triangleRight.toggleAttribute('hidden')
      })
    })
  }

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  groupCollapsed (args: Array<string|Symbol|Object|number>) {
    this.group(args, true)
  }

  groupEnd () {
    eventloop.enqueue(() => {
      if (this.depth > 0) {
        this.depth--
        // @ts-ignore
        this.ccontainer = this.ccontainer.parentElement.parentElement
      }
    })
  }

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  print (args: Array<string|Symbol|Object|number>) {
    eventloop.enqueue(() => {
      dom.append(this.ccontainer, [
        dom.element('div', [
          pair.Pair.create(
            'style',
            `${lineStyle};padding-left:${this.depth * 10}px`
          )
        ], _computeLineSpans(args))
      ])
    })
  }

  /**
   * @param {Error} err
   */
  printError (err: Error) {
    this.print([common.RED, common.BOLD, err.toString()])
  }

  /**
   * @param {string} url
   * @param {number} height
   */
  printImg (url: string, height: number) {
    eventloop.enqueue(() => {
      dom.append(this.ccontainer, [
        dom.element('img', [
          pair.Pair.create('src', url),
          pair.Pair.create('height', `${math.round(height * 1.5)}px`)
        ])
      ])
    })
  }

  /**
   * @param {Node} node
   */
  printDom (node: Node) {
    eventloop.enqueue(() => {
      dom.append(this.ccontainer, [node])
    })
  }

  destroy () {
    eventloop.enqueue(() => {
      vconsoles.delete(this)
    })
  }
}
/* c8 ignore stop */

/**
 * @param {Element} dom
 */
/* c8 ignore next */
export const createVConsole = (dom: Element) => new VConsole(dom)

/**
 * @param {string} moduleName
 * @return {function(...any):void}
 */
export const createModuleLogger = (moduleName: string) => common.createModuleLogger(print, moduleName)