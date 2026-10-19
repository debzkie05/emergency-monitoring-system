import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const parentURL = context.parentURL;
    if (parentURL && parentURL.startsWith('file:')) {
      const parentDir = path.dirname(fileURLToPath(parentURL));
      const targetPath = path.resolve(parentDir, specifier);
      if (!fs.existsSync(targetPath) && fs.existsSync(targetPath + '.ts')) {
        return nextResolve(pathToFileURL(targetPath + '.ts').href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
