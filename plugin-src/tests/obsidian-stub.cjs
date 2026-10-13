const moment = require('moment');
class TFolder { constructor(path=''){this.path=path;} isRoot(){return !this.path;} }
class TFile { constructor(path,content=''){this.path=path;this.basename=path.split("/").pop().replace(/\.md$/, "");this.content=content;} }
class Notice { constructor(message){Notice.messages.push(message);} }
Notice.messages=[];
module.exports={moment, TFolder,TFile,Notice,normalizePath:path=>path.replace(/\\/g,'/').replace(/\/+/g,'/').replace(/^\//,'').replace(/\/$/,'')};
