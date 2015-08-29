module.exports = function(dibuilder) {
    dibuilder.addModule(itemService);

    function itemService(itemModel){
        //definition
        var service = this;
        service.list = list;
        return service;
        
        // implementation
        function list (callback) {
            callback(["item1", "item2"]);
        };
    }
};
