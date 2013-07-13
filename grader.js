#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/ atOBtributes.
Uses commander.js and cheerio. Teaches command lne application development and basic DOM parsing.
*/

var fs      = require ('fs');
var program = require ('commander');
var cheerio = require ('cheerio');
var rest    = require ('restler');


var HTML_FILE_DEFAULT = "index.html";
var CHECKLIST_FILE_DEFAULT = "checks.json";


var assertFileExists = function (infile) {
    var instr = infile.toString();
    if (!fs.existsSync (instr)) {
	console.log ("%s does not exist. Exiting.", instr);
	process.exit (1);
    }

    return instr;
};


var cheerioHtmlFile = function (htmlFile) {
    return cheerio.load (fs.readFileSync (htmlFile));
};



var loadChecks = function (checksFile) {
    return JSON.parse (fs.readFileSync (checksFile));
};



var checkHtmlFile = function (htmlFile, checksFile) {
    $ = cheerioHtmlFile (htmlFile);
    var checks = loadChecks (checksFile).sort();

    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out [ checks[ii] ] = present;
    }

    return out;
};


var checkUrl = function (url, checksFile) {
    rest.get (url).on ('complete', function (result) {
	$ = cheerio.load (result);
	var checks = loadChecks (checksFile).sort();

	var out = {};
	for (var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out [ checks[ii] ] = present;
	}

	var outJson = JSON.stringify (out, null, 4);
	console.log (outJson);
    });

}


var clone = function (fn) {
    // Workaround for commander.js issue
    // http://stackoverflow.com/a/6772648
    return fn.bind ( {} );
};


if (require.main == module) {
    program
	.option ('-c, --checks <check_file>',
		 'Path to checks.json',
		 clone(assertFileExists),
		 CHECKLIST_FILE_DEFAULT)
	.option ('-f, --file <html_file>',
		 'Path to index.html',
		 clone(assertFileExists), 
		 HTML_FILE_DEFAULT)
	.option ('-u, --url <url>',
		 'URL for the page to check')
	.parse (process.argv);


    if (!program.url) {
	// File based checking
	var checkJson = checkHtmlFile (program.file, program.checks);
	var outJson = JSON.stringify (checkJson, null, 4);
	console.log (outJson);
    }
    else {
	checkUrl (program.url, program.checks);

    }

}
else {
    exports.checkHtmlFile = checkHtmlFile;
}


    
