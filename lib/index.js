const Shell         = require('shelljs');
const Webpack       = require('webpack');
const BoiUtils      = require('boi-utils');
const BoiTranspiler = require('boi-transpiler');
const BoiAuxInstall = require('boi-aux-autoinstall');
/**
 * @module boi/compiler
 * @param {Object}  configuration configuration of boi
 * @param {boolean} isInstallDeps whether install dependencies before execution
 */
module.exports = function (configuration, isInstallDeps) {
  const {
    webpackConf: WebpackConf,
    dependencies: Dependencies
  } = BoiTranspiler(configuration,isInstallDeps);
  const OutputPath = WebpackConf.output.path;
  // clean output directory before compile
  Shell.rm('-rf', OutputPath);

  // install dependencies before build
  BoiAuxInstall(isInstallDeps, Dependencies).then(() => {
    BoiUtils.log.loading(new Promise((resolve, reject) => {
      Webpack(WebpackConf).run((err, stats) => {
        if (err) {
          reject(err);
        }
        if (stats.hasErrors()) {
          reject(stats.toJson().errors);
        }
        resolve({
          msg: 'Compile succeed',
          data: stats
        });
      });
    }), 'Compiling...', stats => {
      // print compile result
      process.stdout.write(stats.toString({
        assets: true,
        colors: true,
        modules: false,
        performance: true,
        timings: true,
        warning: true,
        moduleTrace: true,
        children: false,
        chunks: false,
        errors: true,
        hash: false,
        chunkModules: false,
        version: false
      }) + '\n');
    });
  }).catch(err => {
    throw new Error(err);
  });
};