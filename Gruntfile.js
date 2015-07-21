module.exports = function(grunt) {
    grunt.initConfig({
    	jshint: {
    		src: 'src/fDatepicker-Ex.js'
    	},

    	copy: {
    		main: {
    			src: 'src/fDatepicker-Ex.js',
    			dest: 'dist/fDatepicker-Ex.js'
    		}
    	},

    	uglify: {
    		file: {
    			src: 'src/fDatepicker-Ex.js',
    			dest: 'dist/fDatepicker-Ex.min.js'
    		}
    	},

	    less: {
            file: {
			    src: 'src/fDatepicker-Ex.less',
				dest: 'dist/fDatepicker-Ex.css'
     	    }
	    }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('js', ['copy', 'uglify']);
	grunt.registerTask('css', ['less']);
    grunt.registerTask('default', ['js', 'css']);
}
