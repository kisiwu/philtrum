#! /usr/bin/env node

const pckg = require('../package'),
    Handlebars = require('handlebars'),
    fs = require('fs'),
    path = require('path'),
    program = require('commander');

var options = {
};

var helpers = {};

var templateFile,
    templateContent,
    output;

program
    .version(pckg.version)
    .usage('[options] <templateFile>')
    .description(pckg.description)
    .option('-i, --input <file>', 'Input file containing the substitution data', value => {
        return path.join("", value);
    })
    .option('-o, --output <file>', 'Ouput file', value => {
        return path.join("", value);
    })
    .option('--helpers <file>', 'File containing the helpers functions', value => {
        return path.join("", value);
    })
    .option('--engine <name>', 'Templating engine', value => {
        return value;
    })
    .option('--open', 'Used with output option to open the output file');



program.on('option:input', function (value) {
    options['input'] = path.resolve(value);
});

program.on('option:html', function (value) {
    options['html'] = path.resolve(value);
});

program.on('option:output', function (value) {
    options['output'] = path.resolve(value);
});

program.on('option:helpers', function (value) {
    options['helpers'] = path.resolve(value);
});

program.on('option:engine', function (value) {
    options['engine'] = value;
});

program.on('option:open', function () {
    options['open'] = true
});

program.parse(process.argv)

if (!(Array.isArray(program.args) && program.args.length)) {
    throw new Error("Missing one argument: template file");
}
templateFile = program.args[0];

if (!(fs.existsSync(templateFile) && !fs.statSync(templateFile).isDirectory())) {
    throw new Error(`Template file does not exists: ${templateFile}`);
}

if (options.helpers) {
    if (!(fs.existsSync(options.helpers) && !fs.statSync(options.helpers).isDirectory())) {
        throw new Error(`Helpers file does not exists: ${options.helpers}`);
    }
    helpers = require(options.helpers);
    Object.keys(helpers).forEach(name => {
        Handlebars.registerHelper(name, helpers[name]);
    });
}

if(options.engine){
    try {
        var templating = require('pug');
        templateContent = templating.renderFile(templateFile, {});
    } catch (e) {
		console.error(e);
        templateContent = fs.readFileSync(templateFile, { encoding: "utf8" });
    }
}
else {
    templateContent = fs.readFileSync(templateFile, { encoding: "utf8" });
}

output = options.input ? Handlebars.compile(templateContent)(require(options.input)) : Handlebars.compile(templateContent)({});

if (options.output) {
    fs.writeFile(options.output, output, {
        encoding: "utf8"
    }, (err) => {
        if (err) throw err;
        
        if(options.open){
            require('child_process').exec(`start "" "${options.output}"`);
        }
    });
}
else {
    console.log(output);
}