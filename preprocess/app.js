/*
    nodejs app to pre-process extracted text data from pdf
*/

//arg0 = node, arg1 = js file, arg2.. = arguments
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' <PATH_DIRS>');
  process.exit(1);
}

//Variables
var path = process.argv[2];
var fs = require('fs');
var TEXTFILE = "data.txt";
var INFOFILE = "info.txt";
var natural = require('natural');
var outFile = "visualizer.csv";
var csvSep = ";";
var lineSep = "\r\n";

var fileNames = [];
var tfs = [];
var images = [];
var rows = [];
var words = [];
var meta_datas = [];

fs.readdirSync(path).forEach(item => {
	let dir = path + item;
	if(fs.lstatSync(dir).isDirectory()){
		var realFileName = item + ".pdf";
		console.log(realFileName);

		//Logic
		var words_current = transformText(dir);
		var images_current = transformImages(dir);
		var meta_data = readPdfInfoFileAsDict(dir + "/" + INFOFILE);
		console.log(meta_data);

		//Output
		console.log("Found images: " + images_current.length);
		console.log("Found words: " + words_current.length);

		var tfs_current = getTfWordCount(words_current);
		console.log("Found unique words: " + tfs_current.length);

		var rows_current = createCsvRows(tfs_current, images_current, realFileName, meta_data);

		images.push(...images_current);
		tfs.push(...tfs_current);
		rows.push(...rows_current);
		words.push({src: realFileName, data: words_current});
		fileNames.push(realFileName);
		meta_datas.push(meta_data);
	}
});

console.log("#######################################");
console.log("Found images total: " + images.length);
console.log("Found unique words total: " + tfs.length);


//Calculate TF-IDF
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();
for(let i = 0; i < words.length; i++){
	let data = words[i].data;
	tfidf.addDocument(data);
}

//Calc & Update row fields with TF-IDF value
for(let i = 0; i < words.length; i++){
	let data = words[i].data;
	data.forEach(value => {
		tfidf.tfidfs(value, function(index, measure) {
		    let fileName = fileNames[index];
		    //console.log('value ' + value + ' document #' + index + ' is ' + measure);
		    let row = rows.filter(x => x[0] == fileName && x[2] == value)[0];
		    if(row != undefined)
		    	row[4] = measure;		//index 4 is tfidf column
		});		
	});
}


var csvHeader = createCsvHeader();
var csvRows = createCsvContent(rows);

console.log("Writing final csv file: " + outFile);
fs.writeFileSync(outFile, (csvHeader + csvRows));


//------FUNCTIONS------------------------

//Returns an array of stemmed work tokens
function transformText(dir) {
    let result = [];
    fs.readdirSync(dir).forEach(file => {  
        if(file == TEXTFILE){
            let filename = (dir + "/" + file);
            console.log("Processing file: " + filename);

            let data = fs.readFileSync(filename, 'utf8');
            natural.LancasterStemmer.attach();
            result = data.tokenizeAndStem();
	    //result = Array.from(new Set(tokens)); //unique items
        }
    });
    return result;
}

//Returns an array of Image info objects {src, page, data, file_size}: base64 encoded image data
function transformImages(dir) {
    let result = [];
    fs.readdirSync(dir).forEach(file => {
        if(file.endsWith(".png")){
            let filename = (dir + "/" + file);
            console.log("Processing file: " + filename);
            let imageInfo = {};
	        let page = Number(file.split("-")[1]);
	        //console.log("found page: " + page + " for file: " + file);
	        imageInfo.src = file;
            imageInfo.page = page;
            imageInfo.data = base64_encode(filename);
	        imageInfo.file_size = fs.statSync(filename).size;
            //console.log(imageInfo.data);
            result.push(imageInfo);
        }
    });
    return result;
}

//Returns the file data as base64 encoded string
function base64_encode(file) {
    // read binary data
    let bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

//Returns an array ofobjects {term, tf} with unique words as term and their count as tf.
function getTfWordCount(words){
  let result = [];
  let uniqueWords = Array.from(new Set(words));
  for(let i = 0; i < uniqueWords.length; i++){
	let word = uniqueWords[i];
  	let count = words.filter(x => x == word).length;
	let entry = {};
	entry.term = word;
	entry.tf = count;
	result.push(entry);
  }
  return result;	
}

function createCsvHeader(){
	let headerArray = ["document", "page", "term", "tf", "tfidf", "image", "image_size", "key", "value"];
	let csvHeader = headerArray.join(csvSep) + lineSep;
	return csvHeader;
}

function createCsvRows(tfs, images, originalFileName, meta_data){
	let fileName = originalFileName;
	let rows = [];
	//build lines for words
	for(let i = 0; i < tfs.length; i++){
		let entry = tfs[i];
		//console.log(entry.word + " : " + entry.tf);
		rows.push([fileName, null, entry.term, entry.tf, null, null, null, null, null, null]);
	}
	//build lines for meta information
	for(let i = 0; i < meta_data.length; i++){
		let entry = meta_data[i];
		//console.log(entry.word + " : " + entry.tf);
		rows.push([fileName, null, null, null, null, null, null, null, entry.key, entry.value]);
	}
	//build lines for images
	for(let i = 0; i < images.length; i++){
		let img = images[i];
		rows.push([fileName, img.page, null, null, null, img.data, null, img.file_size, null, null]);
	}
	return rows;
}

//Joins all the rows together, with specified separator
function createCsvContent(rows){

	let csvContent = "";

	//Create lines and add to csv string
	rows.forEach(function(rowArray){
	   let row = rowArray.join(csvSep);
	   csvContent += (row + lineSep);
	});

	return csvContent;
}

function readPdfInfoFileAsDict(path){
    let result = [];
    //This will read the whole file at once, no problem for small files
    fs.readFileSync(path).toString().split(/\r?\n/).forEach(function(line){
	//console.log(line);
	if(line != ""){
      		let tmp = line.split(":");
      		result.push({key: tmp[0].trim(), value: tmp[1].trim()});
	}
    })
    return result;
}
