// The visualization taken from this link was adapted to work with the workbench
// http://www.cagrimmett.com/til/2016/04/26/responsive-d3-bar-chart.html

// When clicking on Download Visualization this function is called to apply all additional
// transformations on the svg before the visualization is downloaded
// All of the styles should be applied inline to the svg elements
// @return - If the visualization does not support downloading, then simply return false
//           if it does support, then return true
// NOTE: The download functionality requires that the visualization is in a svg AND the svg is
//       appended directly to the body
/* OVERWRITE */
revertCssFromSvg = function() {
    console.log("revertCssFromSvg");
}


// After the visualization image for the download has been created, this function is called
// to eventually revert some changes
/* OVERWRITE */
applyCssToSvg = function () {
    console.log("applyCssToSvg");
}


// The filtered datarows get passed to this function and it should filter the elements in
// the visualization
/* OVERWRITE */
// @param filteredDatarows - the datarows which are already filtered
applyFilter = function(filteredDatarows) {
    console.log("applyCssToSvg");

    // if there are no rows to filter,
    if(filteredDatarows.length === 0) {
        $("rect.bar").show();
        return;
    }

    // hide all bars
    $("rect.bar").hide();

    // go through the filteredDatarows and show all the matching bars
    filteredDatarows.forEach( (row) => {
        $(`[data-x-axis="${row[xIndex]}"][data-y-axis="${row[yIndex]}"]`).show();
    });
};

// will have to be used in different functions and will be set correctly when the drawVisualization is called
var xIndex = -1;
var yIndex = -1;

//Selection
var lastSelected = null;

// method for drawing the visualization
// the visualization is hosted in an iframe, thus the visualization should be written directly to the body
// @param datarows - an array with rows which should be displayed
// @param channelMappings - holds what column should be mapped to what channel, what the data type of
//                          column is, etc.
// @param visIndex - the index or ID of the visualization. Only needed for brushing
drawVisualization = function (datarows, channelMappings, visIndex) {
    /*REGISTRATION TO THE BRUSHING OBSERVER*/
    /* DO NOT REMOVE */
    brushingObserver.registerListener(visIndex, brushUpdateCallback);

    // TODO: Add your visualization code here
	var documents = Array.from(new Set(datarows.map(x=> x[0])));
	var select = d3.select('body')
	  	.append('select')
	  	.attr('id','dropdown')
	    .on('change',onchange)

	var options = select
	  .selectAll('option')
		.data(documents).enter()
		.append('option')
		.text(function (d) { return d; });

	function onchange() {
		
		selectValue = d3.select('select').property('value');
		d3.select("body").select("svg").remove();
	    drawDocumentCard(datarows, channelMappings, documents.indexOf(selectValue));
		
	};
	
    drawDocumentCard(datarows, channelMappings, 0);
};

function drawDocumentCard(datarows, channelMappings, docIndex){
	console.log(datarows);
    var margin = {top:10, right:10, bottom:90, left:10};
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight-20;
    var contentHeight = height - 65;
	
	/*let indexTerm = channelMappings.findIndex(elem => (elem.channel === "term"));
	let indexDoc = docIndex;
	let indexPage = channelMappings.findIndex(elem => (elem.channel === "page"));
	let indexImage = channelMappings.findIndex(elem => (elem.channel === "image"));
	let indexTf = channelMappings.findIndex(elem => (elem.channel === "tf"));
	let indexTfidf = channelMappings.findIndex(elem => (elem.channel === "tfidf"));
	let indexImageSize = channelMappings.findIndex(elem => (elem.channel === "image_size"));
	let indexKey = channelMappings.findIndex(elem => (elem.channel === "info_key"));
	let indexValue = channelMappings.findIndex(elem => (elem.channel === "info_value"));
	let documentName = datarows[0][indexDoc];*/
	
	let indexTerm = 1;
	let indexDoc = docIndex;
	let indexPage = 5;
	let indexImage = 2;
	let indexTf = 6;
	let indexTfidf = 7;
	let indexImageSize = 8;
	let indexKey = 3;
	let indexValue = 4;
	let documentName = datarows[0][indexDoc];
		
	//Extract
	const docMap = datarows.reduce(
	    (entryMap, e) => entryMap.set(e[indexDoc], [...entryMap.get(e[indexDoc])||[], e]),
	    new Map()
	);
	let firstPart = docMap.values().next().value
	//Get images from first document, filter null values (no image), order by size (max to min), select biggest size and get data
    let images_base = firstPart.filter(x => x[indexImage] != null).sort(function(x,y){return y[indexImageSize] - x[indexImageSize];}).filter(String)
	//let images = images_base.map(x => x[indexImage]).slice(0,2);
	var images =  firstPart.filter(x=> x[indexImage]).filter(String).map(y=> y[indexImage]);
	console.log("IMAGES_____________");
	console.log( images)
	//Get most important (tf) words of document
	let words = firstPart.filter(x => x[indexTerm] != null).sort(function(x,y){return y[indexTf] - x[indexTf];}).map(x => x[indexTerm]).filter(String)
	//Get meta data string of pdf doc
    let meta_data = firstPart.filter(x => x[indexKey] != null).map(x => x[indexKey] + ":" + x[indexValue]).join(", ");

	console.log("WORDS______________");
	console.log(words);
    
	
	
	var svg = d3.select("body")
			.append("svg")
			.attr("id", "main-svg")
			.attr("width", width)
			.attr("height", height);
				
    var title = svg.selectAll("text.title")
				.data([0])
				.enter()
				.append("text")
				.text(documentName)
				.attr("class", "title")
				.attr("x", width/2)
				.attr("font-size", "20")
				.attr("y", 20)
				.attr("text-anchor", "middle")
				.on('mouseover', function(d) {
					d3.select(this).style("cursor", "pointer"); 
				})
				.on('mouseout', function(d) {
					d3.select(this).style("cursor", "default"); 
				})
				.on("click", function(d, i){
					$('#info-text').html(meta_data);
					selectItem($(this));
				});

    //Trennlinien
    d3.select("#main-svg").append("line").attr("x1", 10).attr("x2", width-10).attr("y1", 30).attr("y2", 30).attr("stroke", "black");
    d3.select("#main-svg").append("line").attr("x1", 10).attr("x2", width-10).attr("y1", height-35).attr("y2", height-35).attr("stroke", "black");
	
	

	var img1 = svg.append("g").append("image")
		.attr("class", "img1")
	        .attr("width", width * .5) 
	        .attr("height", contentHeight * .25 ) 
	        .attr("y", (contentHeight * .75) )
	        .attr("x", 0)
	        .attr("xlink:href", "data:image/png;base64," + images[0])
        .on("click", function(d, i){
            printImageInfo(0, images_base, indexPage, indexImageSize);  
            selectItem($(this));
	    });
			
	var img2 = svg.append("g").append("image")
		.attr("class", "img2")
	        .attr("width", width * .5) 
	        .attr("height", contentHeight * .25 ) 
	        .attr("y", (contentHeight * .75) )
			.attr("x", width * .5)
	        .attr("xlink:href", "data:image/png;base64," + images[1])
        .on("click", function(d, i){
            printImageInfo(1, images_base, indexPage, indexImageSize);  
            selectItem($(this));
	    });
	
	var footer = svg.selectAll("text.footer")
	        .data([0])
	        .enter()
	        .append("text")
	        .text("Information: ")
		    .attr("id", "info-text")
		    .attr("class", "footer")
	        .attr("x", 10)
		    .attr("font-size", "12")
	        .attr("y", height - 15)
            .append("tspan").append("tspan");
			
	var wordcloud_data = [];
	for(let i = 0; i < words.length; i++){
		wordcloud_data.push({"text": words[i], "size": 10});
	}					
	
	svg.append("g")
		.attr("width", width)
		.attr("height", contentHeight * .65)
		.attr("y", 30)
		.attr("id", "wordcloud");
	
	d3.wordcloud()
		.size([width, contentHeight * .70])
		.selector('#wordcloud')
        .spiral("rectangular")
		.words(wordcloud_data)
		.onwordclick(function(d, i) {
          let tf = firstPart.filter(x => x[indexTerm] == d.text).map(x => x[indexTf])[0];
          let docs = firstPart.filter(x => x[indexTerm] == d.text).map(x => x[indexDoc]).join("; '");
		  let msg = "Term: '" + d.text + "', tf: " + tf + ", documents: " + docs;
		  $('#info-text').html(msg);
          //hacky selection, because the d object is not what we need.
          let item = $('#main-svg > svg text:contains("' + d.text + '")').first();
          selectItem(item);
		})
		.start();

        $('#wordcloud > svg').first().attr("y", 30);
	
		
	
}

function printImageInfo(index, images_base, indexPage, indexImageSize){
  console.log("Image number: " + index);
  let page = images_base.map(x => x[indexPage])[index];
  let fileSize = images_base.map(x => x[indexImageSize])[index];
  $('#info-text').html("Image from page: " + page +", size: " + (fileSize/1024).toFixed(0) + " kB");
}

function selectItem(item){

    if(lastSelected != null){
        lastSelected.removeClass("selectedText");
    }

  if (item.hasClass("selectedText") == false) {
    item.addClass("selectedText");
    lastSelected = item;
  } else {
    item.removeClass("selectedText");  
    lastSelected = null;  
  }  
}

// This is the callback function passed to the brushingObserver. Every time a selection happens in
// another visualization, this function gets called
function brushUpdateCallback(data) {
    console.log("brushUpdateCallback");
    let xAxisFieldName = gaChannelMappings[xIndex].label;

    if(data.length === 0 || data[0][xAxisFieldName] === undefined) {
        $(".bar.notselected").removeClass("notselected");
        return;
    }

    $(".bar").addClass("notselected");

    data.forEach((elem) => {
       $(`[data-x-axis="${elem[xAxisFieldName]}"]`).removeClass("notselected");
    });
}

