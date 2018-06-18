/************************************************************************************
 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 !!!!!!!!!!!!!!!!!!!!!!!! DO NOT CHANGE OR REMOVE THIS FILE !!!!!!!!!!!!!!!!!!!!!!!!!
 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 ************************************************************************************/



/************************************************************************************
 * @author
 * Ilija Simic
 ************************************************************************************/

var gaDatarows = [];
var gaChannelMappings = [];
var gnChartRowIndex;
var gnFrom = -1;
var gnTo = -1;
var gaLabelList = [];
var gaFilteredDatarows = [];
var brushingObserver = parent.brushingObserver;

var getChannelMappings = function ()
{
    return gaChannelMappings;
}



var getChartRowIndex = function ()
{
    return gnChartRowIndex;
}



var getFrom = function ()
{
    return gnFrom;
}



var getTo = function ()
{
    return gnTo;
}



var filterBy = function (filterObjs) {
    let filteredDatarows = [];
    gaFilterObjs = filterObjs;
    if(filterObjs.length == 0) {
        gaFilteredDatarows = [];
        applyFilter([]);
        return;
    }

    var labels = gaChannelMappings.map(function(elem){
        return elem.label;
    });

    gaDatarows.forEach(function(row){
        let match = true;

        filterObjs.forEach(function(filterObj){
            let index = labels.indexOf(filterObj.label);

            if(gaChannelMappings[index].datatype == "integer" || gaChannelMappings[index].datatype == "number")
            {
                var min = filterObj.values[0];
                var max = filterObj.values[1];
                var rowVal = +row[index];
                if(rowVal < min || rowVal > max)
                    match = false;
            }
            else {
                if(filterObj.values.indexOf(row[index]) == -1)
                    match = false;
            }

        });
        if(match)
            filteredDatarows.push(row);
    });

    gaFilteredDatarows = filteredDatarows;
    applyFilter(filteredDatarows);
}



var updateVisualization = function (labelList)
{
    let swapper = [];

    for (let i = 0; i < labelList.length; i++)
    {
        let label = labelList[i];
        for (let j = 0; j < gaChannelMappings.length; j++)
        {
            if (gaChannelMappings[j].label == label)
            {
                swapper.push(j);
                break;
            }
        }
    }

    let newChannelMappings = [];
    for (let i = 0; i < swapper.length; i++)
    {
        let entry = {};
        entry["channel"] = gaChannelMappings[i].channel;
        entry["label"] = gaChannelMappings[swapper[i]].label;
        entry["datatype"] = gaChannelMappings[swapper[i]].datatype;
        if(typeof(gaChannelMappings[swapper[i]].aggregation))
            entry["aggregation"] = gaChannelMappings[swapper[i]].aggregation;
        newChannelMappings.push(entry);
    }

    let newDatarows = [];
    for (let i = 0; i < gaDatarows.length; i++)
    {
        let oldEntry = gaDatarows[i];
        let newEntry = [];
        for (let j = 0; j < oldEntry.length; j++)
        {
            newEntry.push(oldEntry[swapper[j]]);
        }
        newDatarows.push(newEntry);
    }
    gaDatarows = newDatarows;
    gaChannelMappings = newChannelMappings;

    showVisualization(newDatarows, newChannelMappings, "body", gnChartRowIndex, gnFrom, gnTo);
}



var sortBy = function(label, ascending) {
    if(typeof(ascending) == "undefined")
        ascending = true;

    var sortIndex;
    for(var i = 0; i < gaChannelMappings.length; i++)
    {
        if(label == gaChannelMappings[i].label)
        {
            sortIndex = i;
            break;
        }
    }

    var convertToLowerCase = false;
    if(gaChannelMappings[sortIndex].datatype == "string" || gaChannelMappings[sortIndex].datatype == "date" || gaChannelMappings[sortIndex].datatype == "location")
        convertToLowerCase = true
    gaDatarows.sort(function(a,b){
        var valA = a[sortIndex];
        var valB = b[sortIndex];
        if(convertToLowerCase) {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        } else {
            valA = +valA;
            valB = +valB;
        }

        if(ascending)
        {
            if(valA < valB) return -1;
            if(valA > valB) return 1;
            return 0;
        }
        else
        {
            if(valA > valB) return -1;
            if(valA < valB) return 1;
            return 0;
        }
    });

    refreshVisualization();
}



var unregisterVisualization = function ()
{
    brushingObserver.unregisterListener(gnChartRowIndex);
    // parent.brushingObserver.unregister(gnChartRowIndex);
}



var refreshVisualization = function ()
{
    document.body.innerHTML = "";
    showVisualization(gaDatarows, gaChannelMappings, "body", gnChartRowIndex, gnFrom, gnTo);
    if(gaFilteredDatarows.length != 0)
        applyFilter(gaFilteredDatarows);
}



var showVisualization = function (datarows, channelMappings, targetSelector, chartRowIndex, from, to, sortByName, ascending) {
    if (gaDatarows.length == 0)
    {
        gaDatarows = datarows;
        gnChartRowIndex = chartRowIndex;
        gnFrom = from;
        gnTo = to;
        for (var i = 0; i < channelMappings.length; i++)
            gaLabelList.push(channelMappings[i].label);
    }
    gaChannelMappings = channelMappings;

    if(typeof(sortByName) != "undefined" && sortByName != "")
        sortBy(sortByName, ascending)

    drawVisualization(datarows, channelMappings, chartRowIndex);
}



if(typeof(revertCssFromSvg) === "undefined") {
    var revertCssFromSvg = function() {}
}



if(typeof(applyCssToSvg) === "undefined") {
    var applyCssToSvg = function () {}
}



if(typeof(applyFilter) === "undefined") {
    var applyFilter = function(filteredDatarows) {}
}
