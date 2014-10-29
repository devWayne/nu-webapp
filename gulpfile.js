var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')(); // Load all gulp plugins
                                              // automatically and attach
var less = require('gulp-less');
var jade = require('gulp-jade');
var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355
var template = require('lodash').template;

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

var _browserify = require('browserify');
var source = require('vinyl-source-stream');
var _ = require('lodash');


var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var browserify = function(opt) {
    return _browserify(_.extend({
        bundleExternal: false
    }, opt));
};


gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        template('<%= archive %>', dirs),
        template('<%= dist %>', dirs),
	template('<%= src %>/js',dirs),
	template('<%= src %>/css',dirs)
    ], done);
});

gulp.task('copy', [
	'copy:misc'
]);

gulp.task('compile',[
	'compile:less',
	'concat:js'
]);


gulp.task('concat:js', function() {
  return gulp.src(template('<%= src %>/javascript/*/**', dirs))
    .pipe(concat('index.js'))
    .pipe(uglify())
    .pipe(gulp.dest(template('<%= src %>/js',dirs)))
});



gulp.task('compile:less', function () {

    var banner = '/*! template v' + pkg.version +' */\n\n';

    return gulp.src(template('<%= src %>/less/*.less', dirs))
               .pipe(less())
               .pipe(plugins.header(banner))
               .pipe(gulp.dest(template('<%= src %>/css', dirs)));

});


gulp.task('copy:misc', function () {
    return gulp.src([
        template('<%= src %>/*/**', dirs),
        // Exclude the following files
        // (other tasks will handle the copying of these files)
        template('!<%= src %>/less/*.less', dirs),
        template('!<%= src %>/javascript/**/*', dirs),

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(template('<%= dist %>', dirs)));
});


gulp.task('jshint', function () {
    return gulp.src([
        'gulpfile.js',
        template('<%= src %>/js/*.js', dirs)
    ]).pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('watch', function () {
    gulp.watch([template('<%= src %>/less/*', dirs)], ['compile:less']);
});


// -----------------------------------------------------------------------------
// | Main tasks                                                                |
// -----------------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean'],
	'compile',
        'copy',
    done);
});

gulp.task('default', ['build']);
