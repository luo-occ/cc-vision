function readPackage(pkg, context) {
  // Fix peer dependency issues
  if (pkg.name === '@tanstack/react-query') {
    pkg.peerDependencies = {
      ...pkg.peerDependencies,
      'react': '>=16.8.0'
    }
  }
  
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
