/**
 * Lightweight checker: scans frontend source for image filename references
 * and compares them to files present in `front-end/img`.
 *
 * Usage (from repo root):
 *  node frontend/scripts/check-images.js
 *
 * This is frontend-only and doesn't require the backend/dev server.
 */
const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..', '..')
const frontEndImgDir = path.join(repoRoot, 'front-end', 'img')
const srcDir = path.join(repoRoot, 'frontend', 'src')

function readAllFiles(dir, exts = null){
  const out = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries){
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...readAllFiles(full, exts))
    else {
      if (!exts || exts.includes(path.extname(e.name).toLowerCase())) out.push(full)
    }
  }
  return out
}

function gatherReferencedImageNames(){
  const exts = ['.png','.jpg','.jpeg','.svg','.webp','.gif']
  const files = readAllFiles(srcDir, ['.js','.jsx','.ts','.tsx','.json',''])
  const pattern = /['"`]([\w\-\s\(\)\[\]\.@]{1,200}?\.(?:png|jpg|jpeg|svg|webp|gif))['"`]/gi
  const names = new Set()
  for (const f of files){
    let text = ''
    try{ text = fs.readFileSync(f, 'utf8') }catch(e){ continue }
    let m
    while ((m = pattern.exec(text)) !== null){
      const name = m[1].trim()
      // ignore remote URLs
      if (name.startsWith('http')) continue
      // if path contains /img/ or front-end/img, keep only filename
      const parts = name.split(/[\\\/]+/)
      const filename = parts[parts.length-1]
      names.add(filename)
    }
  }
  return Array.from(names).sort()
}

function gatherFilesInPublic(){
  if (!fs.existsSync(frontEndImgDir)) return []
  const list = fs.readdirSync(frontEndImgDir).filter(f => {
    const stat = fs.statSync(path.join(frontEndImgDir,f))
    return stat.isFile()
  })
  return list.sort()
}

function main(){
  console.log('Scanning source for referenced images...')
  const refs = gatherReferencedImageNames()
  console.log(`Found ${refs.length} referenced image names (candidates).`)

  console.log('\nReading files from `front-end/img`...')
  const files = gatherFilesInPublic()
  console.log(`Found ${files.length} files in front-end/img.`)

  const missing = refs.filter(r => !files.includes(r))
  const unused = files.filter(f => !refs.includes(f))

  console.log('\n--- Report ---')
  console.log('\nReferenced & Present:')
  refs.filter(r => files.includes(r)).forEach(r => console.log('  ✔', r))

  console.log('\nReferenced & MISSING:')
  if (missing.length===0) console.log('  (none)')
  else missing.forEach(r => console.log('  ✖', r))

  console.log('\nFiles in `front-end/img` not referenced by source:')
  if (unused.length===0) console.log('  (none)')
  else unused.forEach(f => console.log('  •', f))

  console.log('\n--- End ---')
  if (missing.length>0) process.exitCode = 2
}

main()
