/* @flow */

import {
  extend,
  isDef,
  isUndef
} from 'shared/util'
import { updateVnodeToMP } from '../instance/index'

const ignoreKeys = ['_hid', '_fk', '_cid', '_batrs']

function isIgnoreKey (key) {
  return ignoreKeys.indexOf(key) > -1 ||
  /^_if_/.test(key)
}

function updateAttrs (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  const opts = vnode.componentOptions
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  let key, cur, old
  const oldAttrs = oldVnode.data.attrs || {}
  let attrs: any = vnode.data.attrs || {}
  const bindingAttrs = (attrs._batrs || '').split(',')
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs)
  }

  for (key in attrs) {
    if (isIgnoreKey(key)) {
      continue
    }
    cur = attrs[key]
    old = oldAttrs[key]

    // only update daynamic attrs in runtime
    if (old !== cur && (bindingAttrs.indexOf(key) > -1 || key === 'slot')) {
      // if using local image file, set path to the root
      if (vnode.tag === 'img' && key === 'src' && !/^\/|https?|data:/.test(cur)) {
        cur = `/${cur}`
      }
      updateVnodeToMP(vnode, key, cur)
    }
  }
}

export default {
  create: updateAttrs,
  update: updateAttrs
}
