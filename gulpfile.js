var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var globs = {
  css: ['./src/css/*.css'],
  favicons: ['./src/favicons/**'],
  fonts: ['./src/fonts/*.*'],
  imgs: ['./src/img/**'],
  layout: ['./src/layout/*.html'],
  partials: ['./src/partials/*.html'],
  views: ['./src/views/*.html']
};
var outputDir = './dist';

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end');
}

var pages = require('./pages.json').pages;
gulp.task('views_incude', function () {
  var wrap = require('gulp-wrap');
  var include = require('gulp-file-include');

  return gulp.src(globs.views)
    .pipe(wrap({ src: 'src/layout/_default.html' }))
    .pipe(include({
      prefix: '@@',
      basepath: '@file',
      indent: true
    }))
    .on('error', handleErrors)
    .pipe(gulp.dest('./tmp'))
    .pipe(reload({ stream: true }));
});
gulp.task('views', ['views_incude'], function () {
  var rename = require('gulp-rename');
  var handlebars = require('gulp-compile-handlebars');

  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var filename = page.filename;
    gulp.src('./tmp/' + filename)
      .pipe(handlebars(page))
      .pipe(gulp.dest(outputDir))
      .pipe(reload({ stream: true }));
  }
});

gulp.task('css', function () {
    var postcss    = require('gulp-postcss');
    var sourcemaps = require('gulp-sourcemaps');

    var cssImport = require('postcss-import');
    var cssnext = require('postcss-cssnext');
    var mqpacker = require('css-mqpacker');

    var processors = [
      cssImport,
      cssnext,
      mqpacker
    ];

    return gulp.src('src/css/master.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(outputDir))
        .pipe(reload({stream:true}));
});

gulp.task('img', function () {
  var imagemin = require('gulp-imagemin');

  return gulp.src(globs.imgs)
    .pipe(imagemin())
    .pipe(gulp.dest(outputDir + '/img'));
});

gulp.task('fonts', function () {
  return gulp.src(globs.fonts)
    .pipe(gulp.dest(outputDir + '/fonts'));
});

gulp.task('favicons', function () {
  return gulp.src(globs.favicons)
    .pipe(gulp.dest(outputDir));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: outputDir
        },
        notify: false
    });
});

gulp.task('watch', ['browser-sync'] ,function() {
  var html = globs.views.concat(globs.partials);
  html = html.concat(globs.layout);
  gulp.watch(html, ['views']);
  gulp.watch(globs.css, ['css']);
  gulp.watch(globs.img, ['img']);
});

gulp.task('default', ['favicons', 'views', 'css', 'img', 'fonts', 'watch']);