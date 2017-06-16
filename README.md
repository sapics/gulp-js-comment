# gulp-js-comment

How to use
```js
const jsComment = require('gulp-js-comment')

gulp.task('jscomment', function(){
	return gulp.src(srcFile)
		.pipe(
			jsComment({
				// Comment output path
				commentFile: String,

				// If true then append comment to commentFile,
				// else    then write comment to commentFile
				commentAppend: Boolean,

				// If true then strip comment
				strip: Boolean,
			})
		)
		.pipe(gulp.dest())
})
```
