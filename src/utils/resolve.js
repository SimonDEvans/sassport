import find from 'lodash/collection/find';
import flatten from 'lodash/array/flatten';
import path from 'path';
import mkdirp from 'mkdirp';
import { ncp } from 'ncp';
import fs from 'fs';

class SassQueued {
  constructor(loadPath, absPath, source) {
    this.loadPath = loadPath;
    this.absPath = absPath;
    this.source = source;
  }
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch(e) {
    if (e.code === 'ENOENT') {
      return false;
    }
  }
}

export default function resolve(rootPath, filePath) {
  const exts  = ['.scss', '.sass', '.css'];
  const indexFileNames = ['/index', '/_index'];
  const fullExts = exts.concat(
    flatten(exts.map(ext => indexFileNames
      .map(iExt => iExt + ext))));

  let filename = path.join(rootPath, filePath);
  let resolved = [];
  let base = path.dirname(filePath);
  let name = path.basename(filePath);

  // create full path (maybe relative)
  let relPath = path.join(base, name);
  let absPath = path.join(rootPath, relPath);

  let rawResolve = new SassQueued(relPath, absPath, 0);

  if (fileExists(absPath)) {
    resolved.push(new SassQueued(relPath, absPath, 0));
  }

  // next test variation with underscore
  relPath = path.join(base, `_${name}`);
  absPath = path.join(rootPath, relPath);

  if (fileExists(absPath)) {
    resolved.push(new SassQueued(relPath, absPath, 0));
  }

  // next test fullExts plus underscore
  exts.forEach((ext) => {
    relPath = path.join(base, `_${name}${ext}`);
    absPath = path.join(rootPath, relPath);

    if (fileExists(absPath)) {
      resolved.push(new SassQueued(relPath, absPath, 0));
    }
  });

  // next test plain name with fullExts
  fullExts.forEach((ext) => {
    relPath = path.join(base, `${name}${ext}`);
    absPath = path.join(rootPath, relPath);

    if (fileExists(absPath)) {
      resolved.push(new SassQueued(relPath, absPath, 0));
    }
  });

  if (!resolved.length) {
    resolved.push(rawResolve);
  }

  return resolved;
}