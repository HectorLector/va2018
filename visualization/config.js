var visConfig = {
    // Add all of your libraries from the libs folder here. The visualizerChartApi entry should NOT be removed
    libs : ["visualizerChartApi.js", "d3.v3.min.js", "jquery-3.3.1.min.js"],

    // Add all your css files from your css folder here
    css : ["style.css"],

    // Add your mainfile here, which implements the visualization interface
    mainFile : "main.js",

    // Define what fields you want to map on which channels
    // The fieldname has to be exact the same as in the header array of the data
    // The channelname is defined by you and can be used to identify where a certain field should be mapped to
    fieldToChannelMap : [
        {
            "field" : "document",
            "channel" : "document"
        },
        {
            "field" : "page",
            "channel" : "page"
        },
        {
            "field" : "term",
            "channel" : "term"
        },
        {
            "field" : "tf",
            "channel" : "tf"
        },
        {
            "field" : "tfidf",
            "channel" : "tfidf"
        },
        {
            "field" : "image",
            "channel" : "image"
        },
        {
            "field" : "image_size",
            "channel" : "image_size"
        },
        {
            "field" : "key",
            "channel" : "key"
        },
        {
            "field" : "value",
            "channel" : "value"
        },
    ]
};
