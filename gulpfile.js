var gulp = require('gulp'),
jsValidate = require('gulp-jsvalidate'),
watch = require('gulp-watch'),
postcss = require('gulp-postcss'),
nested = require('postcss-nested'),
autoprefixer = require('autoprefixer'),
browserSync = require('browser-sync').create();

gulp.task('default', () =>
	gulp.src('./assets/scripts/custom.js')
		.pipe(jsValidate())
);

gulp.task('html', function(){
    return gulp.src('./assets/index.html')    
    .pipe(gulp.dest('./docs'));	
});

gulp.task('img', function(){
	return gulp.src('./assets/img/*')
	.on('error', function(errorInfo){
	       	   console.log(errorInfo.toString());               
	       })    
    .pipe(gulp.dest('./docs/img'));
});

gulp.task('styles', function() {
	
	return gulp.src('./assets/styles/custom.css')
	.pipe(postcss([nested, autoprefixer]))
	.on('error', function(errorInfo){
	       	   console.log(errorInfo.toString());
               this.emit('end');
	       })
	.pipe(gulp.dest('./docs/styles'));
	
});

gulp.task('scripts', function() {
	
	return gulp.src('./assets/scripts/custom.js')	
	.pipe(gulp.dest('./docs/scripts'));
	
});


gulp.task('cssInject', ['styles'], function(){
	return gulp.src('./docs/styles/custom.css')
	.pipe(browserSync.stream());
});

gulp.task('scriptsRefresh', ['scripts'], function(){
	browserSync.reload();
});


gulp.task('watch', function(){
	
	browserSync.init({
		notify: false,
		server: {
			baseDir: "docs"
		}
	});

	watch('./assets/index.html', function(){
		gulp.start('html');
	});

	watch('./assets/img/*', function(){
		gulp.start('img');
	});
		
	watch('./docs/index.html', function(){
		browserSync.reload();
	});
	
	watch('./assets/styles/custom.css', function(){
		gulp.start('cssInject');
	});

	watch('./assets/scripts/custom.js', function(){
		gulp.start('scriptsRefresh');
	})
	
});

