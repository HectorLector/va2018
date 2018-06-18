/************************************************************************************
 * @author
 * Ilija Simic
 ************************************************************************************/

$(document).ready(function(){
    $("#vis-width").val($("#visualization-iframe").width());
    $("#vis-height").val($("#visualization-iframe").height());

    $("#size-container input").on("keyup",function(e){
       if(e.keyCode === 13)
           setSize();
    });
});

function drawVisualization() {
    initIframe("visualization-iframe", 1);
}

function drawSecondVisualization() {
    initIframe("second-visualization-iframe", 2);
}

function initIframe(iframeId, visIndex){
    let iframe = document.getElementById(iframeId);

    let cssTags = "";
    visConfig.css.forEach( (css) => {
        cssTags += '<link rel="stylesheet" type="text/css" href="./visualization/css/'+css+'">\n';
    });

    let scriptTags = "";
    visConfig.libs.forEach( (lib) => {
        scriptTags += '<script src="./visualization/libs/'+lib+'" defer></script>\n';
    });

    scriptTags += '<script src="./visualization/' + visConfig.mainFile + '" defer></script>\n';

    let iframeContent = ''
    iframeContent += '<!DOCTYPE html>';
    iframeContent += '<html style="width: 100%; height: 100%">';
    iframeContent += '  <head>';
    iframeContent += '    <title>new visualization</title>';
    iframeContent +=      cssTags;
    iframeContent +=      scriptTags;
    iframeContent += '  </head>';
    iframeContent += '  <body style="width: 100%; height: 100%; margin: 0;" id="body">';
    iframeContent += '  </body>';
    iframeContent += '</html>';

    iframe.contentWindow.document.open('text/html', 'replace');
    iframe.contentWindow.document.write(iframeContent);
    iframe.contentWindow.document.close();
    
    let indexes = [];
    visConfig.fieldToChannelMap.forEach( entry => {
       indexes.push(getIndexOfFieldByName(entry.field));
    });

    let datarows = data.content.map( row => {
       let subsetOfRow = [];
       indexes.forEach( index => {
           if(data.types[index] === "number")
               subsetOfRow.push(+row[index]);
           else
               subsetOfRow.push(row[index]);
       });
       return subsetOfRow;
    });

    let mapping = [];
    visConfig.fieldToChannelMap.forEach( entry => {
       mapping.push({
           "aggregation" : "",
           "label" : entry.field,
           "datatype" : data.types[getIndexOfFieldByName(entry.field)],
           "channel" : entry.channel
       })
    });

    if(iframe.contentWindow.showVisualization) {
        iframe.contentWindow.showVisualization(datarows, mapping, "body", visIndex, -1, -1, "", "");
    }
    else {
        // wait until content is loaded in iframe
        iframe.contentWindow.onload = function() {
            iframe.contentWindow.showVisualization(datarows, mapping, "body", visIndex, -1, -1, "", "");
        }
    }
}


function getIndexOfFieldByName(fieldname) {
    return data.header.indexOf(fieldname);
}

function fireRandomFilterEvent() {
    let indexes = [];
    visConfig.fieldToChannelMap.forEach( entry => {
        indexes.push(getIndexOfFieldByName(entry.field));
    });

    let datarows = data.content.map( row => {
        let subsetOfRow = [];
        indexes.forEach( index => {
            if(data.types[index] === "number")
                subsetOfRow.push(+row[index]);
            else
                subsetOfRow.push(row[index]);
        });
        return subsetOfRow;
    });

    if(datarows.length === 0)
        return;

    let numOfFilterRows = Math.ceil(datarows.length / 2);
    let filterIndexes = [];
    while(filterIndexes.length < numOfFilterRows) {
        let newIndex =  Math.round(Math.random() * (datarows.length-1));
        if(filterIndexes.indexOf(newIndex) === -1)
            filterIndexes.push(newIndex);
    }

    let filteredRows = datarows.filter( (row, index) => {
       return (filterIndexes.indexOf(index) !== -1)
    });

    console.log("%cROWS TO FILTER: ", 'color:blue',filteredRows);

    let iframe = document.getElementById("visualization-iframe");
    if(iframe.contentWindow.applyFilter)
        iframe.contentWindow.applyFilter(filteredRows);
}

function clearFilter() {
    let iframe = document.getElementById("visualization-iframe");
    if(iframe.contentWindow.filterBy)
        iframe.contentWindow.filterBy([]);
}

function fireRandomBrushEvent() {
    console.log("fireRandomBrushEvent");

    let indexes = [];
    visConfig.fieldToChannelMap.forEach( entry => {
        indexes.push(getIndexOfFieldByName(entry.field));
    });

    let datarows = data.content.map( row => {
        let subsetOfRow = [];
        indexes.forEach( index => {
            if(data.types[index] === "number")
                subsetOfRow.push(+row[index]);
            else
                subsetOfRow.push(row[index]);
        });
        return subsetOfRow;
    });

    if(datarows.length === 0)
        return;

    let numOfFilterRows = Math.ceil(datarows.length / 2);
    let filterIndexes = [];
    while(filterIndexes.length < numOfFilterRows) {
        let newIndex =  Math.round(Math.random() * (datarows.length-1));
        if(filterIndexes.indexOf(newIndex) === -1)
            filterIndexes.push(newIndex);
    }

    let filteredRows = datarows.filter( (row, index) => {
        return (filterIndexes.indexOf(index) !== -1)
    });

    let brushArray = [];
    filteredRows.forEach((row) => {
        brushObj = {};
        indexes.forEach( (index, i) => {
            brushObj[data.header[index]] = row[i];
        });
        brushArray.push(brushObj);
    });
    brushingObserver.update(-1, brushArray);
}

function clearBrush() {
    brushingObserver.update(-1, []);
}


function setSize() {
    let $iframe = $("#visualization-iframe");
    $iframe.width($("#vis-width").val());
    $iframe.height($("#vis-height").val());
    initIframe("visualization-iframe");
}


