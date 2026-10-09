// 基于 MDN 的 docCookies 封装，提供同步读写 document.cookie 的能力
// Login.tsx 通过它读取服务端登录后下发的 sessionId / name
const docCookies = {
  getItem(sKey: string): string | null {
    if (!sKey) return null
    const escaped = encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&')
    const match = document.cookie.match(
      new RegExp('(?:^|;)\\s*' + escaped + '\\s*=\\s*([^;]*)')
    )
    return match ? decodeURIComponent(match[1]) : null
  },
  setItem(
    sKey: string,
    sValue: string,
    vEnd?: number | string | Date,
    sPath?: string,
    sDomain?: string,
    bSecure?: boolean
  ): boolean {
    if (!sKey || /^(?:expires|max-age|path|domain|secure)$/i.test(sKey)) {
      return false
    }
    let sExpires = ''
    if (vEnd instanceof Date) {
      sExpires = '; expires=' + vEnd.toUTCString()
    } else if (typeof vEnd === 'number') {
      sExpires =
        vEnd === Infinity
          ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
          : '; max-age=' + vEnd
    } else if (typeof vEnd === 'string') {
      sExpires = '; expires=' + vEnd
    }
    document.cookie =
      encodeURIComponent(sKey) +
      '=' +
      encodeURIComponent(sValue) +
      sExpires +
      (sDomain ? '; domain=' + sDomain : '') +
      (sPath ? '; path=' + sPath : '') +
      (bSecure ? '; secure' : '')
    return true
  },
  removeItem(sKey: string, sPath?: string, sDomain?: string): boolean {
    if (!this.hasItem(sKey)) return false
    document.cookie =
      encodeURIComponent(sKey) +
      '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
      (sDomain ? '; domain=' + sDomain : '') +
      (sPath ? '; path=' + sPath : '')
    return true
  },
  hasItem(sKey: string): boolean {
    if (!sKey) return false
    return new RegExp(
      '(?:^|;)\\s*' +
        encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&') +
        '\\s*='
    ).test(document.cookie)
  },
  keys(): string[] {
    return document.cookie
      .split(/\s*;\s*/)
      .filter(Boolean)
      .map((pair) => decodeURIComponent(pair.split('=')[0]))
  },
}

export default docCookies
