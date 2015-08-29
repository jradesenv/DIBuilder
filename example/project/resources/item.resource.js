module.exports = function(dibuilder) {
    dibuilder.addModule(itemResource);
    
    function itemResource (router, itemService) {
        // definition
        router.get('/item', listResource);

        // implementation
        function listResource (req, res) {
            itemService.list(function(items){
                res.send({
                    success: true,
                    items: items
                });
            });
        };
    }
};
