# DIBuilder - Dependency Injection Builder

## Module to easily inject dependencies in your nodeJS api.

With this module, you need only to make your classes receive the dependencies as parameters and let the DIBuilder build it all.

DIBuilder will warn you about errors like circular dependencies, error in constructor and dependence on modules that returns nothing, providing valuable information to discover where's the error in your code.

Set the DEBUG env var to see debug info.

## Usage:

in your server.js file, require dibuilder module:

```js
	var dibuilder = require('dibuilder');
```

Add the instances that your modules can depend on, like routes and mongoose:

```js
	dibuilder.addInstance('router', router);
	dibuilder.addInstance('mongoose', mongoose);
```

Add the paths to the folders where DIBuilder should search for modules and automatically require them:

```js
	dibuilder.loadModules(path_module.join(__dirname, './project/resources'));
	dibuilder.loadModules(path_module.join(__dirname, './project/domain'));
```

Make your modules receive a dibuilder instance and use it to add that module:

```js
	module.exports = function(dibuilder) {
		//add this module
	    dibuilder.addModule(itemResource);
	    
	    function itemResource (router, itemService) {
	        // definition
	        router.get('/item', listResource);

	        // implementation
			function listResource(){
			}
	    }
	};
```

And call the build function to inject the dependencies, passing a success callback where you can set the route, connect your database, start the server etc..

```js
dibuilder.build(function(){
    router.get('/', function(req, res){
        res.send("DIBuilder example!");
    });

    //register api routes
    app.use('/api', router);

    mongoose.connect('mongodb://localhost/example');

    server.listen(appPort, function() {
        console.log('Express server listening on port ' + appPort);
    });     
});
```
