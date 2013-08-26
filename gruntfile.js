
module.exports = function(grunt) {

    var _ = require('underscore');

    // Load required NPM tasks.
    // You must first run `npm install` in the project's root directory to get these dependencies.
    grunt.loadNpmTasks('grunt-contrib-coffee');


    // Parse config files
    var lumbarConfig = grunt.file.readJSON('lumbar.json');
    var packageConfig = grunt.file.readJSON('package.json');

    // This will eventually get passed to grunt.initConfig()
    // Initialize multitasks...
    var config = {
        uglify: {},
        clean: {}
    };

    // Combine certain configs for the "meta" template variable (<%= meta.whatever %>)
    config.meta = _.extend({}, packageConfig);

    // The "grunt" command with no arguments
    grunt.registerTask('default', ['coffee']);

    // Bare minimum for debugging
    grunt.registerTask('dev', ['coffee']);


    /* coffee script */
    // http://stackoverflow.com/questions/14148189/how-to-manage-and-concat-coffeescript-files-with-grunt-yeoman
    config.coffee = { };
    var i, modules = ['base', 'slickgrid', 'forms', 'editors'];
    for (i = 0; i < modules.length; i++) {
        var module = modules[i];
        config.coffee[module] = {files:
                                [{ expand: true, flatten: true, nonull: true,
                                  cwd: 'src/',
                                  src: [module + '/*.js.coffee'],
                                  dest: 'build/modules/' + module,
                                  ext: '.js' }]
                                }

        config.coffee[module + '_joined']
                              = { options: {  join: true },
                                  files:  {}
                                }
        config.coffee[module + '_joined'].files['build/modules/' + module + '.js'] = 'src/' + module + '/*.js.coffee'
    }
    config.coffee.backbone_edit = {
        options: { join: true },
        files:   [{
            expand: true,
            flatten: true,
            cwd: 'src',
            src: ['/**/*.coffee'],
            dest: 'build/',
            ext: '.js' }]
    }




    // create minified versions (*.min.js)
    config.uglify.modules = {
        options: {
            preserveComments: 'some' // keep comments starting with /*!
        },
        expand: true,
        src: 'build/out/fullcalendar.js', // only do it for fullcalendar.js
        ext: '.min.js'
    }

    config.clean.modules = 'build/out/*';







    // finally, give grunt the config object...
    grunt.initConfig(config);
};
