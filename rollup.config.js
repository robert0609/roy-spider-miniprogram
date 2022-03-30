var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var babel = require("rollup-plugin-babel");
var { terser } = require('rollup-plugin-terser');
var pkg = require('./package.json');
var dependencies = pkg.dependencies;
var externalDependencies = dependencies ? Object.keys(dependencies) : [];


var extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];

var config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
      name: 'spider'
    },{
      file: pkg.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    resolve({ extensions }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      extensions,
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ],
  external: function (moduleName) {
    return externalDependencies.some(item => moduleName.startsWith(item));
  }
};
if (process.env.NODE_ENV === 'production') {
  config.output.forEach(c => {
    c.sourcemap = false;
  });
  config.plugins.push(terser());
}

module.exports = config;
