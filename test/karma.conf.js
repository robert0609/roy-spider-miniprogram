var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var typescript = require('rollup-plugin-typescript2');

// Karma configuration
// Generated on Mon Jun 19 2017 14:45:37 GMT+0800 (中国标准时间)
module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'chai'],
		// list of files / patterns to load in the browser
		files: [
			'unit/**/*.test.ts'
		],
		// list of files to exclude
		exclude: [
		],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'unit/**/*.test.ts': ['rollup']
    },
		rollupPreprocessor: {
			/**
			 * This is just a normal Rollup config object,
			 * except that `input` is handled for you.
			 */
			output: {
				format: 'iife', // Helps prevent naming collisions.
				name: 'bundle_test', // Required for 'iife' format.
				sourcemap: 'inline', // Sensible for testing.
			},
      plugins: [
        resolve({
          extensions: [
            '.js', '.jsx', '.ts', '.tsx',
          ]
        }),
        commonjs({
          include: 'node_modules/**',
          namedExports: {
            'mockjs': [
              'mock'
            ]
          }
        }),
        typescript({
          tsconfig: './test/tsconfig.json',
          tsconfigOverride: {
            compilerOptions: {
              declaration: false,
              declarationMap: false
            }
          }
        })
      ]
		},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress', 'coverage'],
		coverageReporter: {
			type: 'html',
			dir: 'coverage/'
		},
		// web server port
		port: 9876,
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,
		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,
		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity,
    // Fail on failing test suite
    failOnFailingTestSuite: true
	})
}
