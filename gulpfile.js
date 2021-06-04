/* Requiring necessary packages */
const { src, dest, parallel, series, watch } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync");
const changed = require("gulp-changed");
const concat = require("gulp-concat");
const cssnano = require("gulp-cssnano");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const sass = require("gulp-sass");
const del = require("del");

/* Setting base project constants */
const paths = {
  src: "./src/",
  dest: "./dist/",
};

/*
 * BASIC
 *
 * Tasks basicas e globais, direcionada a todos
 */

function clean() {
  return del(paths.dest, { force: true });
}

function html() {
  return src([paths.src + "*.html"])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(changed(paths.dest))
    .pipe(dest(paths.dest));
}

function images() {
  return src([
    paths.src + "img/*.jpg",
    paths.src + "img/*.gif",
    paths.src + "img/*.png",
    paths.src + "img/*.svg",
  ])
    .pipe(changed(paths.dest + "img"))
    .pipe(imagemin())
    .pipe(dest(paths.dest + "img"));
}

function css() {
  return src([paths.src + "scss/*.scss"])
    .pipe(changed(paths.dest))
    .pipe(
      sass({ includePaths: paths.src, outputStyle: "compressed" }).on(
        "error",
        sass.logError
      )
    )
    .pipe(autoprefixer())
    .pipe(cssnano({ zindex: false, reduceIdents: false }))
    .pipe(concat("style.css"))
    .pipe(dest(paths.dest));
}

function libsCss() {
  return src(["node_modules/normalize.css/normalize.css"])
    .pipe(changed(paths.dest + "css"))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(concat("libs.min.css"))
    .pipe(dest(paths.dest + "css"));
}

// BrowserSync
function browserSync() {
  browsersync({
    proxy: "http://localhost",
    browser: ["chrome"],
    port: 3010,
    notify: false,
    open: true,
  });
}

// BrowserSync reload
function browserReload() {
  return browsersync.reload;
}

// Watch files
function watchFiles() {
  // Watch SCSS changes
  watch(paths.src + "scss/*.scss", parallel(css)).on("change", browserReload());
  // Watch javascripts changes
  watch(paths.src + "*.html", parallel(html)).on("change", browserReload());
}

const watching = parallel(watchFiles, browserSync);

exports.css = css;
exports.html = html;
exports.default = series(clean, images, css, html, libsCss, watching);
exports.watch = watching;
