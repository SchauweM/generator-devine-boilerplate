'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

var fs = require('fs');

var spawn = require('child_process').spawnSync;
var exec = require('child_process').execSync;

module.exports = yeoman.generators.Base.extend({

  prompting: function(){

    var done = this.async();

    var default_author = exec('npm config get init.author.name', {encoding: 'utf-8'}) || '';

    if(default_author.indexOf('\n') !== -1){
      default_author = default_author.split('\n')[0];
    }

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the splendid ' + chalk.red('Devine Project') + ' generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'projectname',
        message: 'Your project name',
        default: process.cwd().split(path.sep).pop()
      },{
        type: 'input',
        name: 'author',
        message: 'Your name',
        default: default_author
      },{
        type: 'confirm',
        name: 'node',
        message: 'Do you need a Node server? (Yes)',
        default: true
      },{
        type: 'confirm',
        name: 'git',
        message: 'init an empty git repository? (Yes)',
        default: true
      }
    ];

    this.prompt(prompts, function(props){

      this.props = props;

      for(var prop in this.props){
        this[prop] = this.props[prop];
      }
      this.year = new Date().getFullYear();

      done();

    }.bind(this));

  },

  _copy: function(file){
    this.fs.copyTpl(
      this.templatePath(file),
      this.destinationPath(file),
      this
    );
  },

  writing: {

    app: function(){

      var files = [
        '_hbs/helloworld.hbs',
        '_js/script.js', '_js/helpers/util.js',
        '_scss/style.scss', '_scss/_reset.scss', '_scss/_mixins.scss',
      ];

      fs.mkdir('./_helpers');

      if(!this.node){

        files.push('index.html');

        this.fs.copyTpl(
          this.templatePath('helpers/uppercase.js'),
          this.destinationPath('_helpers/uppercase.js'),
          this
        );

      }else{

        files.push('server.js', 'routes/index.js',
          'routes/static.js', 'routes/_api.js', 'routes/_views.js',
          'templates/hello.hbs', 'helpers/uppercase.js');

        fs.mkdir('./modules');

        this.fs.copyTpl(
          this.templatePath('index.html'),
          this.destinationPath('public/index.html'),
          this
        );

      }

      for(var i = 0; i < files.length; i++){
        this._copy(files[i]);
      }

    },

    projectfiles: function(){

      var files = [
        '.babelrc', '.editorconfig',
        '.eslintrc',
        '_config.js', 'webpack.config.js',
        'package.json', 'gulpfile.js',
        'README.md', 'LICENSE'
      ];


      if(this.node){
        files.push('nodemon.json', 'Procfile', '.env', '.slugignore');
      }

      for(var i = 0; i < files.length; i++){
        this._copy(files[i]);
      }

      this.fs.copyTpl(
        this.templatePath('_gitignore'),
        this.destinationPath('.gitignore'),
        this
      );



    }

  },

  install: function(){

    if(this.git){
      spawn('git', ['init'], { stdio: 'inherit' });
    }

    spawn('npm', ['install'], { stdio: 'inherit' });

    spawn('webpack', { stdio: 'inherit' });

    if(this.git){
      spawn('git', ['add', '.'], { stdio: 'inherit' });
      spawn('git', ['commit', '-m', '"initial commit"'], { stdio: 'inherit' });
    }

    spawn('npm', ['run', 'development'], { stdio: 'inherit' });

  }

});
