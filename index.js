module.exports = function () {
    var fs = require('fs');
    var path_module = require('path');
    var debugFactory = require('debug');
    var debug = debugFactory('DIBuilder');
    var debugModule = function (msg) {
        currentStack = currentStack || [];
        debug(_repeat('>', currentStack.length * 3) + msg);
    };
    var debugError = function (msg) {
        console.log('Error: ' + msg);
    };
    
    //definition
    
    var builder = {};
    builder.build = build;
    builder.loadModules = loadModules;
    builder.addModule = addModule;
    builder.addInstance = addInstance;
    builder.getInstance = getInstance;
    builder.executeFunction = executeFunction;
    return builder;
    
    //implementation
    
    var _instances = {};
    var _modules = {};
    function build(callback) {
        try {
            console.log('Building modules... ');
            var buildSuccess = _injectDependencies(_modules);
            if (!buildSuccess) {
                console.log('Could not build dependencies.');
            } else {
                console.log('Resolved all dependencies with success!');
                if (typeof callback === 'function') {
                   executeFunction(callback);
                }
            }
        } catch (ex) {
            debugError(ex.message);
        }
    }

    function loadModules(path) {
        try {
            var stat = fs.lstatSync(path);
            var isDirectory = stat.isDirectory();
            if (isDirectory) {
                var files = fs.readdirSync(path);
                var f, l = files.length;
                for (var i = 0; i < l; i++) {
                    f = path_module.join(path, files[i]);
                    loadModules(f);
                }
            } else {
                if (path.indexOf('.js') > -1) {
                    debug('loading module ' + path);
                    require(path)(builder);
                }
            }
        } catch (ex) {
            debugError(ex.message);
        }
    }

    function getInstance(name) {
        try {
            _instances = _instances || {};
            //validations        
            var instance = _instances[name];
            if (typeof _instances[name] !== "undefined") {
                return instance;
            } else {
                debugError("getInstance: instance of " + name + ' not found.');
            }
        } catch (ex) {
            debugError(ex.message);
        }
    }

    function addInstance(name, instance) {
        try {
            _instances = _instances || {};
            //validations        
            if (typeof _instances[name] !== "undefined") {
                debugModule("instance already defined for: " + name);
                return;
            }

            debugModule("instance of " + name + ' added');
            _instances[name] = instance;
        } catch (ex) {
            debugError(ex.message);
        }
    }

    function addModule(constructor) {
        try {
            _modules = _modules || {};
            var moduleName = constructor.name;
            
            //validations
            if (typeof constructor !== 'function') {
                debug('module should be a function');
                return;
            }

            if (typeof moduleName !== 'string') {
                debug('could not resolve module name');
                return;
            }

            if (typeof _modules[moduleName] !== 'undefined') {
                debug('module already defined for: ' + constructor.name);
                return;
            }

            debugModule('module ' + moduleName + ' added');
            _modules[moduleName] = constructor;
        } catch (ex) {
            debugError(ex.message);
        }
    }

    var currentStack = [];
    function _injectDependencies(modules) {
        try {
            currentStack = [];
            for (var moduleName in modules) {
                debugModule('Injecting into ' + moduleName);
                _injectDependenciesSingleModuleAndReturnInstance(moduleName);
            }
            return true;
        } catch (ex) {
            debugError(ex.message);
            return false;
        }
    }

    function executeFunction(func) {
        var name = func.name ? func.name : '[anonymous]';
        debugModule('injecting dependencies on function ' + name);
        var dependencies = _getParameterNames(func);

        debugModule('function dependencies: ' + dependencies.join());
        var dependenciesInstances = getAllDependencies(dependencies);
        if (dependenciesInstances.length === dependencies.length) {
            try {
                func.apply(func, dependenciesInstances);
            } catch (ex) {
                throw new Error('error inside function "' + name + '": ' + ex.message);
            }
        } else {
            throw new Error('could not resolve dependencies for function' + name);
        }
    }

    function getAllDependencies(dependenciesNames) {
        var dependenciesInstances = [];
        var hasDependencies = false;
        if (dependenciesNames.length > 0 && dependenciesNames[0] !== '') {
            hasDependencies = true;
        } else {
            debugModule('does not have dependency');
        }
        if (hasDependencies) {
            for (var i = 0, len = dependenciesNames.length; i < len; i++) {
                var dependencyName = dependenciesNames[i];
                var dependencyInstance = _instances[dependencyName];
                if (typeof dependencyInstance === 'undefined') { //instance not already exists?
                    var dependencyModule = _modules[dependencyName];
                    if (typeof dependencyModule === "function") { //module exists??
                        debugModule('building dependency module')
                        dependencyInstance = _injectDependenciesSingleModuleAndReturnInstance(dependencyName);
                    }

                    if (typeof dependencyInstance === 'undefined') { //couldn't create instance?
                        dependencyInstance = _getDependencyByRequire(dependencyName);
                        if (typeof dependencyInstance === 'undefined') { //couldn't require it?
                            throw new Error('dependency module [' + dependencyName + '] not found or returning undefined!');
                        } else {
                            debugModule('module [' + dependencyName + '] required successfully. Type: ' + typeof dependencyInstance);
                            dependenciesInstances.push(dependencyInstance);
                        }
                    } else {
                        debugModule('instance of [' + dependencyName + '] found. Type: ' + typeof dependencyInstance);
                        dependenciesInstances.push(dependencyInstance);
                    }
                } else {
                    debugModule('instance of [' + dependencyName + '] found. Type: ' + typeof dependencyInstance);
                    dependenciesInstances.push(dependencyInstance);
                }
            }
        }
        return dependenciesInstances;
    }

    function _injectDependenciesSingleModuleAndReturnInstance(moduleName) {
        if (currentStack.indexOf(moduleName) > -1) {
            currentStack.push(moduleName);
            throw new Error('circular dependency found in: ' + currentStack.join(' > '));
        }
        if (typeof _instances[moduleName] !== 'undefined') {
            debugModule('already found instance of ' + moduleName);
            return _instances[moduleName];
        } else {
            currentStack.push(moduleName);
            debugModule('building module: ' + moduleName);
            var _module = _modules[moduleName];
            var dependencies = _getParameterNames(_module);
            debugModule('module dependencies: ' + dependencies.join());

            var dependenciesInstances = [];
            var hasDependencies = false;
            dependenciesInstances = getAllDependencies(dependencies);
            if (!hasDependencies || dependenciesInstances.length === dependencies.length) {
                var indexInStack = currentStack.indexOf(moduleName);
                try {
                    var _newInstance = _module.apply(_module, dependenciesInstances);
                } catch (ex) {
                    throw new Error('error inside module "' + moduleName + '" constructor: ' + ex.message);
                }
                addInstance(moduleName, _newInstance);
                if (indexInStack > -1) {
                    currentStack.splice(indexInStack, 1);
                }
                return _newInstance;
            } else {
                throw new Error('could not resolve dependencies for ' + moduleName);
            }
        }
    }

    function _repeat(pattern, count) {
        if (count < 1) return '';
        var result = '';
        while (count > 1) {
            if (count & 1) result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    }

    function _getParameterNames(func) {
        var parameterNames = func.toString()
                                .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
                                .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
                                .split(/,/);
        if (parameterNames.length == 1 && parameterNames[0].length == 0) {
            return [];
        }else{
            return parameterNames;
        }
    }

    function _getDependencyByRequire(dependencyName) {
        try {
            debugModule("trying to require " + dependencyName);
            var normalizedName = _normalizeRequireName(dependencyName);
            if (normalizedName !== dependencyName) debugModule("normalized name: " + normalizedName);
            var _module = require(normalizedName);
            return _module;
        }
        catch (ex) {
            if (ex instanceof Error && ex.code === "MODULE_NOT_FOUND")
                debugError("module not found!");
            else
                debugError("error while trying to require module: " + ex.message);
        }
    }

    function _normalizeRequireName(text) {
        //replace uppercase letters with hyppens
        return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
} ();
