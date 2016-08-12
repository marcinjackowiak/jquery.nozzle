/* 
 * jquery.nozzle 
 * v1.0.0
 * Simple data filtering and manipulation library for jquery. 
 * 
 * Author: Marcin Jackowiak
 * Released under MIT License
 * 
 */

(function($) {
    
$.nozzle = {};
$.nozzle.version = '1.0.0'
$.nozzle.renderTimeoutFunction = null; 

/*
 * liveFilter
 * Apply a filter to the given dataset. Event listeners will be added automatically.
 */
$.nozzle.liveFilter = function(options) {
    
    var liveFilter = this;        
    var defaults = {        
        data: null,
        deferRender: true,
        deferRenderDelay: 300,
        filters: [],
        filterCallback: null,
        render: false,
        renderCallback: null
    }        
    
    // Apply default options
    var params = $.extend({}, defaults, options);    
        
    // Register event listeners
    params.filters.forEach(function(fval, findex, farr) {
        var $el = fval['value'];
        if($el.is('select')) {
            $el.on('change', function(e) {
                liveFilter.filter();
            });
        } else {
            $el.on('keyup', function(e) {
                liveFilter.filter();
            });            
        }
    });
    
    liveFilter.filter = function() {
        var filteredData = $.nozzle.filterData(
            params.data,
            params.filters
        );
        if(typeof params.filterCallback === 'function') {
            params.filterCallback(filteredData);
        }
        if(params.render && typeof params.renderCallback === 'function') {
            if(params.deferRender) {
                var id = setTimeout(function() {
                    if($.nozzle.renderTimeoutFunction === id) {
                        params.renderCallback(filteredData);
                    }
                }, params.deferRenderDelay);            
                $.nozzle.renderTimeoutFunction = id;
            } else {
                params.renderCallback(filteredData);
            }
        }
    }
    
};

/*
 * filterData
 * Filter the data using provided filter array
 */
$.nozzle.filterData = function(data, filters) {
    var filtered = [];
    var filterDefaults = {
        attribute: null, // can be a comma separated list
        match: 'contains', // contains, startsWith, endsWith, regex, exact
        matchCase: false,
        value: null
    }
       
    var filterArr = [];
    if($.isArray(filters)) {
        filterArr = filters;
    } else {
        filterArr.push(filters);
    }                
    
    // Prepare filters
    filterArr.forEach(function(filter, findex, farr) {
        var value = filter['value'];
        if(value instanceof jQuery) {
            value = value.val();
        }
        if(!filter['matchCase']) {
            value = value.toLowerCase();
        }
        filter['_value'] = value;
    });
    
    // Filter data
    data.forEach(function(val, index, arr) {   
        var match = true;

        filterArr.forEach(function(fval, findex, farr) {
           
            var skip = false;

            // Apply defaults
            var filter = $.extend({}, filterDefaults, fval);

            // Value to test            
            var testValArr;
            var attr = fval['attribute'];
            if(attr.indexOf(',') < 0) {
                // Single attribute
                attr = attr.trim();
                if(typeof val[attr] === 'undefined') {
                    skip = true;
                } else {
                    testValArr = [filter['matchCase'] ? val[attr] : val[attr].toLowerCase()];
                }
            } else {
                // Multiple attributes
                testValArr = [];
                attr.split(',').forEach(function(attrName, attrIndex, attrArr) {
                    attrName = attrName.trim();
                    if(typeof val[attrName] !== 'undefined') {
                        testValArr.push(filter['matchCase'] ? val[attrName] : val[attrName].toLowerCase());
                    }
                });
                if(testValArr.length === 0) skip = true; // continue to next forEach
            }

            if(skip) {
                
                match = false;
                
            } else {
                var type = filter['match'];
                var filterval = filter['_value'];

                // Retrieve actual value to match if this is a jquery object
                if(filterval instanceof jQuery) {
                    filterval = filterval.val();
                }

                // Test each attribute
                var thisMatch = false;
                for(var i=0; i < testValArr.length; i++) {                     
                    var testval = testValArr[i];

                    if(type === 'contains') {   
                        thisMatch = testval.indexOf(filterval) > -1;
                    } else 
                    if(type === 'startsWith') {
                        thisMatch = testval.indexOf(filterval) === 0;                        
                    } else
                    if(type === 'endsWith') {
                        var expect = testval.length - filterval.length;
                        if(testval.indexOf(filterval) === expect) {
                            thisMatch = true;                                
                        }
                    } else 
                    if(type === 'exact') {
                        thisMatch = filterval.length === 0 || testval === filterval;
                    } else
                    if(type === 'regex') {
                        var regex = new RegExp(filterval);

                        // Regex Modifiers
                        var modifiers = 'g';
                        if(!filter['matchCase']) {
                            modifiers += 'i';
                        }      

                        if(testval.match(regex) != null) {
                            thisMatch = true;
                        }
                    }
                    
                    if(thisMatch) break; // break out on first match
                }
                
                match &= thisMatch;
                
            }

        });

        if(match) {
            filtered.push(val);                
            val['__index'] = index; // store original index
        }                    
    });  
    
    return filtered;
};

$.nozzle.Model = function(data) {
    Object.defineProperty(this, '_data', { 
        enumerable: false,
        writable: true
    });   
    Object.defineProperty(this, '_bindings', { 
        enumerable: false,
        writable: true
    });       
    Object.defineProperty(this, 'data', {
        get: function() {
            return this._data;
        },
        set: function(val) {            
            this._data = val;
            this._bindings.forEach(function(binding, idx) {
                void 0;
                binding.unbind();
                binding.apply('data'); // rebind
            });                        
        }
    });
    this._bindings = [];
    this.data = data;
    
    this.addBinding = function(binding) {
        this._bindings.push(binding);
    }
};

$.nozzle.bind = function(options) {
    var binding = new $.nozzle.Binding(options);
    if(typeof options.source !== 'undefined') {
        binding.apply(options.source);
    } else {
        binding.apply();
    }
};

$.nozzle.Binding = function(options) {
    
    var defaults = {        
        model: null,
        source: null,
        map: {
        }
    }        
    
    // Apply default options
    var params = $.extend({}, defaults, options); 
    this.params = params;
    
    // Store binding reference
    this.params.model.addBinding(this);
    
    var Watchable = function(name, initValue, parent) {
        Object.defineProperty(this, 'name', { 
            enumerable: false,
            writable: true
        });   
        Object.defineProperty(this, 'value', { 
            enumerable: false,
            writable: true
        });      
        Object.defineProperty(this, '$listeners', { 
            enumerable: false,
            writable: true
        });              
        Object.defineProperty(this, 'attribute', { 
            enumerable: false,
            writable: true
        });   
        Object.defineProperty(this, 'parent', { 
            enumerable: false,
            writable: true
        });          
        this.name = '_'+name;
        this.value = initValue;
        this.attribute = name; 
        this.parent = parent;
        this.$listeners = [];
        
        this.updateValue = function(value) {            
            this.value = value;
        }
        
        this.notifyListeners = function($source) {
            var self = this;
            this.$listeners.forEach(function($listener, idx, arr) {
                $listener.each(function() {
                    var $this = $(this);
                    if(typeof $source === 'undefined' || $source === null || $this.get(0) !== $source.get(0)) {
                        $this.val(self.value);
                    }                    
                });
            });
        }
        
        this.addListener = function($el) {
            this.$listeners.push($el);
        }
    }
    
    var watch = function(watchObj, _watchObj) {
        
        Object.keys(watchObj).forEach(function(attr, idx, arr) {  
            
            var tmp = watchObj[attr];
            Object.defineProperty(watchObj, '_'+attr, {
                enumerable: false,
                value: new Watchable(attr, tmp, watchObj)
            });
            Object.defineProperty(watchObj, attr, {
                get: function() {                                
                    return this['_'+attr].value;
                },
                set: function(val) { 
                    var watchable = watchObj['_'+attr];
                    var old = watchable.value;
                    void 0;
                    watchable.value = val;
                    watchable.notifyListeners();
                }
            });
            
            if(typeof watchObj[attr] === 'object') {
                watch(watchObj[attr], watchObj['_'+attr]);
            }            
        });        
    };

    var objFromPath = function(path) {
        var obj = params.model.data;
        var pathArr = path.split('.');
        pathArr.forEach(function(attr, idx, arr) {
            if(idx === arr.length - 1) {
                attr = '_'+attr; // watchable
            }
            obj = obj[attr];
        });
        return obj;
    };   
    
    this.apply = function(source) {
        watch(params.model.data);
        
        Object.keys(params.map).forEach(function(el, idx, arr) {
            var path = params.map[el].path;
            var changeCallback = params.map[el].changeCallback;
            void 0;
            var watchable = objFromPath(path);
            watchable.addListener($(el));
            $(el).on('keyup.nozzle.bind', function(e) {        
                void 0;
                watchable.updateValue($(this).val());
                watchable.notifyListeners($(el));
                if(typeof changeCallback === 'function') {
                    changeCallback();
                }
            });           
            
            if(source === 'data') {
                // Update the UI from data
                watchable.notifyListeners(null);
            } else
            if(source === 'ui') {
                // Update the data from UI
                watchable.updateValue($(el).val());
            }
            
        });  
    };
    
    this.unbind = function() {
        Object.keys(params.map).forEach(function(el, idx, arr) {
            $(el).off('keyup.nozzle.bind');
        });
    }
    
};

})(jQuery);