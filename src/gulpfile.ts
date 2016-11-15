
import * as Gulp from "gulp"
import * as GulpTypescript from "gulp-typescript"
import * as Merge from "merge2"

let TsProject = GulpTypescript.createProject("tsconfig.json")

Gulp.task("compile", () => {
    var res = TsProject.src()
        .pipe(TsProject())

    return Merge([
        res.js.pipe(Gulp.dest("lib")),
        res.dts.pipe(Gulp.dest("types"))
    ])
})

Gulp.task("watch", () => {
    return Gulp.watch("src/**/*",["compile"])
})

Gulp.task("default", [ "compile" ])
