import split from 'lodash/split'
import includes from 'lodash/includes'

// check if str1 contains any character of str2
export function Contains(str1, str2) {
  let success = {}
  try {
    split(str1, '').forEach(function (el) {
      if (includes(str2, el)) throw success
    })
  } catch (e) {
    if (e === success) return true
  }

  return false
}

// extract json from response
export function ExtractJson(response) {
  if (response && response.headers) {
    const contentType = response.headers['content-type']
    if (contentType && contentType.indexOf('application/json') !== -1) {
      // is json
      return response.data
    }
  }

  return null
}

export function AfterDays(days) {
  let d = new Date();
  d.setDate(d.getDate() + days);
  return d
}
