var gulp = require("gulp");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var plumber = require("gulp-plumber");
var server = require("browser-sync");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require('gulp-svgstore');
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var webp = require("gulp-cwebp");
var minhtml = require("gulp-htmlmin");
var uglify = require("gulp-uglify-es").default;

gulp.task('webp', (done) => {
  gulp.src('src/img/**/*.{png, jpg}')
  .pipe(webp ())
  .pipe(gulp.dest('build/img'));
  done();
});

gulp.task('style', (done) => {
  gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
    done()
});

gulp.task('clean', () => {
  return del('build');
});

gulp.task('copy', () => {
  return gulp.src([
    'src/fonts/**/*',
    'src/img/**',
  ], {
    base: 'src'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('html', () => {
  return gulp.src('src/*.html')
  .pipe(posthtml([
    include()
  ]))
  .pipe(minhtml({ collapseWhitespace: true}))
  .pipe(gulp.dest('build'))
  .pipe(server.stream());
});

gulp.task('images', () => {
  return gulp.src('src/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest('src/img'));
});

gulp.task('sprite', () => {
  return gulp.src('build/img/icons/icon-*.svg')
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img/icons'));
});

gulp.task('scripts', () => {
  return gulp.src('src/js/**/*.js')
  .pipe(rename('bundle.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('build/js'));
});

gulp.task('build', gulp.series (
  'clean',
  'copy',
  'style',
  'scripts',
  'images',
  'sprite',
  'webp',
  'html',
));

gulp.task('serve', () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('src/scss/**/*.scss', gulp.series('style'));
  gulp.watch('src/*.html', gulp.series('html'));
  gulp.watch('src/js/**/*.js', gulp.series('scripts'));
});
