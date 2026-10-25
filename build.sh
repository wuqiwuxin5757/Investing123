#!/bin/bash
# assemble the single-file film
cd "$(dirname "$0")"
{
  cat src/head.html
  echo '<script>'
  echo '"use strict";'
  for f in src/core.js src/script.js src/audio.js $(ls src/scenes_*.js | sort) src/player.js; do echo "// ==== $f"; cat "$f"; echo; done
  echo '</script>'
} > interest.html
node -e "
const s=require('fs').readFileSync('interest.html','utf8');const js=s.slice(s.indexOf('<script>')+8,s.lastIndexOf('</script>'));
try{new Function(js);console.log('syntax ok', (s.length/1024).toFixed(1)+'KB')}catch(e){console.log('SYNTAX', e.message)}"
