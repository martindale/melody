// hacks abound!
jade.attr = function(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + jade.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};
jade.cls = function() { return ' F$%@'; }
