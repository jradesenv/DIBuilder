#dibuilder example

just install it dependencies (npm install) and run it with: node server.js

Obs: to see some debug info, set a DEBUG env variable to DIBuilder. 
In windows cmd:
	set DEBUG=DIBuilder

#Description:
- itemResource depends on router and itemService
- itemService depends on itemModel
- itemModel depends on mongoose

You can see that the route works fine (using itemResource, itemService, etc...) in:
http://localhost:3000/api/item

#Some test cases to see the warnings about errors:

If you make itemModel depend on itemService, you will see that DIBuilder will warn you about the circle dependency.
If you remove mongoose from itemModel dependencies but still use it inside, DIBuilder will warn your about the error inside the constructor.
If you make another module depend on itemResource, DIBuilder will warn you that itemResource can't be a dependecy 'coz it returns nothing.