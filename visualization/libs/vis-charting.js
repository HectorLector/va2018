/************************************************************************************
 * @author
 * Ilija Simic
 ************************************************************************************/

var brushingObserver = new function(){
    let listeners = {};
    let activeSelection = [];

    this.registerListener = function(visIndex, callback) {
        if(visIndex === undefined || callback === undefined)
            return;
        listeners[visIndex] = callback;
    };

    this.unregisterListener = function(visIndex) {
        delete listeners[visIndex];
    };

    this.update = function(callerVisIndex, data = []) {

        if(_.isEqual(activeSelection.sort(), data.sort())) {
            return;
        }

        activeSelection = data;
        for(let listenerIndex in listeners) {
            // listenerIndex explicitly cast to number because callerVisIndex is always a number
            // and when retrieving the listenerIndex it gets as a string
            if(+listenerIndex !== callerVisIndex) {
                listeners[listenerIndex](data);
            }

        }
    };

    this.getActiveSelection = function(){
        return activeSelection;
    };

};
