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
    var margin = {top:10, right:10, bottom:90, left:10};
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;
     
    	let indexTerm = channelMappings.findIndex(elem => (elem.channel === "term"));
	let indexDoc = channelMappings.findIndex(elem => (elem.channel === "document"));
	let indexPage = channelMappings.findIndex(elem => (elem.channel === "page"));
	let indexImage = channelMappings.findIndex(elem => (elem.channel === "image"));
	let indexTf = channelMappings.findIndex(elem => (elem.channel === "tf"));
	let indexTfidf = channelMappings.findIndex(elem => (elem.channel === "tfidf"));
	let indexImageSize = channelMappings.findIndex(elem => (elem.channel === "image_size"));

	let documentName = datarows[0][indexDoc];

	//Extract
	const docMap = datarows.reduce(
	    (entryMap, e) => entryMap.set(e[indexDoc], [...entryMap.get(e[indexDoc])||[], e]),
	    new Map()
	);

	console.log(docMap);
	console.log("Found number of pdf files: " + docMap.size);

	let firstPart = docMap.values().next().value
	//Get images from first document, filter null values (no image), order by size (max to min), select biggest size and get data
	let image1 = firstPart.filter(x => x[indexImage] != null).sort(function(x,y){return y[indexImageSize] - x[indexImageSize];})[0][indexImage];
	console.log(image1);
    
	var svg = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);
			
	var tip = d3.tip()
	.attr('class', 'd3-tip')
	.html(function(d) {
	  return "<strong>FOUND:</strong> <span style='color:red'>" + datarows[0][33] + "</span>";
	});
	
	var tip1 = d3.tip()
	.attr('class', 'd3-tip')
	.offset([10, 0])
	.direction('s')
	.html(function(d) {
	  return "<strong style='color:red'>Entalten in:</strong> <span >" + datarows[0][3] + "</span>";
	});
	
	svg.call(tip);
	svg.call(tip1);
		
    var title = svg.selectAll("text.title")
	        .data([0])
	        .enter()
	        .append("text")
	        .text(documentName)
			.attr("class", "title")
	        .attr("x", width/2)
			.attr("font-size", "20px")
	        .attr("y", 20)
			.attr("text-anchor", "middle");		
	
	var term1 = svg.selectAll("text.term1")
		        .data([0])
		        .enter()
		        .append("text")
		        .text(datarows[0][indexTerm])
				.attr("class", "term1")
		        .attr("x", width/2)
				.attr("font-size", "16px")
		        .attr("y", 40)
				.attr("text-anchor", "middle")
			.on('mouseover', tip1.show)
			.on('mouseout', tip1.hide);
				

	var img = svg.append("g").append("image")
			.attr("class", "img1")
	        .attr("width", width / 4) 
	        .attr("height", height / 4 ) 
	        .attr("y", (height-40-(height/4)))
	        .attr("x", 10)
	        .attr("xlink:href", image1)
				.on('mouseover', tip.show)
   		 		.on('mouseout', tip.hide)
				;
			
	var img1 = svg.append("g").append("image")
			.attr("class", "img2")
	        .attr("width", width / 4) 
	        .attr("height", height / 4 ) 
	        .attr("y", (height-40-(height/4)))
	        .attr("x", ((width/2)-(width/8)))
	        .attr("xlink:href", datarows[0][31]);
			
	var img2 = svg.append("g").append("image")
			.attr("class", "img3")
	        .attr("width", width / 4) 
	        .attr("height", height / 4 ) 
	        .attr("y", (height-40-(height/4)))
	        .attr("x", (width-20-(width/4)))
	        .attr("xlink:href", datarows[0][34]);
							
	var footer = svg.selectAll("text.footer")
	        .data([0])
	        .enter()
	        .append("text")
	        .text("dms & dr 2018")
			.attr("class", "footer")
	        .attr("x", width/2)
			.attr("font-size", "10px")
	        .attr("y", height - 20)
			.attr("text-anchor", "middle");	
};


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

d3.tip = function() {
  var direction = d3_tip_direction,
      offset    = d3_tip_offset,
      html      = d3_tip_html,
      node      = initNode(),
      svg       = null,
      point     = null,
      target    = null

  function tip(vis) {
    svg = getSVGNode(vis)
    point = svg.createSVGPoint()
    document.body.appendChild(node)
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function() {
    var args = Array.prototype.slice.call(arguments)
    if(args[args.length - 1] instanceof SVGElement) target = args.pop()

    var content = html.apply(this, args),
        poffset = offset.apply(this, args),
        dir     = direction.apply(this, args),
        nodel   = d3.select(node), i = 0,
        coords

    nodel.html(content)
      .style({ opacity: 1, 'pointer-events': 'all' })

    while(i--) nodel.classed(directions[i], false)
    coords = direction_callbacks.get(dir).apply(this)
    nodel.classed(dir, true).style({
      top: (coords.top +  poffset[0]) + 'px',
      left: (coords.left + poffset[1]) + 'px'
    })

    return tip
  }

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function() {
    nodel = d3.select(node)
    nodel.style({ opacity: 0, 'pointer-events': 'none' })
    return tip
  }

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select(node).attr(n)
    } else {
      var args =  Array.prototype.slice.call(arguments)
      d3.selection.prototype.attr.apply(d3.select(node), args)
    }

    return tip
  }

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  tip.style = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select(node).style(n)
    } else {
      var args =  Array.prototype.slice.call(arguments)
      d3.selection.prototype.style.apply(d3.select(node), args)
    }

    return tip
  }

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function(v) {
    if (!arguments.length) return direction
    direction = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function(v) {
    if (!arguments.length) return offset
    offset = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function(v) {
    if (!arguments.length) return html
    html = v == null ? v : d3.functor(v)

    return tip
  }

  function d3_tip_direction() { return 'n' }
  function d3_tip_offset() { return [0, 0] }
  function d3_tip_html() { return ' ' }

  var direction_callbacks = d3.map({
    n:  direction_n,
    s:  direction_s,
    e:  direction_e,
    w:  direction_w,
    nw: direction_nw,
    ne: direction_ne,
    sw: direction_sw,
    se: direction_se
  }),

  directions = direction_callbacks.keys()

  function direction_n() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    }
  }

  function direction_s() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    }
  }

  function direction_e() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    }
  }

  function direction_w() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    }
  }

  function direction_nw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    }
  }

  function direction_ne() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    }
  }

  function direction_sw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    }
  }

  function direction_se() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.se.y,
      left: bbox.e.x
    }
  }

  function initNode() {
    var node = d3.select(document.createElement('div'))
    node.style({
      position: 'absolute',
      opacity: 0,
      pointerEvents: 'none',
      boxSizing: 'border-box'
    })

    return node.node()
  }

  function getSVGNode(el) {
    el = el.node()
    if(el.tagName.toLowerCase() == 'svg')
      return el

    return el.ownerSVGElement
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    var targetel   = target || d3.event.target,
        bbox       = {},
        matrix     = targetel.getScreenCTM(),
        tbbox      = targetel.getBBox(),
        width      = tbbox.width,
        height     = tbbox.height,
        x          = tbbox.x,
        y          = tbbox.y,
        scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft


    point.x = x + scrollLeft
    point.y = y + scrollTop
    bbox.nw = point.matrixTransform(matrix)
    point.x += width
    bbox.ne = point.matrixTransform(matrix)
    point.y += height
    bbox.se = point.matrixTransform(matrix)
    point.x -= width
    bbox.sw = point.matrixTransform(matrix)
    point.y -= height / 2
    bbox.w  = point.matrixTransform(matrix)
    point.x += width
    bbox.e = point.matrixTransform(matrix)
    point.x -= width / 2
    point.y -= height / 2
    bbox.n = point.matrixTransform(matrix)
    point.y += height
    bbox.s = point.matrixTransform(matrix)

    return bbox
  }

  return tip
};
