# DIBuilder - Dependency Injection Builder

## Module to easily inject dependencies in your nodeJS api.

With this module, you need only to make your classes receive the dependencies as parameters and let the DIBuilder build it all.

You don't even need to require all your modules in the server.js.
Just config the folders where you want it to search for modules, and let DIBuiler do it for you.

You can add instances you already have too in server.js, like routes or mongoose.

If any of your modules depends on any module from node or node_modules and you don't require it in your server.js, don't worry, the plugin will require them for you when some module depends on it. 

Just use the module name as dependency name, replacing any hyphen with the next letter uppercase. (ex.: if the module is aws-sdk you should depend on awsSdk).

DIBuilder will warn you about errors like circular dependencies, error in constructor and dependence on modules that returns nothing, providing valuable information to discover where's the error in your code.

Set the DEBUG env var to see debug info.
	In windows cmd:
		set DEBUG=DIBuilder

Run the project inside example folder to see it working.

## Getting started:

Install plugin with npm:

	npm install dibuilder --save

in your server.js file, require dibuilder module:

```js
	var dibuilder = require('dibuilder');
```

Add the instances you already have in server.js and that your modules can depend on, like router and mongoose:

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
	    
	    function itemResource (router, itemService, fs) { //plugin will inject router, itemService and fs into it
	        // definition
	        router.get('/item', listResource);

	        // implementation
			function listResource(){
			}
	    }
	};
```

If instead, you want to add any modules manually in server.js, just use the addModule passing your function

```js
 dibuilder.addModule(itemResource);
```

And finally, call the build function to inject the dependencies.
You can pass a success callback, where you could set the route, connect to your database, start the server etc..

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
