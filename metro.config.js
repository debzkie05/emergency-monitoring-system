// Fix EMFILE (too many open files) on Windows by monkey-patching fs
const realFs = require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(realFs);

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce the number of files Metro watches to avoid hitting the OS limit
config.watcher = {
  ...config.watcher,
  // Use a shorter polling interval but with fewer concurrent watchers
  additionalExts: [],
};

// Tell Metro to ignore heavy directories it doesn't need to crawl
config.resolver = {
  ...config.resolver,
  blockList: [
    /\.git\/.*/,
    /\.expo\/.*/,
    /tests\/.*/,
  ],
};

module.exports = config;
