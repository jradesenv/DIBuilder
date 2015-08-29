module.exports = function(dibuilder) {
    dibuilder.addModule(itemModel);
    
    function itemModel(mongoose){        
        var Schema = mongoose.Schema;

        var itemSchema = new Schema({
            name : {type: String},
        });

        var model = mongoose.model('item', itemSchema);

        return model;
    }
};
