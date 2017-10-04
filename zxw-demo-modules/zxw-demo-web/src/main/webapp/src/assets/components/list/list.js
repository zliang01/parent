//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));
//     Backbone.js 1.2.3

//     (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
            (typeof global == 'object' && global.global == global && global);

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define('backbone',['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch(e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to a common array method we'll want to use later.
  var slice = Array.prototype.slice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.2.3';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... this will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Proxy Backbone class methods to Underscore functions, wrapping the model's
  // `attributes` object or collection's `models` array behind the scenes.
  //
  // collection.filter(function(model) { return model.get('age') > 10 });
  // collection.each(this.addView);
  //
  // `Function#apply` can be slow so we use the method's arg count, if we know it.
  var addMethod = function(length, method, attribute) {
    switch (length) {
      case 1: return function() {
        return _[method](this[attribute]);
      };
      case 2: return function(value) {
        return _[method](this[attribute], value);
      };
      case 3: return function(iteratee, context) {
        return _[method](this[attribute], cb(iteratee, this), context);
      };
      case 4: return function(iteratee, defaultVal, context) {
        return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
      };
      default: return function() {
        var args = slice.call(arguments);
        args.unshift(this[attribute]);
        return _[method].apply(_, args);
      };
    }
  };
  var addUnderscoreMethods = function(Class, methods, attribute) {
    _.each(methods, function(length, method) {
      if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
    });
  };

  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
  var cb = function(iteratee, instance) {
    if (_.isFunction(iteratee)) return iteratee;
    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
    return iteratee;
  };
  var modelMatcher = function(attrs) {
    var matcher = _.matches(attrs);
    return function(model) {
      return matcher(model.attributes);
    };
  };

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // a custom event channel. You may bind a callback to an event with `on` or
  // remove with `off`; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {};

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Iterates over the standard `event, callback` (as well as the fancy multiple
  // space-separated events `"change blur", callback` and jQuery-style event
  // maps `{event: callback}`).
  var eventsApi = function(iteratee, events, name, callback, opts) {
    var i = 0, names;
    if (name && typeof name === 'object') {
      // Handle event maps.
      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
      for (names = _.keys(name); i < names.length ; i++) {
        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
      }
    } else if (name && eventSplitter.test(name)) {
      // Handle space separated event names by delegating them individually.
      for (names = name.split(eventSplitter); i < names.length; i++) {
        events = iteratee(events, names[i], callback, opts);
      }
    } else {
      // Finally, standard events.
      events = iteratee(events, name, callback, opts);
    }
    return events;
  };

  // Bind an event to a `callback` function. Passing `"all"` will bind
  // the callback to all events fired.
  Events.on = function(name, callback, context) {
    return internalOn(this, name, callback, context);
  };

  // Guard the `listening` argument from the public API.
  var internalOn = function(obj, name, callback, context, listening) {
    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
        context: context,
        ctx: obj,
        listening: listening
    });

    if (listening) {
      var listeners = obj._listeners || (obj._listeners = {});
      listeners[listening.id] = listening;
    }

    return obj;
  };

  // Inversion-of-control versions of `on`. Tell *this* object to listen to
  // an event in another object... keeping track of what it's listening to
  // for easier unbinding later.
  Events.listenTo =  function(obj, name, callback) {
    if (!obj) return this;
    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
    var listeningTo = this._listeningTo || (this._listeningTo = {});
    var listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
      listening = listeningTo[id] = {obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0};
    }

    // Bind callbacks on obj, and keep track of them on listening.
    internalOn(obj, name, callback, this, listening);
    return this;
  };

  // The reducing API that adds a callback to the `events` object.
  var onApi = function(events, name, callback, options) {
    if (callback) {
      var handlers = events[name] || (events[name] = []);
      var context = options.context, ctx = options.ctx, listening = options.listening;
      if (listening) listening.count++;

      handlers.push({ callback: callback, context: context, ctx: context || ctx, listening: listening });
    }
    return events;
  };

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `name` is null, removes all bound
  // callbacks for all events.
  Events.off =  function(name, callback, context) {
    if (!this._events) return this;
    this._events = eventsApi(offApi, this._events, name, callback, {
        context: context,
        listeners: this._listeners
    });
    return this;
  };

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  Events.stopListening =  function(obj, name, callback) {
    var listeningTo = this._listeningTo;
    if (!listeningTo) return this;

    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

    for (var i = 0; i < ids.length; i++) {
      var listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) break;

      listening.obj.off(name, callback, this);
    }
    if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

    return this;
  };

  // The reducing API that removes a callback from the `events` object.
  var offApi = function(events, name, callback, options) {
    if (!events) return;

    var i = 0, listening;
    var context = options.context, listeners = options.listeners;

    // Delete all events listeners and "drop" events.
    if (!name && !callback && !context) {
      var ids = _.keys(listeners);
      for (; i < ids.length; i++) {
        listening = listeners[ids[i]];
        delete listeners[listening.id];
        delete listening.listeningTo[listening.objId];
      }
      return;
    }

    var names = name ? [name] : _.keys(events);
    for (; i < names.length; i++) {
      name = names[i];
      var handlers = events[name];

      // Bail out if there are no events stored.
      if (!handlers) break;

      // Replace events if there are any remaining.  Otherwise, clean up.
      var remaining = [];
      for (var j = 0; j < handlers.length; j++) {
        var handler = handlers[j];
        if (
          callback && callback !== handler.callback &&
            callback !== handler.callback._callback ||
              context && context !== handler.context
        ) {
          remaining.push(handler);
        } else {
          listening = handler.listening;
          if (listening && --listening.count === 0) {
            delete listeners[listening.id];
            delete listening.listeningTo[listening.objId];
          }
        }
      }

      // Update tail event if the list has any events.  Otherwise, clean up.
      if (remaining.length) {
        events[name] = remaining;
      } else {
        delete events[name];
      }
    }
    if (_.size(events)) return events;
  };

  // Bind an event to only be triggered a single time. After the first time
  // the callback is invoked, its listener will be removed. If multiple events
  // are passed in using the space-separated syntax, the handler will fire
  // once for each event, not once for a combination of all events.
  Events.once =  function(name, callback, context) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
    return this.on(events, void 0, context);
  };

  // Inversion-of-control versions of `once`.
  Events.listenToOnce =  function(obj, name, callback) {
    // Map the event into a `{event: once}` object.
    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
    return this.listenTo(obj, events);
  };

  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
  // `offer` unbinds the `onceWrapper` after it has been called.
  var onceMap = function(map, name, callback, offer) {
    if (callback) {
      var once = map[name] = _.once(function() {
        offer(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
    }
    return map;
  };

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  Events.trigger =  function(name) {
    if (!this._events) return this;

    var length = Math.max(0, arguments.length - 1);
    var args = Array(length);
    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

    eventsApi(triggerApi, this._events, name, void 0, args);
    return this;
  };

  // Handles triggering the appropriate event callbacks.
  var triggerApi = function(objEvents, name, cb, args) {
    if (objEvents) {
      var events = objEvents[name];
      var allEvents = objEvents.all;
      if (events && allEvents) allEvents = allEvents.slice();
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, [name].concat(args));
    }
    return objEvents;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // The prefix is used to create the client id which is used to identify models locally.
    // You may want to override this if you're experiencing name clashes with model ids.
    cidPrefix: 'c',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Special-cased proxy to underscore's `_.matches` method.
    matches: function(attrs) {
      return !!_.iteratee(attrs, this)(this.attributes);
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      var unset      = options.unset;
      var silent     = options.silent;
      var changes    = [];
      var changing   = this._changing;
      this._changing = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }

      var current = this.attributes;
      var changed = this.changed;
      var prev    = this._previousAttributes;

      // For each `set` attribute, update or delete the current value.
      for (var attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          changed[attr] = val;
        } else {
          delete changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Update the `id`.
      this.id = this.get(this.idAttribute);

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0; i < changes.length; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      var changed = {};
      for (var attr in diff) {
        var val = diff[attr];
        if (_.isEqual(old[attr], val)) continue;
        changed[attr] = val;
      }
      return _.size(changed) ? changed : false;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server, merging the response with the model's
    // local attributes. Any changed attributes will trigger a "change" event.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (!model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      // Handle both `"key", value` and `{key: value}` -style arguments.
      var attrs;
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true, parse: true}, options);
      var wait = options.wait;

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      var attributes = this.attributes;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
        if (serverAttrs && !model.set(serverAttrs, options)) return false;
        if (success) success.call(options.context, model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      // Set temporary attributes if `{wait: true}` to properly find new ids.
      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

      var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch' && !options.attrs) options.attrs = attrs;
      var xhr = this.sync(method, this, options);

      // Restore attributes.
      this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      var wait = options.wait;

      var destroy = function() {
        model.stopListening();
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (wait) destroy();
        if (success) success.call(options.context, model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      var xhr = false;
      if (this.isNew()) {
        _.defer(options.success);
      } else {
        wrapError(this, options);
        xhr = this.sync('delete', this, options);
      }
      if (!wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      var id = this.get(this.idAttribute);
      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.defaults({validate: true}, options));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model, mapped to the
  // number of arguments they take.
  var modelMethods = { keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
      omit: 0, chain: 1, isEmpty: 1 };

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  addUnderscoreMethods(Model, modelMethods, 'attributes');

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analogous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Splices `insert` into `array` at index `at`.
  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    for (var i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model) { return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set. `models` may be Backbone
    // Models or raw JavaScript objects to be converted to Models, or any
    // combination of the two.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      options = _.extend({}, options);
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      var removed = this._removeModels(models, options);
      if (!options.silent && removed) this.trigger('update', this, options);
      return singular ? removed[0] : removed;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      if (models == null) return;

      options = _.defaults({}, options, setOptions);
      if (options.parse && !this._isModel(models)) models = this.parse(models, options);

      var singular = !_.isArray(models);
      models = singular ? [models] : models.slice();

      var at = options.at;
      if (at != null) at = +at;
      if (at < 0) at += this.length + 1;

      var set = [];
      var toAdd = [];
      var toRemove = [];
      var modelMap = {};

      var add = options.add;
      var merge = options.merge;
      var remove = options.remove;

      var sort = false;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      var model;
      for (var i = 0; i < models.length; i++) {
        model = models[i];

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        var existing = this.get(model);
        if (existing) {
          if (merge && model !== existing) {
            var attrs = this._isModel(model) ? model.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
          }
          if (!modelMap[existing.cid]) {
            modelMap[existing.cid] = true;
            set.push(existing);
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(model, options);
          if (model) {
            toAdd.push(model);
            this._addReference(model, options);
            modelMap[model.cid] = true;
            set.push(model);
          }
        }
      }

      // Remove stale models.
      if (remove) {
        for (i = 0; i < this.length; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) toRemove.push(model);
        }
        if (toRemove.length) this._removeModels(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      var orderChanged = false;
      var replace = !sortable && add && remove;
      if (set.length && replace) {
        orderChanged = this.length != set.length || _.some(this.models, function(model, index) {
          return model !== set[index];
        });
        this.models.length = 0;
        splice(this.models, set, 0);
        this.length = this.models.length;
      } else if (toAdd.length) {
        if (sortable) sort = true;
        splice(this.models, toAdd, at == null ? this.length : at);
        this.length = this.models.length;
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0; i < toAdd.length; i++) {
          if (at != null) options.index = at + i;
          model = toAdd[i];
          model.trigger('add', model, this, options);
        }
        if (sort || orderChanged) this.trigger('sort', this, options);
        if (toAdd.length || toRemove.length) this.trigger('update', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options = options ? _.clone(options) : {};
      for (var i = 0; i < this.models.length; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      return this.remove(model, options);
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      return this.remove(model, options);
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
      return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      if (index < 0) index += this.length;
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      return this[first ? 'find' : 'filter'](attrs);
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      var comparator = this.comparator;
      if (!comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      var length = comparator.length;
      if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

      // Run sort based on type of `comparator`.
      if (length === 1 || _.isString(comparator)) {
        this.models = this.sortBy(comparator);
      } else {
        this.models.sort(comparator);
      }
      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = _.extend({parse: true}, options);
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success.call(options.context, collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      var wait = options.wait;
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, callbackOpts) {
        if (wait) collection.add(model, callbackOpts);
        if (success) success.call(callbackOpts.context, model, resp, callbackOpts);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models, {
        model: this.model,
        comparator: this.comparator
      });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function (attrs) {
      return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (this._isModel(attrs)) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method called by both remove and set.
    _removeModels: function(models, options) {
      var removed = [];
      for (var i = 0; i < models.length; i++) {
        var model = this.get(models[i]);
        if (!model) continue;

        var index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;

        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }

        removed.push(model);
        this._removeReference(model, options);
      }
      return removed.length ? removed : false;
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function (model) {
      return model instanceof Model;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      var id = this.modelId(model.attributes);
      if (id != null) this._byId[id] = model;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      delete this._byId[model.cid];
      var id = this.modelId(model.attributes);
      if (id != null) delete this._byId[id];
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (event === 'change') {
        var prevId = this.modelId(model.previousAttributes());
        var id = this.modelId(model.attributes);
        if (prevId !== id) {
          if (prevId != null) delete this._byId[prevId];
          if (id != null) this._byId[id] = model;
        }
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var collectionMethods = { forEach: 3, each: 3, map: 3, collect: 3, reduce: 4,
      foldl: 4, inject: 4, reduceRight: 4, foldr: 4, find: 3, detect: 3, filter: 3,
      select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
      contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
      head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
      without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
      isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
      sortBy: 3, indexBy: 3};

  // Mix in each Underscore method as a proxy to `Collection#models`.
  addUnderscoreMethods(Collection, collectionMethods, 'models');

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be set as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this._removeElement();
      this.stopListening();
      return this;
    },

    // Remove this view's element from the document and all event listeners
    // attached to it. Exposed for subclasses using an alternative DOM
    // manipulation API.
    _removeElement: function() {
      this.$el.remove();
    },

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new element.
    setElement: function(element) {
      this.undelegateEvents();
      this._setElement(element);
      this.delegateEvents();
      return this;
    },

    // Creates the `this.el` and `this.$el` references for this view using the
    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
    // context or an element. Subclasses can override this to utilize an
    // alternative DOM manipulation API and are only required to set the
    // `this.el` property.
    _setElement: function(el) {
      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
      this.el = this.$el[0];
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    delegateEvents: function(events) {
      events || (events = _.result(this, 'events'));
      if (!events) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        var match = key.match(delegateEventSplitter);
        this.delegate(match[1], match[2], _.bind(method, this));
      }
      return this;
    },

    // Add a single event listener to the view's element (or a child element
    // using `selector`). This only works for delegate-able events: not `focus`,
    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
    delegate: function(eventName, selector, listener) {
      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    undelegate: function(eventName, selector, listener) {
      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
      return this;
    },

    // Produces a DOM element to be assigned to your view. Exposed for
    // subclasses using an alternative DOM manipulation API.
    _createElement: function(tagName) {
      return document.createElement(tagName);
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this.setElement(this._createElement(_.result(this, 'tagName')));
        this._setAttributes(attrs);
      } else {
        this.setElement(_.result(this, 'el'));
      }
    },

    // Set attributes from a hash on this view's element.  Exposed for
    // subclasses using an alternative DOM manipulation API.
    _setAttributes: function(attributes) {
      this.$el.attr(attributes);
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // Pass along `textStatus` and `errorThrown` from jQuery.
    var error = options.error;
    options.error = function(xhr, textStatus, errorThrown) {
      options.textStatus = textStatus;
      options.errorThrown = errorThrown;
      if (error) error.call(options.context, xhr, textStatus, errorThrown);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        if (router.execute(callback, args, name) !== false) {
          router.trigger.apply(router, ['route:' + name].concat(args));
          router.trigger('route', name, args);
          Backbone.history.trigger('route', router, name, args);
        }
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args, name) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    this.checkUrl = _.bind(this.checkUrl, this);

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
      return path === this.root && !this.getSearch();
    },

    // Does the pathname match the root?
    matchRoot: function() {
      var path = this.decodeFragment(this.location.pathname);
      var root = path.slice(0, this.root.length - 1) + '/';
      return root === this.root;
    },

    // Unicode characters in `location.pathname` are percent encoded so they're
    // decoded for comparison. `%25` should not be decoded since it may be part
    // of an encoded parameter.
    decodeFragment: function(fragment) {
      return decodeURI(fragment.replace(/%25/g, '%2525'));
    },

    // In IE6, the hash fragment and search params are incorrect if the
    // fragment contains `?`.
    getSearch: function() {
      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
      return match ? match[0] : '';
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the pathname and search params, without the root.
    getPath: function() {
      var path = this.decodeFragment(
        this.location.pathname + this.getSearch()
      ).slice(this.root.length - 1);
      return path.charAt(0) === '/' ? path.slice(1) : path;
    },

    // Get the cross-browser normalized URL fragment from the path or hash.
    getFragment: function(fragment) {
      if (fragment == null) {
        if (this._usePushState || !this._wantsHashChange) {
          fragment = this.getPath();
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error('Backbone.history has already been started');
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.history && this.history.pushState);
      this._usePushState    = this._wantsPushState && this._hasPushState;
      this.fragment         = this.getFragment();

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          var root = this.root.slice(0, -1) || '/';
          this.location.replace(root + '#' + this.getPath());
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot()) {
          this.navigate(this.getHash(), {replace: true});
        }

      }

      // Proxy an iframe to handle location events if the browser doesn't
      // support the `hashchange` event, HTML5 history, or the user wants
      // `hashChange` but not `pushState`.
      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'javascript:0';
        this.iframe.style.display = 'none';
        this.iframe.tabIndex = -1;
        var body = document.body;
        // Using `appendChild` will throw on IE < 9 if the document is not ready.
        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
        iWindow.document.open();
        iWindow.document.close();
        iWindow.location.hash = '#' + this.fragment;
      }

      // Add a cross-platform `addEventListener` shim for older browsers.
      var addEventListener = window.addEventListener || function (eventName, listener) {
        return attachEvent('on' + eventName, listener);
      };

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._usePushState) {
        addEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        addEventListener('hashchange', this.checkUrl, false);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      // Add a cross-platform `removeEventListener` shim for older browsers.
      var removeEventListener = window.removeEventListener || function (eventName, listener) {
        return detachEvent('on' + eventName, listener);
      };

      // Remove window listeners.
      if (this._usePushState) {
        removeEventListener('popstate', this.checkUrl, false);
      } else if (this._useHashChange && !this.iframe) {
        removeEventListener('hashchange', this.checkUrl, false);
      }

      // Clean up the iframe if necessary.
      if (this.iframe) {
        document.body.removeChild(this.iframe);
        this.iframe = null;
      }

      // Some environments will throw when clearing an undefined interval.
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();

      // If the user pressed the back button, the iframe's hash will have
      // changed and we should use that for comparison.
      if (current === this.fragment && this.iframe) {
        current = this.getHash(this.iframe.contentWindow);
      }

      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      // If the root doesn't match, no routes can match either.
      if (!this.matchRoot()) return false;
      fragment = this.fragment = this.getFragment(fragment);
      return _.some(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      // Normalize the fragment.
      fragment = this.getFragment(fragment || '');

      // Don't include a trailing slash on the root.
      var root = this.root;
      if (fragment === '' || fragment.charAt(0) === '?') {
        root = root.slice(0, -1) || '/';
      }
      var url = root + fragment;

      // Strip the hash and decode for matching.
      fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._usePushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getHash(this.iframe.contentWindow))) {
          var iWindow = this.iframe.contentWindow;

          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if (!options.replace) {
            iWindow.document.open();
            iWindow.document.close();
          }

          this._updateHash(iWindow.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent` constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error.call(options.context, model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

define('text!components/list/list.tpl',[],function () { return '<div class="sn-list {{className}}">\r\n    <div class="sn-table">\r\n        <table class="sn-list-table">\r\n            <thead>\r\n                {{#if_checkbox field.boxType compare=\'checkbox\'}}\r\n                <th class="checkAllWraper"><input type="checkbox" /></th>\r\n                {{/if_checkbox}}\r\n                {{#each field.items}}\r\n                {{#if sorting}}\r\n                <th class="{{className}}">\r\n                    {{text}}\r\n                    <a class="sortDown" href="javascript:;"><img src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAKAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9cf2wvFNxeeKNN0zT5NW0u401XkmlQmGO7EgjKMhVssFKuMkDB3Ad69z8DeJo/GHh2HUIdNvtNt5uYY7uNI3dOzhVZsKe2cE4zjBBOT8UtKtdR1Pwqbi2t7gjV1QGSMNhTDKSOexKqceqj0FddXwuQ4bFxz/MKtWs5QvC0bWS926s7u1k7OyXM9X2MYX55H//2Q=="></a>\r\n                    <a class="sortUp" href="javascript:;"><img src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAKAAwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9d/2tvGeveEfFOlNJqSWtjIXlsIbVmV0aPYDJIccsS/GOAOO5J918LxalBoNvHq8lrNqCLtmktwVjkIPDAHoSMZHTOccV538dfD2n+IdX0v8AtCxs77yWZU+0QrJsBKZA3A4zgZ9cCvSdMkZ7KMszMcdSa+FyDL5Us/zGs6spJ+zsm20rxu9L29NFZaLQxhG05M//2Q=="></a>\r\n                </th>\r\n                {{else}}\r\n                <th class="{{className}}">{{text}}</th>\r\n                {{/if}}\r\n                {{/each}}\r\n                {{#if_object field.button compare=\'object\'}}\r\n                <th>操作</th>\r\n                {{/if_object}}\r\n                {{#if field.popupLayer}}\r\n                    {{#if_object field.popupLayer.groups compare=\'object\'}}\r\n                    <th></th>\r\n                    {{/if_object}}\r\n                {{/if}}\r\n\r\n            </thead>\r\n            <tbody></tbody>\r\n        </table>\r\n    </div>\r\n    <div class="sn-listFooter">    \r\n        <!--\r\n        <div class="checkAllContainer">\r\n            <input type="checkbox" />\r\n        </div>\r\n        \r\n        -->\r\n        <div class="buttons btns {{page.button.className}}">\r\n            {{#if_object page.button compare=\'object\'}}\r\n            {{#each page.button.items}}\r\n            <input type="button" value="{{text}}" class="btn btnCustom{{@key}}"/>\r\n            {{/each}}\r\n            {{/if_object}}\r\n        </div>\r\n        <div class="pagination"></div>        \r\n    </div>\r\n    <div class="blockOverlay">\r\n        <div>\r\n            <img src="data:image/gif;base64,R0lGODlhEAAQAPYZAPLy8szMzNXV1c7Ozvr6+t7e3ujo6Obm5vX19eXl5dHR0erq6uDg4NLS0v7+/tjY2OLi4v39/ePj49ra2vj4+P///+zs7O7u7vDw8LnX6g+GzGqu1KXN5DSVz5PD4Im+3gCAzF2o1ROIzHKy2TyZ1WKr1SWM16/T6Ojy9vH3+vr8/Xm22gB/0PT5+06h0lqm00ee1hWJzuXw9+Dt9gmA1X643SmRzsTd7BqG1rTV6WSq28Taq8Xab5jF4XSzxefw7bXRObrY6nq1zFmmzOrx3ByK1a/QIdnp8i+S03az0Obv6+vy4dvnwxOF0wCAy5zIE7zVloe81jOP3bvVirjTd7jTK6XLGuHsze/18Ya74azOKHm10YK94MLdU9Lntcvjl2y24iGM3sfj8/P59cPZjZTI4s7gpOzz7YfD6ITB2Eyk4J7P7Pz+/i2T3pTJ6vH35rfb8bjTR3K45ev1+maz3Vms3rrX5XOyzBqE3LLRF6vNffn797LPd7HT5yCNzQAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUAI/eAAh+QQFAAAZACwAAAAAEAAQAAAFqmAlioQkKBMwriI2BIVlCBArLoGCEIYBMAXH6hAQEACKwKBhSDBGksAjcnktKoSCJGGoUCQThyUQsFQSD0sCAgGoKwYlpjIhK5qSHqTZAEQKShYEe3kLEgcQBAQCOQgRD3l5BlszLw2KjAVwBghsCRYNDwQUDTAVBxIqhhAMBBUISU8JUiMMXAKMAQkVEAETriIOBW1AfoAFETYMaQAGSRI2IxgPCgoPcyshACH5BAUAAAAALAQADgAIAAIAAAYQwFDHk/mIQBsApyPSdDiAIAAh+QQFAAAAACwCAAwADQACAAAGGcDQaGUysUAjQAlEQqlcpdPLdUrBQK4WIAgAIfkEBQAAAAAsAAAKABAAAgAAByGANyU6STtGQEtHRSAuACM+TAAfGzovSgA3TSAhjk5IDoEAIfkEBQAAAAAsAAAIABAAAgAAByKAHxtTVFhLWk9WVylSG1BUUVk6W1BVVk9aSygmIDAAU1CBACH5BAUAAAAALAAABgAQAAIAAAcggDtUAFlONBwAcU9PeWRCOjUfeo54dnuKVmZnfFN3NYEAIfkEBQAAAAAsAAAEABAAAgAAByGAADogHS0cICwfDj9DOhs1AEQ+JCoeiD0APEA7QjolQYEAIfkEBQAAAAAsAgACAAwAAgAABhdAwAcUu81Wq0zIpRqBbLKchkXD1UavIAAh+QQFAAAAACwAAAAAEAAQAAAHxoAAgoIzcjZFanCDi4JwIiB1a2gkcoyCbgBFYjJoaGJ0dWyLaABIczcxgmFoXHSDlSQAJ5cAWHRycqRvaWoAa4K/AHFeaXJgYl5fAJgAil2DX8VoblPRYWIqzwBeWGTR0zVfZGNvQABGRC0k4WRlbnJpZoNGb3NtAL1fZmJg8F5Vcd7MCAOgDgA0aa4sw0XnDAAxRQC44gIgliAwXNC0uQeAIhgAMOYMYlMHDBxQcFoYNGgJDIk1YtxErGRJ0AkSMWLAyMEoEAAh+QQFAAACACwAAAAAEAAQAAAHz4ACgoJHJX4iJH2Di4IcGgIuHis2JYyCHwIxNzMrKxkhLiqLIwI2MjmPAjg1Iy+DOgIdAhyXAj9DOhs1AkQ+JAIegj2CQDtCOiVBO1QCWY0CcYNkxzUfetN4dnvRAmZnfFN31RtTVFhLWgJWVylSG1BUUVk6W1CDWksoJgIwAlNQN0roSLLDCJAlR4pAEjDCBxMBHzboeKFEwI0mAkIwFIBkUIgRK0zs21iJBIpBKlyUOPHCxYkU/VxYEsDggQUABhQEkDBTEIYHChQ8wMAoEAAh+QQFAAADACwCAAwADQACAAAFFSCTGIIQBMkABRPhFBDAFEBUBEU0hAAh+QQFAAACACwAAAoAEAACAAAFGiACQYnVPATVBIVwSICwSBBDCIgSMEISPJUQACH5BAUAAAAALAAACAAQAAIAAAUX4CIdEEEIgYJEj2S4b2IIQ9CYaAEYRggAIfkEBQAAAgAsAAAGABAAAgAABReglQhGMGDCFASKkUiGAbkNEBWmRcxwCAAh+QQFAAACACwAAAQAEAACAAAFGqAgBU90DcFSEYWUGAIlTY4VBJaQPFYCQYAQACH5BAUAAA8ALAIAAgAMAAIAAAQS8K2gEDEGsOJOEASgBENjJEwEADs=">\r\n            <span>加载中...</span>\r\n        </div>\r\n    </div>\r\n</div>';});


define('text!components/list/listTips.tpl',[],function () { return '<div class="sn-list-tip"  >\r\n{{#each this}}\r\n    {{#if this.items.length}}\r\n    <div class="list-items" >\r\n        {{#if title}}<h3>{{{title}}}</h3>{{/if}}\r\n        {{#each items}}\r\n        <div class="clearfix" >\r\n            {{#deal_item this}}\r\n                {{#each this}}\r\n                <div class="list-level" style="width:{{this.width}};" >\r\n                    <label>{{{this.name}}}：</label>\r\n                    <span>{{{this.text}}}</span>\r\n                </div>\r\n                {{/each}}\r\n            {{/deal_item}}\r\n        </div>\r\n        {{/each}}\r\n    </div>\r\n    {{/if}}\r\n{{/each}}\r\n</div>';});


define('text!components/list/noRecord.tpl',[],function () { return '<tr>\r\n    <td colspan="{{colspan}}">\r\n        <div class="sn-norecord">\r\n            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJwAAACcCAYAAACKuMJNAAAKdklEQVR4nO3dbWwb9QHH8a8fkjRu07C084jQ1MLCVJCaSiVoSEOrpZUG1LBJtALx0DFYJeoIjebVWDeqjqLxYm+GNCWdeIHGACms1bS1aGrIwEXLxNZSqenUaFoVuklrWUhLkzZPfrq9sM+9Oi4xtnP/c/z7SKf4Lue7c/LL//Fig4iIiIiIiIiIiIiIiIiIiIiIiEj185X6RMuyKnkd4l29QBToA7rtjT5fadFR4GQh1qoNT3Dx1BvgyEupgfNX6KJEiqLASSG9gJVdnOxtvaUeWFWqFGKt2vBEbuXiqTfIX/eVWKcqcFKI3VEAwNGGs/X5fL7uec8qQrDMC5OlqZtrPVJnyVJyAWVTG05ctRSq1A5gKxAGxoB3gBNGr2hp0TicQ8eJC9PH3zl7hbHpJOFQkK1tTXS0hu5GoVtUpQaumttwG09+MnP89/+cYMf6Fm5trufjiTi/PX0J4LhC503V3IZ78PC/JnlyfQvrVjXQEPSxblUDT21o4Z2zVyBTzYrHVHPgwmPTSdY011+3cW1zPWPTSci06cRjqjlwY+FQkNHLc9dtHP0sTjgUhEwHQjymmgN3pOv2lbx++jNGxmeZS1qMjM/y2vAltrY1Qaa3uqiyo+/2NFDJ0z21ZEn0Uo+cnWRsKkl4eZCutpWu9VKzI/AF76ZwibEhoVrspQKc6GgN3d3RGuri2g/9CLXROy00JLRvyfbOLcuq5aXXcmhpf9zK09vS/vhinn/jRxemrT3vn7dGxmet2UTaGhmftfa8f946fn7KsiyrY7F/BqWq9hLOlOgCd1NEcYzKL4LckNDXVzUA5IaE3vzHZTpaQ1vxaCmnwJWmLxsqoPDdFIt8/qodElLgSrBqwxO5uykunnrDcmx3q9OQGxK6Y/Wy3MYlPSTkgXaU8SXbTnO24dw6910nLkxbz7933jrz6Yw1m0hbZz6dsZ5/z/ttuLLH4TQWRV+2Ol3satTpo7tubrx727pm+kcu0zP4X/pHLrNtXbPnb1woexzOA2NRxjg7CkB+O84NHYCRISHPjMN54JfgGg+8thN4uDQrpJwqtRewnI1myDSis0stVq+ygHJKONNjUVKFygmc6bEoqULlVKndgK/A2JMvu3R7oI0jHlPNtydJFapU4EyMRUkVqvb74cQQz4zDFevQuaSpUy8J29ZW5zS4J65629rgY2T+2fbeCh3yL0DfoXPJtyp0PKkQTwQOiHY9Gb33w5PDFTnYPRvb7z3ymz4ABc5jvNJLrVjYALLHqlRpKRXklcBJjfBKlXqdXx8+VtLznnlwU4WvRCrNROB6gagbvaxta4O1NnYzCQySGQ8dNHwtBZkIXHT1+m8WteOmmwOsXvb54z3jsxbHPknN217sOZaSphXLV266p+OhvbujD9225qsvA3tMX1M+T7fhFgpbsfvUiitXpzgyeIz7Ht3J2XP/+TGw2fQ15fN04MZnF64RL87VWq25sIkrV3nplQPgeJ9erzAxtWU5q7tSOwgy39kzp/nFj54FYHmokX//bfAq0LQY59IHgwhtd67PPZ6angFYYexibkCBE1cpcOIqBU5cpcCJqxS4pc9yLBPAIQyOz3lyLrUYmjddWP5sixdmIlTC1RAvzEQocDXI5ExE1VapTofe/aDgdj9QF4DlQR+BGphyDfgyrzXc6KO+QFHy4clhup7MZOz9v/4dYIurF8gSL+HSwFwKLs9ZpGpgyjVlwWTC4uMraebm30DDPRvbc49NzUQs6cDZ0sBUsgYSl5Wy4NMibnwwoSYCBxAv8Be/lF316B9YzQTOmz/+xZP26AuumcCJNyhw4ioFTlylwNWYQCDzK6+vqzNyfgWuxjz71OOEGpex63uPGDn/kphpkOK98NwuXnhul7Hzq4QTVylw4ioFTlylwNWY/a8cYM03NvPiL828HbMCV2N+9dqbTE3PcOD1fiPnVy+1SIlEgr7eXgYGBrAsi87OTqLd3dSVMJ5VyWN9UalUGoB4IrHo5ypEgStSX18fBw8ezK0fPHiQhoYGntn1xYcYKnmsaqMqtUgDR4/O23b48GHjx6o2Cpy4SoEr0pbOznnburq6jB+r2qgNV6RoNAqWxdFsddjZ2ckPdu40fqwvKhDwk0qljU3eV+37wzn/EfpG/7WV78s19m6Zd940vwLb/8oBXn3zd+x8bDt7d0ehxAxU3UcfiRmavJeaosCJqxQ4cZUCV2M0eS+uMj15r8DVGNOT9wqcuErjcBWSTqc5FosxMDDAmZERJicmWNnczJ133MGWLVvYFIng9+vvW4GrgM8uXeKFvXsZPnVq3vahoSGGhoZob29n//79fKmlxdBVeoP+5MoUj8fp6emZF7Z8w8PD9PT0EI/HXboyb1IJV6b+/n5GR0cB8AcCfPs72/nWA99ldfhmxsc+4YM//YE///Eg6VSK0dFR+vv72bFjh+GrNkclXJmOOm6mfHTXbrY/3U249Rb8gQDh1lvY/nQ3j+7andvn3YEBE5fpGSrhytTW1sbXbrsNgM77H6Cubv5dFJ33P8D5MycBCBq6LcgrFLgy7du3r4i9GvjZiy8u9qVUBVWp4ioFTlylwImrFDhxlQInrlLgxFUKnLhKgRNXKXDiKgVOXKXAiasUOHGVAieuUuDEVSYCN9m0Ynlu5eyZ0wYuQUwx8XZdh77fs+ehI4OlvU2XVM746SFw+e26TJRwfT/54TM0N60wcGoxzUTgBm+/dc3LR996la7Nm1ixPGTgEsQUE1WqbTMQBe4Dmso9mJSkD+gu5YmlVqnGAnfoXLKs59e6bWvN/jtK1QVOqls1dRqkhilw4ioFTlylwImrFDhxlQInrlLgxFUKnLjK+LsnxWIx05dQcyKRiLFzGw9csSKRSBBoBJZlvzYA9dmvddllGZnXVJf9GgQC2f3Ifh/HPrZA3rq9rZ7SxIFU3rZE3rYEYM/vzeY9L5ld7H1ms48TwFx2vzlgJvu9mVgsVhVzhZ4JXCQSaQa+AoSBldllRfZro2VZL6XTadLpNKlUCsuysNcty8qt24+dSzqd+WwC+6u93Za/fqNtxfL5fPOmfvK3Odftdzf3+/257c7Fud3v9+fWA4FAbj0SifyUTAAngClgMruMAf+LxWITJb2YCvNE4CKRyMPJZLI/Ho+TSCRIJpOkUilSqRTJZDIXpGpRTlhL5fP5XvL7/QSDQQKBAIFAgGAwSF1dHfX19UQikUdisdjbrl5Uoess9YkV/IE+PDY21j89PV2p40kBoVCIcDj8SCwWe7sSbbiq/YBe+wfgLOHsks0u5eyqU27MrlqdpVsgEMiVcMFg0BMlnPHAQS50R4PBYCvQAjQDNwEhMjdnNlqW9XM7eM6lUPstv83mrJKdwXU+XqgaXCjwn/cpM/ntN+e+9mO7febclt92y2/HORefz7eHTBvuCjANXCbTnrsEXPBKG84LVWqx/FzroTaS6UEu4/oeqt07tXujDWReYz2ZXqezN+rPft9WqKfKDfYtZA64USrze6jOfe3vpcj0Pq3s9yHTA7V7q86e6mx23xmu9VRdrQJKrVJFRERERERERERERERERETEsP8Dq6HTsxfeQnoAAAAASUVORK5CYII=" alt="暂无信息">\r\n            <p>暂无信息</p>\r\n        </div>\r\n    </td>\r\n</tr>';});

/*! artDialog v6.0.5 | https://github.com/aui/artDialog */
!(function () {

var __modules__ = {};

function require (id) {
    var mod = __modules__[id];
    var exports = 'exports';

    if (typeof mod === 'object') {
        return mod;
    }

    if (!mod[exports]) {
        mod[exports] = {};
        mod[exports] = mod.call(mod[exports], require, mod[exports], mod) || mod[exports];
    }

    return mod[exports];
}

function define (path, fn) {
    __modules__[path] = fn;
}



define("jquery", function () {
	return jQuery;
});


/*!
 * PopupJS
 * Date: 2014-11-09
 * https://github.com/aui/popupjs
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */

define("popup", function (require) {

var $ = require("jquery");

var _count = 0;
var _isIE6 = !('minWidth' in $('html')[0].style);
var _isFixed = !_isIE6;


function Popup () {

    this.destroyed = false;


    this.__popup = $('<div />')
    /*使用 <dialog /> 元素可能导致 z-index 永远置顶的问题(chrome)*/
    .css({
        display: 'none',
        position: 'absolute',
        /*
        left: 0,
        top: 0,
        bottom: 'auto',
        right: 'auto',
        margin: 0,
        padding: 0,
        border: '0 none',
        background: 'transparent'
        */
        outline: 0
    })
    .attr('tabindex', '-1')
    .html(this.innerHTML)
    .appendTo('body');


    this.__backdrop = this.__mask = $('<div />')
    .css({
        opacity: .7,
        background: '#000'
    });


    // 使用 HTMLElement 作为外部接口使用，而不是 jquery 对象
    // 统一的接口利于未来 Popup 移植到其他 DOM 库中
    this.node = this.__popup[0];
    this.backdrop = this.__backdrop[0];

    _count ++;
}


$.extend(Popup.prototype, {
    
    /**
     * 初始化完毕事件，在 show()、showModal() 执行
     * @name Popup.prototype.onshow
     * @event
     */

    /**
     * 关闭事件，在 close() 执行
     * @name Popup.prototype.onclose
     * @event
     */

    /**
     * 销毁前事件，在 remove() 前执行
     * @name Popup.prototype.onbeforeremove
     * @event
     */

    /**
     * 销毁事件，在 remove() 执行
     * @name Popup.prototype.onremove
     * @event
     */

    /**
     * 重置事件，在 reset() 执行
     * @name Popup.prototype.onreset
     * @event
     */

    /**
     * 焦点事件，在 foucs() 执行
     * @name Popup.prototype.onfocus
     * @event
     */

    /**
     * 失焦事件，在 blur() 执行
     * @name Popup.prototype.onblur
     * @event
     */

    /** 浮层 DOM 素节点[*] */
    node: null,

    /** 遮罩 DOM 节点[*] */
    backdrop: null,

    /** 是否开启固定定位[*] */
    fixed: false,

    /** 判断对话框是否删除[*] */
    destroyed: true,

    /** 判断对话框是否显示 */
    open: false,

    /** close 返回值 */
    returnValue: '',

    /** 是否自动聚焦 */
    autofocus: true,

    /** 对齐方式[*] */
    align: 'bottom left',

    /** 内部的 HTML 字符串 */
    innerHTML: '',

    /** CSS 类名 */
    className: 'ui-popup',

    /**
     * 显示浮层
     * @param   {HTMLElement, Event}  指定位置（可选）
     */
    show: function (anchor) {

        if (this.destroyed) {
            return this;
        }

        var that = this;
        var popup = this.__popup;
        var backdrop = this.__backdrop;

        this.__activeElement = this.__getActive();

        this.open = true;
        this.follow = anchor || this.follow;


        // 初始化 show 方法
        if (!this.__ready) {

            popup
            .addClass(this.className)
            .attr('role', this.modal ? 'alertdialog' : 'dialog')
            .css('position', this.fixed ? 'fixed' : 'absolute');

            if (!_isIE6) {
                $(window).on('resize', $.proxy(this.reset, this));
            }

            // 模态浮层的遮罩
            if (this.modal) {
                var backdropCss = {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    userSelect: 'none',
                    zIndex: this.zIndex || Popup.zIndex
                };


                popup.addClass(this.className + '-modal');


                if (!_isFixed) {
                    $.extend(backdropCss, {
                        position: 'absolute',
                        width: $(window).width() + 'px',
                        height: $(document).height() + 'px'
                    });
                }


                backdrop
                .css(backdropCss)
                .attr({tabindex: '0'})
                .on('focus', $.proxy(this.focus, this));

                // 锁定 tab 的焦点操作
                this.__mask = backdrop
                .clone(true)
                .attr('style', '')
                .insertAfter(popup);

                backdrop
                .addClass(this.className + '-backdrop')
                .insertBefore(popup);

                this.__ready = true;
            }


            if (!popup.html()) {
                popup.html(this.innerHTML);
            }
        }


        popup
        .addClass(this.className + '-show')
        .show();

        backdrop.show();


        this.reset().focus();
        this.__dispatchEvent('show');

        return this;
    },


    /** 显示模态浮层。参数参见 show() */
    showModal: function () {
        this.modal = true;
        return this.show.apply(this, arguments);
    },
    
    
    /** 关闭浮层 */
    close: function (result) {
        
        if (!this.destroyed && this.open) {
            
            if (result !== undefined) {
                this.returnValue = result;
            }
            
            this.__popup.hide().removeClass(this.className + '-show');
            this.__backdrop.hide();
            this.open = false;
            this.blur();// 恢复焦点，照顾键盘操作的用户
            this.__dispatchEvent('close');
        }
    
        return this;
    },


    /** 销毁浮层 */
    remove: function () {

        if (this.destroyed) {
            return this;
        }

        this.__dispatchEvent('beforeremove');
        
        if (Popup.current === this) {
            Popup.current = null;
        }


        // 从 DOM 中移除节点
        this.__popup.remove();
        this.__backdrop.remove();
        this.__mask.remove();


        if (!_isIE6) {
            $(window).off('resize', this.reset);
        }


        this.__dispatchEvent('remove');

        for (var i in this) {
            delete this[i];
        }

        return this;
    },


    /** 重置位置 */
    reset: function () {

        var elem = this.follow;

        if (elem) {
            this.__follow(elem);
        } else {
            this.__center();
        }

        this.__dispatchEvent('reset');

        return this;
    },


    /** 让浮层获取焦点 */
    focus: function () {

        var node = this.node;
        var popup = this.__popup;
        var current = Popup.current;
        var index = this.zIndex = Popup.zIndex ++;

        if (current && current !== this) {
            current.blur(false);
        }

        // 检查焦点是否在浮层里面
        if (!$.contains(node, this.__getActive())) {
            var autofocus = popup.find('[autofocus]')[0];

            if (!this._autofocus && autofocus) {
                this._autofocus = true;
            } else {
                autofocus = node;
            }

            this.__focus(autofocus);
        }

        // 设置叠加高度
        popup.css('zIndex', index);
        //this.__backdrop.css('zIndex', index);

        Popup.current = this;
        popup.addClass(this.className + '-focus');

        this.__dispatchEvent('focus');

        return this;
    },


    /** 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户 */
    blur: function () {

        var activeElement = this.__activeElement;
        var isBlur = arguments[0];


        if (isBlur !== false) {
            this.__focus(activeElement);
        }

        this._autofocus = false;
        this.__popup.removeClass(this.className + '-focus');
        this.__dispatchEvent('blur');

        return this;
    },


    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    addEventListener: function (type, callback) {
        this.__getEventListener(type).push(callback);
        return this;
    },


    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    removeEventListener: function (type, callback) {
        var listeners = this.__getEventListener(type);
        for (var i = 0; i < listeners.length; i ++) {
            if (callback === listeners[i]) {
                listeners.splice(i--, 1);
            }
        }
        return this;
    },


    // 获取事件缓存
    __getEventListener: function (type) {
        var listener = this.__listener;
        if (!listener) {
            listener = this.__listener = {};
        }
        if (!listener[type]) {
            listener[type] = [];
        }
        return listener[type];
    },


    // 派发事件
    __dispatchEvent: function (type) {
        var listeners = this.__getEventListener(type);

        if (this['on' + type]) {
            this['on' + type]();
        }

        for (var i = 0; i < listeners.length; i ++) {
            listeners[i].call(this);
        }
    },


    // 对元素安全聚焦
    __focus: function (elem) {
        // 防止 iframe 跨域无权限报错
        // 防止 IE 不可见元素报错
        try {
            // ie11 bug: iframe 页面点击会跳到顶部
            if (this.autofocus && !/^iframe$/i.test(elem.nodeName)) {
                elem.focus();
            }
        } catch (e) {}
    },


    // 获取当前焦点的元素
    __getActive: function () {
        try {// try: ie8~9, iframe #26
            var activeElement = document.activeElement;
            var contentDocument = activeElement.contentDocument;
            var elem = contentDocument && contentDocument.activeElement || activeElement;
            return elem;
        } catch (e) {}
    },


    // 居中浮层
    __center: function () {
    
        var popup = this.__popup;
        var $window = $(window);
        var $document = $(document);
        var fixed = this.fixed;
        var dl = fixed ? 0 : $document.scrollLeft();
        var dt = fixed ? 0 : $document.scrollTop();
        var ww = $window.width();
        var wh = $window.height();
        var ow = popup.width();
        var oh = popup.height();
        var left = (ww - ow) / 2 + dl;
        var top = (wh - oh) * 382 / 1000 + dt;// 黄金比例
        var style = popup[0].style;

        
        style.left = Math.max(parseInt(left), dl) + 'px';
        style.top = Math.max(parseInt(top), dt) + 'px';
    },
    
    
    // 指定位置 @param    {HTMLElement, Event}  anchor
    __follow: function (anchor) {
        
        var $elem = anchor.parentNode && $(anchor);
        var popup = this.__popup;
        

        if (this.__followSkin) {
            popup.removeClass(this.__followSkin);
        }


        // 隐藏元素不可用
        if ($elem) {
            var o = $elem.offset();
            if (o.left * o.top < 0) {
                return this.__center();
            }
        }
        
        var that = this;
        var fixed = this.fixed;

        var $window = $(window);
        var $document = $(document);
        var winWidth = $window.width();
        var winHeight = $window.height();
        var docLeft =  $document.scrollLeft();
        var docTop = $document.scrollTop();


        var popupWidth = popup.width();
        var popupHeight = popup.height();
        var width = $elem ? $elem.outerWidth() : 0;
        var height = $elem ? $elem.outerHeight() : 0;
        var offset = this.__offset(anchor);
        var x = offset.left;
        var y = offset.top;
        var left =  fixed ? x - docLeft : x;
        var top = fixed ? y - docTop : y;


        var minLeft = fixed ? 0 : docLeft;
        var minTop = fixed ? 0 : docTop;
        var maxLeft = minLeft + winWidth - popupWidth;
        var maxTop = minTop + winHeight - popupHeight;


        var css = {};
        var align = this.align.split(' ');
        var className = this.className + '-';
        var reverse = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'};
        var name = {top: 'top', bottom: 'top', left: 'left', right: 'left'};


        var temp = [{
            top: top - popupHeight,
            bottom: top + height,
            left: left - popupWidth,
            right: left + width
        }, {
            top: top,
            bottom: top - popupHeight + height,
            left: left,
            right: left - popupWidth + width
        }];


        var center = {
            left: left + width / 2 - popupWidth / 2,
            top: top + height / 2 - popupHeight / 2
        };

        
        var range = {
            left: [minLeft, maxLeft],
            top: [minTop, maxTop]
        };


        // 超出可视区域重新适应位置
        $.each(align, function (i, val) {

            // 超出右或下边界：使用左或者上边对齐
            if (temp[i][val] > range[name[val]][1]) {
                val = align[i] = reverse[val];
            }

            // 超出左或右边界：使用右或者下边对齐
            if (temp[i][val] < range[name[val]][0]) {
                align[i] = reverse[val];
            }

        });


        // 一个参数的情况
        if (!align[1]) {
            name[align[1]] = name[align[0]] === 'left' ? 'top' : 'left';
            temp[1][align[1]] = center[name[align[1]]];
        }


        //添加follow的css, 为了给css使用
        className += align.join('-') + ' '+ this.className+ '-follow';
        
        that.__followSkin = className;


        if ($elem) {
            popup.addClass(className);
        }

        
        css[name[align[0]]] = parseInt(temp[0][align[0]]);
        css[name[align[1]]] = parseInt(temp[1][align[1]]);
        popup.css(css);

    },


    // 获取元素相对于页面的位置（包括iframe内的元素）
    // 暂时不支持两层以上的 iframe 套嵌
    __offset: function (anchor) {

        var isNode = anchor.parentNode;
        var offset = isNode ? $(anchor).offset() : {
            left: anchor.pageX,
            top: anchor.pageY
        };


        anchor = isNode ? anchor : anchor.target;
        var ownerDocument = anchor.ownerDocument;
        var defaultView = ownerDocument.defaultView || ownerDocument.parentWindow;
        
        if (defaultView == window) {// IE <= 8 只能使用两个等于号
            return offset;
        }

        // {Element: Ifarme}
        var frameElement = defaultView.frameElement;
        var $ownerDocument = $(ownerDocument);
        var docLeft =  $ownerDocument.scrollLeft();
        var docTop = $ownerDocument.scrollTop();
        var frameOffset = $(frameElement).offset();
        var frameLeft = frameOffset.left;
        var frameTop = frameOffset.top;
        
        return {
            left: offset.left + frameLeft - docLeft,
            top: offset.top + frameTop - docTop
        };
    }
    
});


/** 当前叠加高度 */
Popup.zIndex = 1024;


/** 顶层浮层的实例 */
Popup.current = null;


return Popup;

});

// artDialog - 默认配置
define("dialog-config", {

    /* -----已注释的配置继承自 popup.js，仍可以再这里重新定义它----- */

    // 对齐方式
    //align: 'bottom left',
    
    // 是否固定定位
    //fixed: false,
    
    // 对话框叠加高度值(重要：此值不能超过浏览器最大限制)
    //zIndex: 1024,

    // 设置遮罩背景颜色
    backdropBackground: '#000',

    // 设置遮罩透明度
    backdropOpacity: 0.7,

    // 消息内容
    content: '<span class="ui-dialog-loading">Loading..</span>',
    
    // 标题
    title: '',

    // 对话框状态栏区域 HTML 代码
    statusbar: '',
    
    // 自定义按钮
    button: null,
    
    // 确定按钮回调函数
    ok: null,
    
    // 取消按钮回调函数
    cancel: null,

    // 确定按钮文本
    okValue: 'ok',
    
    // 取消按钮文本
    cancelValue: '关闭',

    cancelDisplay: true,
    
    // 内容宽度
    width: '',
    
    // 内容高度
    height: '',
    
    // 内容与边界填充距离
    padding: '',
    
    // 对话框自定义 className
    skin: '',

    // 是否支持快捷关闭（点击遮罩层自动关闭）
    quickClose: false,

    // css 文件路径，留空则不会使用 js 自动加载样式
    // 注意：css 只允许加载一个
    cssUri: '../css/ui-dialog.css',

    // 模板（使用 table 解决 IE7 宽度自适应的 BUG）
    // js 使用 i="***" 属性识别结构，其余的均可自定义
    innerHTML:
        '<div i="dialog" class="ui-dialog">'
        +       '<div class="ui-dialog-arrow-a"></div>'
        +       '<div class="ui-dialog-arrow-b"></div>'
        +       '<table class="ui-dialog-grid">'
        +           '<tr>'
        +               '<td i="header" class="ui-dialog-header">'
        +                   '<button i="close" class="ui-dialog-close">&#215;</button>'
        +                   '<div i="title" class="ui-dialog-title"></div>'
        +               '</td>'
        +           '</tr>'
        +           '<tr>'
        +               '<td i="body" class="ui-dialog-body">'
        +                   '<div i="content" class="ui-dialog-content"></div>'
        +               '</td>'
        +           '</tr>'
        +           '<tr>'
        +               '<td i="footer" class="ui-dialog-footer">'
        +                   '<div i="statusbar" class="ui-dialog-statusbar"></div>'
        +                   '<div i="button" class="ui-dialog-button"></div>'
        +               '</td>'
        +           '</tr>'
        +       '</table>'
        +'</div>'
    
});

/*!
 * artDialog
 * Date: 2014-11-09
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("dialog", function (require) {

var $ = require("jquery");
var Popup = require("popup");
var defaults = require("dialog-config");
var css = defaults.cssUri;


// css loader: RequireJS & SeaJS
if (css) {
    var fn = require[require.toUrl ? 'toUrl' : 'resolve'];
    if (fn) {
        css = fn(css);
        css = '<link rel="stylesheet" href="' + css + '" />';
        if ($('base')[0]) {
            $('base').before(css);
        } else {
            $('head').append(css);
        } 
    }
}


var _count = 0;
var _expando = new Date() - 0; // Date.now()
var _isIE6 = !('minWidth' in $('html')[0].style);
var _isMobile = 'createTouch' in document && !('onmousemove' in document)
    || /(iPhone|iPad|iPod)/i.test(navigator.userAgent);
var _isFixed = !_isIE6 && !_isMobile;


var artDialog = function (options, ok, cancel) {

    var originalOptions = options = options || {};
    

    if (typeof options === 'string' || options.nodeType === 1) {
    
        options = {content: options, fixed: !_isMobile};
    }
    

    options = $.extend(true, {}, artDialog.defaults, options);
    options.original = originalOptions;

    var id = options.id = options.id || _expando + _count;
    var api = artDialog.get(id);
    
    
    // 如果存在同名的对话框对象，则直接返回
    if (api) {
        return api.focus();
    }
    
    
    // 目前主流移动设备对fixed支持不好，禁用此特性
    if (!_isFixed) {
        options.fixed = false;
    }


    // 快捷关闭支持：点击对话框外快速关闭对话框
    if (options.quickClose) {
        options.modal = true;
        options.backdropOpacity = 0;
    }
    

    // 按钮组
    if (!$.isArray(options.button)) {
        options.button = [];
    }

    // 确定按钮
    if (ok !== undefined) {
        options.ok = ok;
    }
    
    if (options.ok) {
        options.button.push({
            id: 'ok',
            value: options.okValue,
            callback: options.ok,
            autofocus: true
        });
    }
    
    // 取消按钮
    if (cancel !== undefined) {
        options.cancel = cancel;
    }
    
    if (options.cancel) {
        options.button.push({
            id: 'cancel',
            value: options.cancelValue,
            callback: options.cancel,
            display: options.cancelDisplay
        });
    }
    

    return artDialog.list[id] = new artDialog.create(options);
};

var popup = function () {};
popup.prototype = Popup.prototype;
var prototype = artDialog.prototype = new popup();

artDialog.create = function (options) {
    var that = this;

    $.extend(this, new Popup());

    var originalOptions = options.original;
    var $popup = $(this.node).html(options.innerHTML);
    var $backdrop = $(this.backdrop);

    this.options = options;
    this._popup = $popup;

    
    $.each(options, function (name, value) {
        if (typeof that[name] === 'function') {
            that[name](value);
        } else {
            that[name] = value;
        }
    });


    // 更新 zIndex 全局配置
    if (options.zIndex) {
        Popup.zIndex = options.zIndex;
    }


    // 设置 ARIA 信息
    $popup.attr({
        'aria-labelledby': this._$('title')
            .attr('id', 'title:' + this.id).attr('id'),
        'aria-describedby': this._$('content')
            .attr('id', 'content:' + this.id).attr('id')
    });


    // 关闭按钮
    this._$('close')
    .css('display', this.cancel === false ? 'none' : '')
    .attr('title', this.cancelValue)
    .on('click', function (event) {
        that._trigger('cancel');
        event.preventDefault();
    });
    

    // 添加视觉参数
    this._$('dialog').addClass(this.skin);
    this._$('body').css('padding', this.padding);


    // 点击任意空白处关闭对话框
    if (options.quickClose) {
        $backdrop
        .on(
            'onmousedown' in document ? 'mousedown' : 'click',
            function () {
            that._trigger('cancel');
            return false;// 阻止抢夺焦点
        });
    }


    // 遮罩设置
    this.addEventListener('show', function () {
        $backdrop.css({
            opacity: 0,
            background: options.backdropBackground
        }).animate(
            {opacity: options.backdropOpacity}
        , 150);
    });


    // ESC 快捷键关闭对话框
    this._esc = function (event) {
        var target = event.target;
        var nodeName = target.nodeName;
        var rinput = /^input|textarea$/i;
        var isTop = Popup.current === that;
        var keyCode = event.keyCode;

        // 避免输入状态中 ESC 误操作关闭
        if (!isTop || rinput.test(nodeName) && target.type !== 'button') {
            return;
        }
        
        if (keyCode === 27) {
            that._trigger('cancel');
        }
    };

    $(document).on('keydown', this._esc);
    this.addEventListener('remove', function () {
        $(document).off('keydown', this._esc);
        delete artDialog.list[this.id];
    });


    _count ++;
    
    artDialog.oncreate(this);

    return this;
};


artDialog.create.prototype = prototype;



$.extend(prototype, {

    /**
     * 显示对话框
     * @name artDialog.prototype.show
     * @param   {HTMLElement Object, Event Object}  指定位置（可选）
     */
    
    /**
     * 显示对话框（模态）
     * @name artDialog.prototype.showModal
     * @param   {HTMLElement Object, Event Object}  指定位置（可选）
     */

    /**
     * 关闭对话框
     * @name artDialog.prototype.close
     * @param   {String, Number}    返回值，可被 onclose 事件收取（可选）
     */

    /**
     * 销毁对话框
     * @name artDialog.prototype.remove
     */

    /**
     * 重置对话框位置
     * @name artDialog.prototype.reset
     */

    /**
     * 让对话框聚焦（同时置顶）
     * @name artDialog.prototype.focus
     */

    /**
     * 让对话框失焦（同时置顶）
     * @name artDialog.prototype.blur
     */

    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     * @name artDialog.prototype.addEventListener
     */

    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     * @name artDialog.prototype.removeEventListener
     */

    /**
     * 对话框显示事件，在 show()、showModal() 执行
     * @name artDialog.prototype.onshow
     * @event
     */

    /**
     * 关闭事件，在 close() 执行
     * @name artDialog.prototype.onclose
     * @event
     */

    /**
     * 销毁前事件，在 remove() 前执行
     * @name artDialog.prototype.onbeforeremove
     * @event
     */

    /**
     * 销毁事件，在 remove() 执行
     * @name artDialog.prototype.onremove
     * @event
     */

    /**
     * 重置事件，在 reset() 执行
     * @name artDialog.prototype.onreset
     * @event
     */

    /**
     * 焦点事件，在 foucs() 执行
     * @name artDialog.prototype.onfocus
     * @event
     */

    /**
     * 失焦事件，在 blur() 执行
     * @name artDialog.prototype.onblur
     * @event
     */

    
    /**
     * 设置内容
     * @param    {String, HTMLElement}   内容
     */
    content: function (html) {
    
        var $content = this._$('content');

        // HTMLElement
        if (typeof html === 'object') {
            html = $(html);
            $content.empty('').append(html.show());
            this.addEventListener('beforeremove', function () {
                $('body').append(html.hide());
            });
        // String
        } else {
            $content.html(html);
        }
                
        return this.reset();
    },
    
    
    /**
     * 设置标题
     * @param    {String}   标题内容
     */
    title: function (text) {
        this._$('title').text(text);
        this._$('header')[text ? 'show' : 'hide']();
        return this;
    },


    /** 设置宽度 */
    width: function (value) {
        this._$('content').css('width', value);
        return this.reset();
    },


    /** 设置高度 */
    height: function (value) {
        this._$('content').css('height', value);
        return this.reset();
    },


    /**
     * 设置按钮组
     * @param   {Array, String}
     * Options: value, callback, autofocus, disabled 
     */
    button: function (args) {
        args = args || [];
        var that = this;
        var html = '';
        var number = 0;
        this.callbacks = {};
        
           
        if (typeof args === 'string') {
            html = args;
            number ++;
        } else {
            $.each(args, function (i, val) {

                var id = val.id = val.id || val.value;
                var style = '';
                that.callbacks[id] = val.callback;


                if (val.display === false) {
                    style = ' style="display:none"';
                } else {
                    number ++;
                }

                html +=
                  '<button'
                + ' type="button"'
                + ' i-id="' + id + '"'
                + style
                + (val.disabled ? ' disabled' : '')
                + (val.autofocus ? ' autofocus class="ui-dialog-autofocus"' : '')
                + '>'
                +   val.value
                + '</button>';

                that._$('button')
                .on('click', '[i-id=' + id +']', function (event) {                
                    var $this = $(this);
                    if (!$this.attr('disabled')) {// IE BUG
                        that._trigger(id);
                    }
                
                    event.preventDefault();
                });

            });
        }

        this._$('button').html(html);
        this._$('footer')[number ? 'show' : 'hide']();

        return this;
    },


    statusbar: function (html) {
        this._$('statusbar')
        .html(html)[html ? 'show' : 'hide']();

        return this;
    },


    _$: function (i) {
        return this._popup.find('[i=' + i + ']');
    },
    
    
    // 触发按钮回调函数
    _trigger: function (id) {
        var fn = this.callbacks[id];
            
        return typeof fn !== 'function' || fn.call(this) !== false ?
            this.close().remove() : this;
    }
    
});



artDialog.oncreate = $.noop;



/** 获取最顶层的对话框API */
artDialog.getCurrent = function () {
    return Popup.current;
};



/**
 * 根据 ID 获取某对话框 API
 * @param    {String}    对话框 ID
 * @return   {Object}    对话框 API (实例)
 */
artDialog.get = function (id) {
    return id === undefined
    ? artDialog.list
    : artDialog.list[id];
};

artDialog.list = {};



/**
 * 默认配置
 */
artDialog.defaults = defaults;



return artDialog;

});




/*!
 * drag.js
 * Date: 2013-12-06
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("drag", function (require) {

var $ = require("jquery");


var $window = $(window);
var $document = $(document);
var isTouch = 'createTouch' in document;
var html = document.documentElement;
var isIE6 = !('minWidth' in html.style);
var isLosecapture = !isIE6 && 'onlosecapture' in html;
var isSetCapture = 'setCapture' in html;


var types = {
    start: isTouch ? 'touchstart' : 'mousedown',
    over: isTouch ? 'touchmove' : 'mousemove',
    end: isTouch ? 'touchend' : 'mouseup'
};


var getEvent = isTouch ? function (event) {
    if (!event.touches) {
        event = event.originalEvent.touches.item(0);
    }
    return event;
} : function (event) {
    return event;
};


var DragEvent = function () {
    this.start = $.proxy(this.start, this);
    this.over = $.proxy(this.over, this);
    this.end = $.proxy(this.end, this);
    this.onstart = this.onover = this.onend = $.noop;
};

DragEvent.types = types;

DragEvent.prototype = {

    start: function (event) {
        event = this.startFix(event);

        $document
        .on(types.over, this.over)
        .on(types.end, this.end);
        
        this.onstart(event);
        return false;
    },

    over: function (event) {
        event = this.overFix(event);
        this.onover(event);
        return false;
    },

    end: function (event) {
        event = this.endFix(event);

        $document
        .off(types.over, this.over)
        .off(types.end, this.end);

        this.onend(event);
        return false;
    },

    startFix: function (event) {
        event = getEvent(event);

        this.target = $(event.target);
        this.selectstart = function () {
            return false;
        };

        $document
        .on('selectstart', this.selectstart)
        .on('dblclick', this.end);

        if (isLosecapture) {
            this.target.on('losecapture', this.end);
        } else {
            $window.on('blur', this.end);
        }

        if (isSetCapture) {
            this.target[0].setCapture();
        }

        return event;
    },

    overFix: function (event) {
        event = getEvent(event);
        return event;
    },

    endFix: function (event) {
        event = getEvent(event);

        $document
        .off('selectstart', this.selectstart)
        .off('dblclick', this.end);

        if (isLosecapture) {
            this.target.off('losecapture', this.end);
        } else {
            $window.off('blur', this.end);
        }

        if (isSetCapture) {
            this.target[0].releaseCapture();
        }

        return event;
    }
    
};


/**
 * 启动拖拽
 * @param   {HTMLElement}   被拖拽的元素
 * @param   {Event} 触发拖拽的事件对象。可选，若无则监听 elem 的按下事件启动
 */
DragEvent.create = function (elem, event) {
    var $elem = $(elem);
    var dragEvent = new DragEvent();
    var startType = DragEvent.types.start;
    var noop = function () {};
    var className = elem.className
        .replace(/^\s|\s.*/g, '') + '-drag-start';

    var minX;
    var minY;
    var maxX;
    var maxY;

    var api = {
        onstart: noop,
        onover: noop,
        onend: noop,
        off: function () {
            $elem.off(startType, dragEvent.start);
        }
    };


    dragEvent.onstart = function (event) {
        var isFixed = $elem.css('position') === 'fixed';
        var dl = $document.scrollLeft();
        var dt = $document.scrollTop();
        var w = $elem.width();
        var h = $elem.height();

        minX = 0;
        minY = 0;
        maxX = isFixed ? $window.width() - w + minX : $document.width() - w;
        maxY = isFixed ? $window.height() - h + minY : $document.height() - h;

        var offset = $elem.offset();
        var left = this.startLeft = isFixed ? offset.left - dl : offset.left;
        var top = this.startTop = isFixed ? offset.top - dt  : offset.top;

        this.clientX = event.clientX;
        this.clientY = event.clientY;

        $elem.addClass(className);
        api.onstart.call(elem, event, left, top);
    };
    

    dragEvent.onover = function (event) {
        var left = event.clientX - this.clientX + this.startLeft;
        var top = event.clientY - this.clientY + this.startTop;
        var style = $elem[0].style;

        left = Math.max(minX, Math.min(maxX, left));
        top = Math.max(minY, Math.min(maxY, top));

        style.left = left + 'px';
        style.top = top + 'px';
        
        api.onover.call(elem, event, left, top);
    };
    

    dragEvent.onend = function (event) {
        var position = $elem.position();
        var left = position.left;
        var top = position.top;
        $elem.removeClass(className);
        api.onend.call(elem, event, left, top);
    };


    dragEvent.off = function () {
        $elem.off(startType, dragEvent.start);
    };


    if (event) {
        dragEvent.start(event);
    } else {
        $elem.on(startType, dragEvent.start);
    }

    return api;
};

return DragEvent;

});

/*!
 * artDialog-plus
 * Date: 2013-11-09
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("dialog-plus", function (require) {

var $ = require("jquery");
var dialog = require("dialog");
var drag = require("drag");

dialog.oncreate = function (api) {

    var options = api.options;
    var originalOptions = options.original;

    // 页面地址
    var url = options.url;
    // 页面加载完毕的事件
    var oniframeload = options.oniframeload;

    var $iframe;


    if (url) {
        this.padding = options.padding = 0;

        $iframe = $('<iframe />');

        $iframe.attr({
            src: url,
            name: api.id,
            width: '100%',
            height: '100%',
            allowtransparency: 'yes',
            frameborder: 'no',
            scrolling: 'auto',
            style:'display:block'
        })
        .on('load', function () {
            var test;
            
            try {
                // 跨域测试
                test = $iframe[0].contentWindow.frameElement;
            } catch (e) {}

            if (test) {

                if (!options.width) {
                    api.width($iframe.contents().width());
                }
                
                if (!options.height) {
                    api.height($iframe.contents().height());
                }
            }

            if (oniframeload) {
                oniframeload.call(api);
            }

        });

        api.addEventListener('beforeremove', function () {

            // 重要！需要重置iframe地址，否则下次出现的对话框在IE6、7无法聚焦input
            // IE删除iframe后，iframe仍然会留在内存中出现上述问题，置换src是最容易解决的方法
            $iframe.attr('src', 'about:blank').remove();


        }, false);

        api.content($iframe[0]);

        api.iframeNode = $iframe[0];

    }


    // 对于子页面呼出的对话框特殊处理
    // 如果对话框配置来自 iframe
    if (!(originalOptions instanceof Object)) {

        var un = function () {
            api.close().remove();
        };

        // 找到那个 iframe
        for (var i = 0; i < frames.length; i ++) {
            try {
                if (originalOptions instanceof frames[i].Object) {
                    // 让 iframe 刷新的时候也关闭对话框，
                    // 防止要执行的对象被强制收回导致 IE 报错：“不能执行已释放 Script 的代码”
                    $(frames[i]).one('unload', un);
                    break;
                }
            } catch (e) {} 
        }
    }


    // 拖拽支持
    $(api.node).on(drag.types.start, '[i=title]', function (event) {
        // 排除气泡类型的对话框
        if (!api.follow) {
            api.focus();
            drag.create(api.node, event);
        }
    });

};



dialog.get = function (id) {

    // 从 iframe 传入 window 对象
    if (id && id.frameElement) {
        var iframe = id.frameElement;
        var list = dialog.list;
        var api;
        for (var i in list) {
            api = list[i];
            if (api.node.getElementsByTagName('iframe')[0] === iframe) {
                return api;
            }
        }
    // 直接传入 id 的情况
    } else if (id) {
        return dialog.list[id];
    }

};



return dialog;

});


window.dialog = require("dialog-plus");

})();
define("artDialog", ["jquery"], function(){});


define('lib/requirejs/css.min!components/list/list',[],function(){});

define('lib/requirejs/css.min!lib/dialog/6.0.4/css/ui-dialog',[],function(){});
/**
 * 2013-7-13 修改。第一次加载时，不调用2次。 by shandl
 _page.pagination( json.total , {  
    'items_per_page'      : pageParams.items_per_page,  
    'num_display_entries' : 10,  
    'num_edge_entries'    : 2,  
    'link_to': '#tradeRecordsIndex' ,
    'prev_text'           : "上一页",  
    'next_text'           : "下一页",  
    'call_callback_at_once' : false,  //控制分页控件第一次不触发callback.
    'callback'            : function(page_index, jq){  
								getDataList(page_index , false , pageParams );  
							}  
});  
 * 
 * This jQuery plugin displays pagination links inside the selected elements.
 *
 * @author Gabriel Birke (birke *at* d-scribe *dot* de)
 * @version 1.2
 * @param {int} maxentries Number of entries to paginate
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 */
jQuery.fn.pagination = function(maxentries, opts){
	opts = jQuery.extend({
		items_per_page:10,
		num_display_entries:10,
		current_page:0,
		skip_page:false,//add by  zhanglizhao
		num_edge_entries:0,
		link_to:"#",
		total:false,
		prev_text:"Prev",
		next_text:"Next",
		ellipse_text:"...",
		prev_show_always:true,
		next_show_always:true,
		call_callback_at_once : true,
		callback:function(){return false;}
	},opts||{});
	var objBase = {}
		/**
		 * Calculate the maximum number of pages
		 */
		function numPages() {
			return Math.ceil(maxentries/opts.items_per_page);
		}
		
		/**
		 * Calculate start and end point of pagination links depending on 
		 * current_page and num_display_entries.
		 * @return {Array}
		 */
		function getInterval()  {
			var ne_half = Math.ceil(opts.num_display_entries/2);
			var np = numPages();
			var upper_limit = np-opts.num_display_entries;
			var start = current_page>ne_half?Math.max(Math.min(current_page-ne_half, upper_limit), 0):0;
			var end = current_page>ne_half?Math.min(current_page+ne_half, np):Math.min(opts.num_display_entries, np);
			return [start,end];
		}
		
		/**
		 * This is the event handling function for the pagination links. 
		 * @param {int} page_id The new page number
		 */
		function pageSelected(page_id, evt){
			objBase.currentPage = current_page = page_id;
			drawLinks();
			var continuePropagation = opts.callback(page_id, panel);
			if (!continuePropagation) {
				if (evt.stopPropagation) {
					evt.stopPropagation();
				}
				else {
					evt.cancelBubble = true;
				}
			}
			return continuePropagation;
		}
		
		/**
		 * This function inserts the pagination links into the container element
		 */
		function drawLinks() {
			panel.empty();
			var interval = getInterval();
			var np = numPages();
			// This helper function returns a handler function that calls pageSelected with the right page_id
			var getClickHandler = function(page_id) {
				return function(evt){return pageSelected(page_id,evt);}
			};
			// Helper function for generating a single link (or a span tag if it's the current page)
			var appendItem = function(page_id, appendopts){
				page_id = page_id<0?0:(page_id<np?page_id:np-1); // Normalize page id to sane value
				appendopts = jQuery.extend({text:page_id+1, classes:""}, appendopts||{});
				var lnk ;
				if(page_id == current_page){
					lnk = jQuery("<span class='current'>"+(appendopts.text)+"</span>");
				}
				else
				{
					lnk = jQuery("<a>"+(appendopts.text)+"</a>")
						.bind("click", getClickHandler(page_id))
						.attr('href', opts.link_to.replace(/__id__/,page_id));
						
				}
				if(appendopts.classes){lnk.addClass(appendopts.classes);}
				panel.append(lnk);
			};
			if(opts.total){
				jQuery("<span class='total'>"+opts.total+"</span>").appendTo(panel);
			}
			// Generate "Previous"-Link
			if(opts.prev_text && (current_page > 0 || opts.prev_show_always)){
				// appendItem(current_page-1,{text:opts.prev_text, classes:"prev"});
				appendItem(current_page-1,{text:'', classes:"prev"});
			}
			// Generate starting points
			if (interval[0] > 0 && opts.num_edge_entries > 0)
			{
				var end = Math.min(opts.num_edge_entries, interval[0]);
				for(var i=0; i<end; i++) {
					appendItem(i);
				}
				if(opts.num_edge_entries < interval[0] && opts.ellipse_text)
				{
					jQuery("<span>"+opts.ellipse_text+"</span>").appendTo(panel);
				}
			}
			// Generate interval links
			for(var i=interval[0]; i<interval[1]; i++) {
				appendItem(i);
			}
			// Generate ending points
			if (interval[1] < np && opts.num_edge_entries > 0)
			{
				if(np-opts.num_edge_entries > interval[1]&& opts.ellipse_text)
				{
					jQuery("<span>"+opts.ellipse_text+"</span>").appendTo(panel);
				}
				var begin = Math.max(np-opts.num_edge_entries, interval[1]);
				for(var i=begin; i<np; i++) {
					appendItem(i);
				}
				
			}
			// Generate "Next"-Link
			if(opts.next_text && (current_page < np-1 || opts.next_show_always)){
				// appendItem(current_page+1,{text:opts.next_text, classes:"next"});
				appendItem(current_page+1,{text:'', classes:"next"});
			}
			if(opts.skip_page){
				var $inputBox = jQuery("<span class='input-box'><em>跳转到第</em><input type='text' /><em>页</em></span>");
				var $selectPerPage = jQuery("<span class='per-page'><em>每页条数：</em><select class='selectPerPage'><option>"+ opts.items_per_page +"</option></select></span>");
				var $select=$selectPerPage.find("select");

				if (opts.custom_pages && opts.custom_pages.length){
					jQuery.each(opts.custom_pages,function(i, item){
						$select.append('<option>'+ item +'</option>');
					});
					$select.on('change',jQuery.proxy(function(evt){
						objBase.perPage = opts.items_per_page = jQuery(evt.currentTarget).val();
						pageSelected(0,evt);
					},this))
					// $inputBox.append($selectPerPage);
				}
				$selectPerPage.appendTo(panel);
				$inputBox.appendTo(panel);
				jQuery('<a href="javascript:;" >'+opts.skip_page+'</a>').appendTo(panel)
					.bind("click",function(evt){
						var pageNum = parseInt(panel.find("input").val());
						if(pageNum&&pageNum>1){
							pageNum=(pageNum>np)?np:pageNum;
						}else{
							pageNum=1
						}
						return pageSelected(pageNum-1,evt);
					});

				

			}
		}
		
		// Extract current_page from options
		var current_page = opts.current_page;
		// Create a sane value for maxentries and items_per_page
		maxentries = (!maxentries || maxentries < 0)?1:maxentries;
		opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0)?1:opts.items_per_page;
		// Store DOM element for easy access from all inner functions
		var panel = jQuery(this);

		// Attach control functions to the DOM element 
		this.selectPage = function(page_id){ pageSelected(page_id);};
		this.prevPage = function(){ 
			if (current_page > 0) {
				pageSelected(current_page - 1);
				return true;
			}
			else {
				return false;
			}
		};
		this.nextPage = function(){ 
			if(current_page < numPages()-1) {
				pageSelected(current_page+1);
				return true;
			}
			else {
				return false;
			}
		};
		// When all initialisation is done, draw the links
		drawLinks();
        // call callback function
		if (opts.call_callback_at_once) { // 修改。第一次加载时，不调用2次。
			opts.callback(current_page, this);
		}
        
	return objBase;
};



define("jquery.pagination", ["jquery"], function(){});

/*!
 * jquery.fixedHeaderTable. The jQuery fixedHeaderTable plugin
 *
 * Copyright (c) 2013 Mark Malek
 * http://fixedheadertable.com
 *
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * http://docs.jquery.com/Plugins/Authoring
 * jQuery authoring guidelines
 *
 * Launch  : October 2009
 * Version : 1.3
 * Released: May 9th, 2011
 *
 *
 * all CSS sizing (width,height) is done in pixels (px)
 */

(function ($) {

  $.fn.fixedHeaderTable = function (method) {

    // plugin's default options
    var defaults = {
      width:          '100%',
      height:         '100%',
      themeClass:     'fht-default',
      borderCollapse:  true,
      fixedColumns:    0, // fixed first columns
      fixedColumn:     false, // For backward-compatibility
      sortable:        false,
      autoShow:        true, // hide table after its created
      footer:          false, // show footer
      cloneHeadToFoot: false, // clone head and use as footer
      autoResize:      false, // resize table if its parent wrapper changes size
      create:          null // callback after plugin completes
    };

    var settings = {};

    // public methods
    var methods = {
      init: function (options) {
        settings = $.extend({}, defaults, options);

        // iterate through all the DOM elements we are attaching the plugin to
        return this.each(function () {
          var $self = $(this); // reference the jQuery version of the current DOM element

          if (helpers._isTable($self)) {
            methods.setup.apply(this, Array.prototype.slice.call(arguments, 1));
            $.isFunction(settings.create) && settings.create.call(this);
          } else {
            $.error('Invalid table mark-up');
          }
        });
      },

      /*
       * Setup table structure for fixed headers and optional footer
       */
      setup: function () {
        var $self       = $(this),
            self        = this,
            $thead      = $self.find('thead'),
            $tfoot      = $self.find('tfoot'),
            tfootHeight = 0,
            $wrapper,
            $divHead,
            $divBody,
            $fixedBody,
            widthMinusScrollbar;

        settings.originalTable = $(this).clone();
        settings.includePadding = helpers._isPaddingIncludedWithWidth();
        settings.scrollbarOffset = helpers._getScrollbarWidth();
        settings.themeClassName = settings.themeClass;

        if (settings.width.search && settings.width.search('%') > -1) {
            widthMinusScrollbar = $self.parent().width() - settings.scrollbarOffset;
        } else {
            widthMinusScrollbar = settings.width - settings.scrollbarOffset;
        }

        $self.css({
          width: widthMinusScrollbar
        });


        if (!$self.closest('.fht-table-wrapper').length) {
          $self.addClass('fht-table');
          $self.wrap('<div class="fht-table-wrapper"></div>');
        }

        $wrapper = $self.closest('.fht-table-wrapper');

        if(settings.fixedColumn == true && settings.fixedColumns <= 0) {
          settings.fixedColumns = 1;
        }

        if (settings.fixedColumns > 0 && $wrapper.find('.fht-fixed-column').length == 0) {
          $self.wrap('<div class="fht-fixed-body"></div>');

          $('<div class="fht-fixed-column"></div>').prependTo($wrapper);

          $fixedBody    = $wrapper.find('.fht-fixed-body');
        }

        $wrapper.css({
          width: settings.width,
          height: settings.height
        })
          .addClass(settings.themeClassName);

        if (!$self.hasClass('fht-table-init')) {
          $self.wrap('<div class="fht-tbody"></div>');
        }

        $divBody = $self.closest('.fht-tbody');

        var tableProps = helpers._getTableProps($self);

        helpers._setupClone($divBody, tableProps.tbody);

        if (!$self.hasClass('fht-table-init')) {
          if (settings.fixedColumns > 0) {
            $divHead = $('<div class="fht-thead"><table class="fht-table"></table></div>').prependTo($fixedBody);
          } else {
            $divHead = $('<div class="fht-thead"><table class="fht-table"></table></div>').prependTo($wrapper);
          }

          $divHead.find('table.fht-table')
            .addClass(settings.originalTable.attr('class'))
            .attr('style', settings.originalTable.attr('style'));

          $thead.clone().appendTo($divHead.find('table'));
        } else {
          $divHead = $wrapper.find('div.fht-thead');
        }

        helpers._setupClone($divHead, tableProps.thead);

        $self.css({
          'margin-top': -$divHead.outerHeight(true)
        });

        /*
         * Check for footer
         * Setup footer if present
         */
        if (settings.footer == true) {
          helpers._setupTableFooter($self, self, tableProps);

          if (!$tfoot.length) {
            $tfoot = $wrapper.find('div.fht-tfoot table');
          }

          tfootHeight = $tfoot.outerHeight(true);
        }

        var tbodyHeight = $wrapper.height() - $thead.outerHeight(true) - tfootHeight - tableProps.border;

        $divBody.css({
          'height': tbodyHeight
        });

        $self.addClass('fht-table-init');

        if (typeof(settings.altClass) !== 'undefined') {
          methods.altRows.apply(self);
        }

        if (settings.fixedColumns > 0) {
          helpers._setupFixedColumn($self, self, tableProps);
        }

        if (!settings.autoShow) {
          $wrapper.hide();
        }

        helpers._bindScroll($divBody, tableProps);

        return self;
      },

      /*
       * Resize the table
       * Incomplete - not implemented yet
       */
      resize: function() {
        var self  = this;
        return self;
      },

      /*
       * Add CSS class to alternating rows
       */
      altRows: function(arg1) {
        var $self = $(this),
        altClass  = (typeof(arg1) !== 'undefined') ? arg1 : settings.altClass;

        $self.closest('.fht-table-wrapper')
          .find('tbody tr:odd:not(:hidden)')
          .addClass(altClass);
      },

      /*
       * Show a hidden fixedHeaderTable table
       */
      show: function(arg1, arg2, arg3) {
        var $self   = $(this),
            self      = this,
            $wrapper  = $self.closest('.fht-table-wrapper');

        // User provided show duration without a specific effect
        if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'number') {
          $wrapper.show(arg1, function() {
            $.isFunction(arg2) && arg2.call(this);
          });

          return self;

        } else if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'string' &&
          typeof(arg2) !== 'undefined' && typeof(arg2) === 'number') {
          // User provided show duration with an effect

          $wrapper.show(arg1, arg2, function() {
            $.isFunction(arg3) && arg3.call(this);
          });

          return self;

        }

        $self.closest('.fht-table-wrapper')
          .show();
        $.isFunction(arg1) && arg1.call(this);

        return self;
      },

      /*
       * Hide a fixedHeaderTable table
       */
      hide: function(arg1, arg2, arg3) {
        var $self     = $(this),
            self    = this,
            $wrapper  = $self.closest('.fht-table-wrapper');

        // User provided show duration without a specific effect
        if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'number') {
          $wrapper.hide(arg1, function() {
            $.isFunction(arg3) && arg3.call(this);
          });

          return self;
        } else if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'string' &&
          typeof(arg2) !== 'undefined' && typeof(arg2) === 'number') {

          $wrapper.hide(arg1, arg2, function() {
            $.isFunction(arg3) && arg3.call(this);
          });

          return self;
        }

        $self.closest('.fht-table-wrapper')
          .hide();

        $.isFunction(arg3) && arg3.call(this);



        return self;
      },

      /*
       * Destory fixedHeaderTable and return table to original state
       */
      destroy: function() {
        var $self    = $(this),
            self     = this,
            $wrapper = $self.closest('.fht-table-wrapper');

        $self.insertBefore($wrapper)
          .removeAttr('style')
          .append($wrapper.find('tfoot'))
          .removeClass('fht-table fht-table-init')
          .find('.fht-cell')
          .remove();

        $wrapper.remove();

        return self;
      }

    };

    // private methods
    var helpers = {

      /*
       * return boolean
       * True if a thead and tbody exist.
       */
      _isTable: function($obj) {
        var $self = $obj,
            hasTable = $self.is('table'),
            hasThead = $self.find('thead').length > 0,
            hasTbody = $self.find('tbody').length > 0;

        if (hasTable && hasThead && hasTbody) {
          return true;
        }

        return false;

      },

      /*
       * return void
       * bind scroll event
       */
      _bindScroll: function($obj) {
        var $self = $obj,
            $wrapper = $self.closest('.fht-table-wrapper'),
            $thead = $self.siblings('.fht-thead'),
            $tfoot = $self.siblings('.fht-tfoot');

        $self.bind('scroll', function() {
          if (settings.fixedColumns > 0) {
            var $fixedColumns = $wrapper.find('.fht-fixed-column');

            $fixedColumns.find('.fht-tbody table')
              .css({
                  'margin-top': -$self.scrollTop()
              });
          }

          $thead.find('table')
            .css({
              'margin-left': -this.scrollLeft
            });

          if (settings.footer || settings.cloneHeadToFoot) {
            $tfoot.find('table')
              .css({
                'margin-left': -this.scrollLeft
              });
          }
        });
      },

      /*
       * return void
       */
      _fixHeightWithCss: function ($obj, tableProps) {
        if (settings.includePadding) {
          $obj.css({
            'height': $obj.height() + tableProps.border
          });
        } else {
          $obj.css({
            'height': $obj.parent().height() + tableProps.border
          });
        }
      },

      /*
       * return void
       */
      _fixWidthWithCss: function($obj, tableProps, width) {
        if (settings.includePadding) {
          $obj.each(function() {
            $(this).css({
              'width': width == undefined ? $(this).width() + tableProps.border : width + tableProps.border
            });
          });
        } else {
          $obj.each(function() {
            $(this).css({
              'width': width == undefined ? $(this).parent().width() + tableProps.border : width + tableProps.border
            });
          });
        }

      },

      /*
       * return void
       */
      _setupFixedColumn: function ($obj, obj, tableProps) {
        var $self             = $obj,
            $wrapper          = $self.closest('.fht-table-wrapper'),
            $fixedBody        = $wrapper.find('.fht-fixed-body'),
            $fixedColumn      = $wrapper.find('.fht-fixed-column'),
            $thead            = $('<div class="fht-thead"><table class="fht-table"><thead><tr></tr></thead></table></div>'),
            $tbody            = $('<div class="fht-tbody"><table class="fht-table"><tbody></tbody></table></div>'),
            $tfoot            = $('<div class="fht-tfoot"><table class="fht-table"><tfoot><tr></tr></tfoot></table></div>'),
            fixedBodyWidth    = $wrapper.width(),
            fixedBodyHeight   = $fixedBody.find('.fht-tbody').height() - settings.scrollbarOffset,
            $firstThChildren,
            $firstTdChildren,
            fixedColumnWidth,
            $newRow,
            firstTdChildrenSelector;

        $thead.find('table.fht-table').addClass(settings.originalTable.attr('class'));
        $tbody.find('table.fht-table').addClass(settings.originalTable.attr('class'));
        $tfoot.find('table.fht-table').addClass(settings.originalTable.attr('class'));

        $firstThChildren = $fixedBody.find('.fht-thead thead tr > *:lt(' + settings.fixedColumns + ')');
        fixedColumnWidth = settings.fixedColumns * tableProps.border;
        $firstThChildren.each(function() {
          fixedColumnWidth += $(this).outerWidth(true);
        });

        // Fix cell heights
        helpers._fixHeightWithCss($firstThChildren, tableProps);
        helpers._fixWidthWithCss($firstThChildren, tableProps);

        var tdWidths = [];
        $firstThChildren.each(function() {
          tdWidths.push($(this).width());
        });

        firstTdChildrenSelector = 'tbody tr > *:not(:nth-child(n+' + (settings.fixedColumns + 1) + '))';
        $firstTdChildren = $fixedBody.find(firstTdChildrenSelector)
          .each(function(index) {
            helpers._fixHeightWithCss($(this), tableProps);
            helpers._fixWidthWithCss($(this), tableProps, tdWidths[index % settings.fixedColumns] );
          });

        // clone header
        $thead.appendTo($fixedColumn)
          .find('tr')
          .append($firstThChildren.clone());

        $tbody.appendTo($fixedColumn)
          .css({
            // 'margin-top': -1,
            'height': fixedBodyHeight + tableProps.border
          });

        $firstTdChildren.each(function(index) {
          if (index % settings.fixedColumns == 0) {
            $newRow = $('<tr></tr>').appendTo($tbody.find('tbody'));

            if (settings.altClass && $(this).parent().hasClass(settings.altClass)) {
              $newRow.addClass(settings.altClass);
            }
          }

          $(this).clone()
            .appendTo($newRow);
        });

        // set width of fixed column wrapper
        $fixedColumn.css({
          'height': 0,
          'width': fixedColumnWidth
        });


        // bind mousewheel events
        var maxTop = $fixedColumn.find('.fht-tbody .fht-table').height() - $fixedColumn.find('.fht-tbody').height();
        $fixedColumn.find('.fht-tbody .fht-table').bind('mousewheel', function(event, delta, deltaX, deltaY) {
          if (deltaY == 0) {
            return;
          }
          var top = parseInt($(this).css('marginTop'), 10) + (deltaY > 0 ? 120 : -120);
          if (top > 0) {
            top = 0;
          }
          if (top < -maxTop) {
            top = -maxTop;
          }
          $(this).css('marginTop', top);
          $fixedBody.find('.fht-tbody').scrollTop(-top).scroll();
          return false;
        });


        // set width of body table wrapper
        $fixedBody.css({
          'width': fixedBodyWidth
        });

        // setup clone footer with fixed column
        if (settings.footer == true || settings.cloneHeadToFoot == true) {
          var $firstTdFootChild = $fixedBody.find('.fht-tfoot tr > *:lt(' + settings.fixedColumns + ')'),
              footwidth;

          helpers._fixHeightWithCss($firstTdFootChild, tableProps);
          $tfoot.appendTo($fixedColumn)
            .find('tr')
            .append($firstTdFootChild.clone());
          // Set (view width) of $tfoot div to width of table (this accounts for footers with a colspan)
          footwidth = $tfoot.find('table').innerWidth();
          $tfoot.css({
            'top': settings.scrollbarOffset,
            'width': footwidth
          });
        }
      },

      /*
       * return void
       */
      _setupTableFooter: function ($obj, obj, tableProps) {
        var $self     = $obj,
            $wrapper  = $self.closest('.fht-table-wrapper'),
            $tfoot    = $self.find('tfoot'),
            $divFoot  = $wrapper.find('div.fht-tfoot');

        if (!$divFoot.length) {
          if (settings.fixedColumns > 0) {
            $divFoot = $('<div class="fht-tfoot"><table class="fht-table"></table></div>').appendTo($wrapper.find('.fht-fixed-body'));
          } else {
            $divFoot = $('<div class="fht-tfoot"><table class="fht-table"></table></div>').appendTo($wrapper);
          }
        }
        $divFoot.find('table.fht-table').addClass(settings.originalTable.attr('class'));

        switch (true) {
          case !$tfoot.length && settings.cloneHeadToFoot == true && settings.footer == true:

            var $divHead = $wrapper.find('div.fht-thead');

            $divFoot.empty();
            $divHead.find('table')
              .clone()
              .appendTo($divFoot);

            break;
          case $tfoot.length && settings.cloneHeadToFoot == false && settings.footer == true:

            $divFoot.find('table')
              .append($tfoot)
              .css({
                'margin-top': -tableProps.border
              });

            helpers._setupClone($divFoot, tableProps.tfoot);

            break;
        }

      },

      /*
       * return object
       * Widths of each thead cell and tbody cell for the first rows.
       * Used in fixing widths for the fixed header and optional footer.
       */
      _getTableProps: function($obj) {
        var tableProp = {
              thead: {},
              tbody: {},
              tfoot: {},
              border: 0
            },
            borderCollapse = 1;

        if (settings.borderCollapse == true) {
          borderCollapse = 2;
        }

        tableProp.border = ($obj.find('th:first-child').outerWidth() - $obj.find('th:first-child').innerWidth()) / borderCollapse;

        $obj.find('thead tr:first-child > *').each(function(index) {
          tableProp.thead[index] = $(this).width() + tableProp.border;
        });

        $obj.find('tfoot tr:first-child > *').each(function(index) {
          tableProp.tfoot[index] = $(this).width() + tableProp.border;
        });

        $obj.find('tbody tr:first-child > *').each(function(index) {
          tableProp.tbody[index] = $(this).width() + tableProp.border;
        });

        return tableProp;
      },

      /*
       * return void
       * Fix widths of each cell in the first row of obj.
       */
      _setupClone: function($obj, cellArray) {
        var $self    = $obj,
            selector = ($self.find('thead').length) ?
              'thead tr:first-child > *' :
              ($self.find('tfoot').length) ?
              'tfoot tr:first-child > *' :
              'tbody tr:first-child > *',
            $cell;

        $self.find(selector).each(function(index) {
          $cell = ($(this).find('div.fht-cell').length) ? $(this).find('div.fht-cell') : $('<div class="fht-cell"></div>').appendTo($(this));

          $cell.css({
            'width': parseInt(cellArray[index], 10)
          });

          /*
           * Fixed Header and Footer should extend the full width
           * to align with the scrollbar of the body
           */
          if (!$(this).closest('.fht-tbody').length && $(this).is(':last-child') && !$(this).closest('.fht-fixed-column').length) {
            var padding = Math.max((($(this).innerWidth() - $(this).width()) / 2), settings.scrollbarOffset);
            $(this).css({
              'padding-right': parseInt($(this).css('padding-right')) + padding + 'px'
            });
          }
        });
      },

      /*
       * return boolean
       * Determine how the browser calculates fixed widths with padding for tables
       * true if width = padding + width
       * false if width = width
       */
      _isPaddingIncludedWithWidth: function() {
        var $obj = $('<table class="fht-table"><tr><td style="padding: 10px; font-size: 10px;">test</td></tr></table>'),
            defaultHeight,
            newHeight;

        $obj.addClass(settings.originalTable.attr('class'));
        $obj.appendTo('body');

        defaultHeight = $obj.find('td').height();

        $obj.find('td')
          .css('height', $obj.find('tr').height());

        newHeight = $obj.find('td').height();
        $obj.remove();

        if (defaultHeight != newHeight) {
          return true;
        } else {
          return false;
        }

      },

      /*
       * return int
       * get the width of the browsers scroll bar
       */
      _getScrollbarWidth: function() {
        var scrollbarWidth = 0;

        if (!scrollbarWidth) {
          if (/msie/.test(navigator.userAgent.toLowerCase())) {
            var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                  .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                  .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');

            scrollbarWidth = $textarea1.width() - $textarea2.width() + 2; // + 2 for border offset
            $textarea1.add($textarea2).remove();
          } else {
            var $div = $('<div />')
                  .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                  .prependTo('body').append('<div />').find('div')
                  .css({ width: '100%', height: 200 });

            scrollbarWidth = 100 - $div.width();
            $div.parent().remove();
          }
        }

        return scrollbarWidth;
      }

    };


    // if a method as the given argument exists
    if (methods[method]) {

      // call the respective method
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

      // if an object is given as method OR nothing is given as argument
    } else if (typeof method === 'object' || !method) {

      // call the initialization method
      return methods.init.apply(this, arguments);

      // otherwise
    } else {

      // trigger an error
      $.error('Method "' +  method + '" does not exist in fixedHeaderTable plugin!');

    }

  };

})(jQuery);

define("jquery.fixedheadertable", ["jquery"], function(){});


define('lib/requirejs/css.min!lib/jqueryPlugin/pagination/1.2.1/pagination',[],function(){});

define('lib/requirejs/css.min!lib/jqueryPlugin/jquery.fixedheadertable/defaultTheme',[],function(){});
/**
        * @author  jingfei
        * @version 1.0.3 2017-1-12
        * 修改说明:添加组件宽和高的配置项listWidth和listHeight,当组件>父级元素时，自动显示滚动条
*/

//../node_modules/compts_npm/components/list/
define('list',['backbone', 'hdbHelper',
        'text!components/list/list.tpl',
        'text!components/list/listTips.tpl',
        'text!components/list/noRecord.tpl',
        'artDialog', 
        'lib/requirejs/css.min!components/list/list.css',
        'lib/requirejs/css.min!lib/dialog/6.0.4/css/ui-dialog.css',
        'jquery.pagination','jquery.fixedheadertable',
        'lib/requirejs/css.min!lib/jqueryPlugin/pagination/1.2.1/pagination.css',
        'lib/requirejs/css.min!lib/jqueryPlugin/jquery.fixedheadertable/defaultTheme.css'],
    function(Backbone, hdb, tpl,listTipsTpl,no_recordTpl){
    var version = '1.0.4';
    var Model = Backbone.Model.extend({});
    var ListItemCellModel = Backbone.Model.extend({});
    var Collection = Backbone.Collection.extend({
        model:Model
    });

    var checkAll=function(e){
        var $checkAllBox = $(e.currentTarget);
        var checked = $checkAllBox.is(":checked");
        $.each(this.collection.models, function(i,item){
            item.set('checked',checked);
        });
    };
    var addOne = function(i,model){
        var listItem = new ListItem({ model:model, listOptions:this.options });
        $('tbody',this.el).append(listItem.render().el);
        listItem.on('rowClick',$.proxy(function(e, data){
            if (this.options.field.boxType == "radio"){
                $('tbody tr',this.el).removeClass('selected');
                this.selectedData = data;
            }
            this.trigger('rowClick',e,data);
        },this));
        listItem.on('cellClick',$.proxy(function(e, data,text){
            this.trigger('cellClick',e,data,text);
        },this));
        listItem.on('checkboxChange',$.proxy(function(e, checked){
            this.trigger('checkboxChange',e,model.toJSON(),checked);
        },this));
        listItem.on('rowDoubleClick',$.proxy(function(e){
            this.trigger('rowDoubleClick',e,model.toJSON());
        },this));
        
    };

    var pageInit=function(result){
        var $pagination = this.$pagination = $('.sn-listFooter .pagination',this.el);
        var total = result.bean.total || 0;
        var optTotal = null;
        if(this.options.page.total){
            optTotal = '共'+total+'条';
        }
        if (!this.loaded){
            this.loaded = 1;
            this.objPagination = $pagination.pagination(total, {
                'items_per_page'      : this.options.page.perPage || 10,
                'current_page': typeof this.pageIndex == 'undefined' ? 0 : this.pageIndex,
                'num_display_entries' : 3,
                'num_edge_entries'    : 1,
                'skip_page':"跳转",
                //'link_to': '#tradeRecordsIndex' ,
                'link_to':'javascript:;',
                'total': optTotal,
                'prev_text'           : "上一页",
                'next_text'           : "下一页",
                'call_callback_at_once' : false,  //控制分页控件第一次不触发callback.
                'custom_pages':this.options.page.customPages,
                'callback': $.proxy(function(pageIndex, $page){
                    loading.call(this,pageIndex);
                    //Util.pagination(page_index , false , pageParams , str );  
                },this)
            });
        }
    };
    var loading=function(pageIndex){
        var isLoad=(typeof pageIndex!="number");
        // var url ="";
        var url1 ="";
        var pathName=window.document.location.pathname;
	var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
        this.pageIndex = pageIndex;
        // if(this.options.data){
        //     url=this.options.data.url;
        // }
        //if(!this.url && this.options.data){
           // this.url=this.options.data.url;
        //}
        if(this.options.data){
        	url1= projectName + "/" + this.options.data.url;
        }
        if(isLoad){
            var result={
                bean:{total:1},
                beans:pageIndex
            };
        }else{
            pageIndex = pageIndex || 0;
        }
        var perPage = ((this.objPagination && this.objPagination.perPage) || (this.options.page&&this.options.page.perPage)) || 3;
        var start = pageIndex*perPage;
        // start limit
        // if (url.indexOf('?') < 0){
        //     url+='?';
        // }else{
        //     url+='&';
        // }
        // url += 'start='+start+'&limit='+perPage+'&_='+Math.random();
        var colspan = this.options.field.items.length + 
            (this.options.field.button && this.options.field.button.items && this.options.field.button.items.length ? 1 : 0) +
            (this.options.field&&this.options.field.popupLayer&&this.options.field.popupLayer.groups ? 1 : 0) +
            (this.options.field.boxType == 'checkbox'?1:0);
        // var loadingTemplate = hdb.compile(loadingTpl);
        $('.sn-list',this.$el).addClass('sn-list-loading');
        if(isLoad){
            ajaxHandle.call(this,result,colspan);
        }else{
            if (this.searchParam){
                $.extend(this.searchParam,{
                    start:start,
                    limit:perPage,
                    page:pageIndex+1,
                    _:Math.random()
                });
            }
            $.ajax({
                url:url1,
                //url:this.url,
                type:'post',
                dataType:'json',
                data:this.searchParam,
                success:$.proxy(function(result){
                    var content=result;
                    if(content.returnCode == 0){
                        ajaxHandle.call(this,result,colspan);
                    }else{
                        var $div = $('.blockOverlay>div',this.$el);
                        $div.html(result.returnMessage);
                        var width = -$div.width()/2+'px';
                        $div.css('margin-left',width);
                    }
                },this),
                error:function(err){
                    console.log('集成组件-列表 数据加载失败');
                }
            });
        }
    };
    var no_recordTemplate = hdb.compile(no_recordTpl);
    var fixedColumns = function(){
        if(this.options.field&&this.options.field.fixedColumns){
            $('.sn-list-table',this.$el).fixedHeaderTable({
                fixedColumns:this.options.field.fixedColumns,
                footer: true
            });
            $('.fht-fixed-column .fht-tfoot .fht-cell',this.$el).width(0);
            $('.fht-fixed-column .fht-tfoot',this.$el).width(this.$el.width());
        }
    }
    var ajaxHandle=function(result,colspan){
        $('tbody',this.el).empty();
        $('.sn-list',this.$el).removeClass('sn-list-loading');
        this.total=result.bean.total;
        loadHandle.call(this,result,colspan);
        this.options.page&&pageInit.call(this,result);
        this.trigger('success', result);
        fixedColumns.call(this);
    };
    var loadHandle=function(result,colspan){
        this.collection = new Collection(result.beans);
        if(this.collection.models.length){
            $.each(this.collection.models, $.proxy(addOne,this));
        }else{
            $('tbody',this.el).html(no_recordTemplate({colspan:colspan}));
        }
        //events对象已废弃
        // if (this.options && this.options.events && this.options.events.afterBuild){
        //     this.options.events.afterBuild.call(this,this.collection.models);
        // }
        this.trigger('afterBuild', this,this.collection.models);
    };

    // ListItem define
    var changeSelectStatus = function(e){
        var $box = $(e.currentTarget);
        var checked = $box.is(':checked')?1:0;
        this.model.set('checked', checked);
        this.trigger('checkboxChange',e,checked);
        return false;
    };
    var ListItem = Backbone.View.extend({
        tagName:'tr',
        events:{
            'click    td>input':changeSelectStatus,
            'click    ':'rowClick',
            'dblclick ':'rowDoubleClick',
            'click    .boxWraper':'boxWrapperClick',
            'mouseenter  td.tooltip':"hover",    
        },
        eventInit:function(){
            $('td>.btns>input[name="deleter"]'.$el).on('click',$.proxy(deleterClick,this))
            $('td>input', $el).on('click', $.proxy(changeSelectStatus,this))
        },
        initialize:function(options){
            this.options = options;
            this.model.on('change:checked', $.proxy(function(model,checked,p2){
                this.render();
                if (this.options.listOptions.field.boxType =='checkbox' && checked){
                    this.$el.addClass('selected');
                }else{
                    this.$el.removeClass('selected');
                }
            },this));
        },
        render:function(){
            var json = this.model.toJSON();
            var boxType = this.options.listOptions.field.boxType;
            this.$el.html('');
            if (boxType){
                switch (boxType){
                    case 'checkbox':
                        var $boxWraper = $('<td class="boxWraper"></td>');
                        $boxWraper.append('<input type="checkbox" value="'+ json[this.options.listOptions.field.key] +'" '+ (json.checked?'checked=checked':'') +' />');
                        break;
                }
                this.$el.append($boxWraper);
            }
            var listOptions = this.options.listOptions;
            listOptions.field.items&&$.each(listOptions.field.items,$.proxy(function(i,item){
                var cellView = new ListItemCellView({ config:item,data:json });
                this.$el.append(cellView.render().el);
            },this));

            var className = listOptions.field.button&&listOptions.field.button.className?listOptions.field.button.className:'';
            var $buttonCell = $('<td class="btnStyles '+className+'"></td>');
            if (listOptions.field &&
                listOptions.field.button && listOptions.field.button.items &&
                listOptions.field.button.items.length){
                this.$el.append($buttonCell);
                listOptions.field.button&&$.each(listOptions.field.button.items,$.proxy(function(i,item){
                    var buttonView = new ListItemButtonView({ config:item,data:json});
                    $buttonCell.append(buttonView.render().el);
                },this));
            }
            if(listOptions.field &&
               listOptions.field.button && listOptions.field.button.render){
                var item = json;
                var btnRender = listOptions.field.button.render;
                var $result = $(btnRender($buttonCell,item));
                if(!$('.btnStyles',this.el).length){ 
                    this.$el.append($buttonCell);
                }
                $('.btnStyles',this.el).append($result);
            }
            if(listOptions.field&&listOptions.field.popupLayer&&listOptions.field.popupLayer.groups){
                var lastText = listOptions.field.popupLayer.text?listOptions.field.popupLayer.text:"更多";
                this.$el.append('<td class="tooltip"><a href="javascript:;"><i class="ic ic-detail"></i>'+lastText+'</a></td>');
            }

            return this;
        },
        boxWrapperClick:function(e){
            var $box = $('input',e.currentTarget);
            var checked = $box.is(':checked')?0:1;
            this.model.set('checked', checked);
            this.trigger('checkboxChange',e,checked);
            return false;
        },
        hover:function(e){
            var $Tr = $(e.currentTarget)[0];
            var popupLayer=this.options.listOptions.field.popupLayer;
            var json=this.model.toJSON();
            hdb.registerHelper('deal_item', function(items,options) {
                var arr=[];
                for(var i=0;i<items.length;i++){
                    var fieldConfig = items[i];
                    var fieldName = items[i].name;
                    var fieldValue = json[fieldName];
                    if(fieldValue){
                        var text = fieldConfig.render ? fieldConfig.render(fieldConfig,fieldValue) : fieldValue;
                        // if(fieldConfig.render){
                        //     text=fieldConfig.render(fieldConfig,fieldValue);
                        // }else {
                        //     text=fieldValue;
                        // }
                        arr.push({name:fieldConfig.text,text:text,width:100/items.length+'%'})
                    }
                    //字段为空时，不再显示该字段
                    // else{
                    //     arr.push({name:fieldConfig.text,text:"没有数据",width:100/items.length+'%'})
                    // }
                }
                return options.fn(arr);
            });
            var id="sn-tr-hover";
            if(e.type=="mouseenter"){
                if(popupLayer&&popupLayer.groups.length){
                    var tempDialog = dialog.get(id);
                    if (tempDialog){
                        tempDialog.close().remove();
                    }
                    var dialogConfig = {
                        id:id,
                        align: 'left',
                        content:hdb.compile(listTipsTpl)(popupLayer.groups)
                    }
                    if (popupLayer.width){
                        _.extend(dialogConfig,{width:popupLayer.width});
                    }
                    if (popupLayer.height){
                        _.extend(dialogConfig,{height:popupLayer.height});
                    }
                    var d=new dialog(dialogConfig);
                    this.dialog = d;
                    d.show($Tr);
                    $(d.node).on('mouseleave',function(){
                        d.close().remove();
                    });
                }
            }
        },
        cellClick:function(e, cellConfig){
            var $src = $(e.currentTarget);
            this.trigger('cellClick', e, cellConfig);
        },
        rowDoubleClick:function(e){
            this.trigger('rowDoubleClick', e,this.model.toJSON());

        },
        rowClick:function(e){
            var $src = $(e.currentTarget);
            this.trigger('rowClick', e, this.model.toJSON());
            if (this.options.listOptions.field.boxType == "radio"){
                this.$el.addClass('selected');
            }
            
        }
    });
    var ListItemButtonView = Backbone.View.extend({
        tagName:'a',
        events:{
            'click':'buttonClick'
        },
        initialize:function(options){
            this.$el.attr('href','javascript:;');
            this.options = options;
            if(this.options.config&&this.options.config.name){
                this.$el.attr('name',this.options.config.name);
            }
        },
        render:function(){
            this.$el.html(this.options.config&&this.options.config.text);
            return this;
        },
        buttonClick:function(e){
            if (this.options && this.options.config && this.options.config.click){
                this.options.config.click.call(this,e,this.options);
            }


        }
    });

    var ListItemCellView = Backbone.View.extend({
        tagName:'td',
        events:{
            'click':'cellClick'
        },
        initialize:function(options){
            this.options = options;
        },
        render:function(){
            var cellVal = this.options.data[this.options.config.name];
            if (this.options.config.render){
                cellVal = this.options.config.render.call(this,this.options.data,cellVal,this.$el);
            }
            this.$el.html(cellVal);
            if (this.options.config && this.options.config.className){
               this.$el.addClass(this.options.config.className)
            }
            if (this.options.config && this.options.config.title){
                this.$el.attr("title",this.options.data[this.options.config.title])
            }
            return this;
        },
        cellClick:function(e){
            if (this.options && this.options.config && this.options.config.click){
                this.options.config.click.call(this,e,this.options);
            }
            //this.trigger('click', e,this.options);
        }
    });
    var objClass = Backbone.View.extend({
        version:version,
        events:{
            'click  thead .checkAllWraper>input':checkAll,
            'click .sn-listFooter .btns>.btn':'btnClick'
        },
        template:hdb.compile(tpl),
        initialize:function(options){
            if (!options){
                console.log('please config params for list.');
                return this;
            }
            this.options = options;
            // hdb.registerHelper('footerColspanCount', function(field) {
            //     if (!field){
            //         return 0;
            //     }
            //     return field.items.length + (typeof(field.boxType)=='string'?1:0) +
            //         (field&&field.popupLayer&&field.popupLayer.groups ? 1 : 0) +
            //         (typeof(field.button)=='object'?1:0);
            // });
            this.$el.html(this.template(options));
            
            // $('table',this.el).addClass('sn-list');
            if (options.page && options.page.align && options.page.align == 'left'){
                $('.sn-listFooter .pagination',this.el).addClass('align-left');
            }
            if (options.page && options.page.button &&options.page.button.url){
                require([options.page.button.url],$.proxy(function(Module){
                    var module = new Module(options.page.button.param || {});
                    $('.sn-listFooter .buttons', this.el).append(module.content);
                },this));
            }
            if(options.listWidth){
                var width = options.listWidth;
                var listWidth = $('.sn-list',this.el).width();
                if(listWidth<width){//如果父元素的宽度<组件的宽度
                    $('.sn-list .sn-list-table',this.el).width(width);//设置table的宽度为组件宽度
                    $('.sn-list .sn-table',this.el).width(listWidth);//设置table外层div的宽度为父元素的宽度，使组件显示横向滚动条
                }
                //否则组件自动撑满父元素
            }
            if(options.listHeight){
                $('.sn-list .sn-table',this.el).height(options.listHeight); 
            }
            var me = this;
            this.$el.find('.sortDown').on('click',function(){
                var sortIndex = me.$el.find('th').index($(this).closest('th'))-1;
                me.searchParam.sortField = me.options.field.items[sortIndex].name;
                me.searchParam.sorting = 1;
                me.url = 'data/list_list.json';
                me.search(me.searchParam,0);
            });
            this.$el.find('.sortUp').on('click',function(){
                var sortIndex = me.$el.find('th').index($(this).closest('th'))-1;
                me.searchParam.sortField = me.options.field.items[sortIndex].name;
                me.searchParam.sorting = -1;
                me.url = 'data/list_list.json';
                me.search(me.searchParam,0);
            });
        },
        getSelected:function(){
            return this.selectedData;
        },
        getCheckedRows:function(){
            var models = _.filter(this.collection.models,function(item) { 
                return item.toJSON().checked == '1';
            });
            return _.map(models, function(item){
                return item.toJSON();
            });
        },
        refresh:function(){
            // this.loaded = 0;
            loading.call(this, this.objPagination.currentPage || 0);
        },
        search:function(searchParam, pageIndex){
            this.loaded = 0;
            this.searchParam = searchParam;
            if(this.searchParam && !this.searchParam.sorting && this.options.field.items){
                for(var i = 0;i<this.options.field.items.length;i++){
                    if(this.options.field.items[i].sorting && this.options.field.items[i].name){
                        this.searchParam.sorting = this.options.field.items[i].sorting;
                        this.searchParam.sortField = this.options.field.items[i].name;
                        break;
                    }
                }
            }
            loading.call(this,pageIndex || 0);
        },
        load:function(beans){
            loading.call(this,beans);
        },
        btnClick:function(e){
            var target = e.target||e.currentTarget,
                items = this.options.page.button.items,
                i = target.className.slice(13,14);
            if(items[i].click){
                items[i].click(e,items[i]);
            }
        }       
    });
    return objClass;
});



(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('@charset \"UTF-8\";\r\n*{margin:0;padding:0;}\r\n.clearfix:before,.clearfix:after{content: \"\";display: table;line-height: 0;}\r\n.clearfix:after{clear: both;}\r\n.clearfix{*zoom:1;}\r\n\r\n/* sn-list */\r\n.sn-list { position: relative;}\r\n.sn-list .sn-table { overflow: auto; }\r\n.sn-list table {width: 100%;  font-size: 12px; border-collapse: collapse; border-spacing: 0; background: #FFF;}\r\n.sn-list table th { padding: 8px; height: 20px; text-align: left; background: #e8eff2; color: #78909c; font-weight: normal; border-bottom: 1px solid #d7e0e6; white-space:nowrap;word-break:keep-all;}\r\n.sn-list table td { padding: 8px; text-align: left; border-bottom: 1px solid #eaeef1; color: #222; line-height: 16px;white-space:nowrap;word-break:keep-all; }\r\n.sn-list tfoot td.tooltip a { color: #9aacbd;text-decoration: none;}\r\n.sn-list thead .checkAllWraper { width:40px; }\r\n.sn-list tfoot td { border:none;}\r\n.sn-list tbody > tr:nth-child(even) > td { background-color: #f7f9fa; }\r\n.sn-list tbody > tr:hover > td { background-color: #e9f5ff; }\r\n.sn-list tbody > tr.selected td { background-color: #e5f3fa; }\r\n.sn-list tbody > tr.selected:hover td { background-color: #e5f3fa; }\r\n.sn-list tbody > tr.info td { background-color: #d5edf8; }\r\n.sn-list tbody > tr.info:hover td { background-color: #bfe4f4; }\r\n.sn-list tbody > tr.success td { background-color: #e6efc2; }\r\n.sn-list tbody > tr.success:hover td { background-color: #deeaae; }\r\n.sn-list tbody > tr.error td { background-color: #fbe3e4; }\r\n.sn-list tbody > tr.error:hover td { background-color: #f8cdce; }\r\n.sn-list tbody > tr.warning td { background-color: #fff6bf; }\r\n.sn-list tbody > tr.warning:hover td { background-color: #fff2a6; }\r\n.sn-list tbody > tr .btnStyles > a {display: inline-block;margin-right: 10px;}\r\n\r\n.sn-list .sn-listFooter {overflow: hidden;}\r\n/*buttons*/\r\n.sn-list .btns { float: left; padding: 0px; height: 22px; line-height: 22px; padding: 0 10px; vertical-align: middle; margin-top: 4px;}\r\n\r\n.sn-list .btns .btn { height: 22px; outline: none; font-size: 12px; line-height: 22px; color:#0085d0; padding:0 10px;  border: 1px solid #0085d0; border-radius: 3px; background: #FFF;}\r\n.sn-list .btns .btn:hover { background: #e5f3fa; }\r\n.sn-list .btns .btn:active { background: #eaeef1; }\r\n\r\n/* pagination */\r\n.sn-list .pagination { float: right; margin: 0 0 10px; text-align: right; font-size: 12px; }\r\n.sn-list .pagination span,\r\n.sn-list .pagination a {  margin: 0 3px; display: inline-block; float:none !important; }\r\n.sn-list .pagination .current { background: #FFF; color:#0085d0;  border: 1px solid #0085d0; }\r\n.sn-list .pagination .current, \r\n.sn-list .pagination .disabled, \r\n.sn-list .pagination a { padding: 0 8px; line-height: 22px; height: 22px; text-decoration: none; \r\n\r\n}\r\n.sn-list .pagination .prev:before{\r\n    content:\"＜\";\r\n}\r\n.sn-list .pagination .next:before{\r\n    content:\"＞\";\r\n}\r\n.sn-list .pagination a { color: #666; background: #FFF; border: 1px solid #d0d6d9;  }\r\n.sn-list .pagination a:hover { text-decoration: none; color: #0085d0; background-color: #FFF; border: 1px solid #0085d0; }\r\n.sn-list .pagination .current span { background: #FFF; color: #0085d0; border: 1px solid #0085d0; }\r\n.sn-list .pagination .disabled span { color: #AAA; }\r\n.sn-list .pagination input,\r\n.sn-list .pagination select{border: solid 1px #ddd; width: 30px; padding: 4px 0;}\r\n.sn-list .buttons>div { display: inline-block; }\r\n\r\n.sn-list .pagination .total { color: #999; }\r\n.sn-list .pagination .selectPerPage { border-radius: 0; width: 50px; }\r\n.sn-list .pagination .per-page em,.sn-list .pagination .input-box em { color: #999; font-style: normal; }\r\n.sn-list .pagination .per-page,.sn-list .pagination .input-box { margin-left: 16px; }\r\n\r\n/* sn-list-loading */\r\n.sn-list .blockOverlay { display:none; }\r\n.sn-list-loading .blockOverlay {  display:block; opacity: 0.6;width:100%; position:absolute; background:#FFF; left:0; top:35px; bottom:53px;}\r\n.sn-list-loading .blockOverlay div { height:20px; position:absolute; left:50%; top:50%; margin-left:-40px; margin-top:-10px; font-size:12px; color:#888;}\r\n.sn-list-loading .blockOverlay div img { float:left; margin-top:2px; margin-right:6px;}\r\n.sn-list-loading .blockOverlay div span { display:block; float:left; line-height:18px; font-size:12px; color:#888;}\r\n.sn-list-loading .blockOverlay div:after { content: \" \"; display: block; height: 0; clear: both; visibility: hidden;}\r\n\r\n/* sn-tip-content */\r\n.sn-tip-content { font-size: 12px; }\r\n.sn-tip-content > ul li { list-style: none; height: 24px; line-height: 24px; float: left; color: #777; margin-right: 20px;}\r\n.sn-tip-content > ul li > label { display: inline-block; text-align: right; }\r\n.sn-tip-content > ul li > span { display: inline-block; }\r\n.sn-tip-content > ul li.width-all { width: 100%; }\r\n.sn-tip-content > ul li.width-all > label { width: auto; }\r\n.sn-tip-content > ul li.space-line { width: 100%; margin: 4px auto; height: 1px; border-bottom: 1px dotted #DDD; }\r\n\r\n/*列表提示样式 add 2016-1-30*/\r\n.sn-list-tip {font-size: 12px;color: #777;line-height:24px;overflow: hidden;}\r\n.sn-list-tip .list-items{border-top: 1px dotted #ddd;padding: 10px 0;margin-top: -1px;}\r\n.sn-list-tip .list-items h3{color: #666;margin-bottom: 10px;}\r\n.sn-list-tip .list-level{float: left;}\r\n.sn-list-tip .list-level label{display: inline-block;/*min-width: 120px;*/text-align: right;}\r\n\r\n\r\n/*暂无记录*/\r\n\r\n.sn-norecord { text-align: center; padding-top: 10px; }\r\n.sn-norecord p { font-size: 14px; margin: 0; line-height: 24px; color: #999;}\r\n/*!\r\n * ui-dialog.css\r\n * Date: 2014-07-03\r\n * https://github.com/aui/artDialog\r\n * (c) 2009-2014 TangBin, http://www.planeArt.cn\r\n *\r\n * This is licensed under the GNU LGPL, version 2.1 or later.\r\n * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html\r\n */\r\n.ui-dialog {\r\n    *zoom:1;\r\n    _float: left;\r\n    position: relative;\r\n    background-color: #FFF;\r\n    border: 1px solid #CCC;\r\n    border-radius: 6px;\r\n    outline: 0;\r\n    background-clip: padding-box;\r\n    font-family: Helvetica, arial, sans-serif;\r\n    font-size: 14px;\r\n    line-height: 1.428571429;\r\n    color: #333;\r\n    opacity: 0;\r\n    -webkit-transform: scale(0);\r\n    transform: scale(0);\r\n    -webkit-transition: -webkit-transform .15s ease-in-out, opacity .15s ease-in-out;\r\n    transition: transform .15s ease-in-out, opacity .15s ease-in-out;\r\n}\r\n.ui-popup-show .ui-dialog {\r\n    opacity: 1;\r\n    -webkit-transform: scale(1);\r\n    transform: scale(1);\r\n}\r\n.ui-popup-focus .ui-dialog {\r\n    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);\r\n}\r\n.ui-popup-modal .ui-dialog {\r\n    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1), 0 0 256px rgba(255, 255, 255, .3);\r\n}\r\n.ui-dialog-grid {\r\n    width: auto;\r\n    margin: 0;\r\n    border: 0 none;\r\n    border-collapse:collapse;\r\n    border-spacing: 0;\r\n    background: transparent;\r\n}\r\n.ui-dialog-header,\r\n.ui-dialog-body,\r\n.ui-dialog-footer {\r\n    padding: 0;\r\n    border: 0 none;\r\n    text-align: left;\r\n    background: transparent;\r\n}\r\n.ui-dialog-header {\r\n    white-space: nowrap;\r\n    border-bottom: 1px solid #d0d6d9;\r\n}\r\n.ui-dialog-close {\r\n    position: relative;\r\n    _position: absolute;\r\n    float: right;\r\n    top: 11px;\r\n    right: 12px;\r\n    _height: 26px;\r\n    padding: 0 4px;\r\n    font-size: 28px;\r\n    font-family: arial;\r\n    line-height: 1;\r\n    color: #78909c;\r\n    text-shadow: 0 1px 0 #FFF;\r\n    cursor: pointer;\r\n    background: transparent;\r\n    _background: #FFF;\r\n    border: 0;\r\n    -webkit-appearance: none;\r\n}\r\n.ui-dialog-close:hover,\r\n.ui-dialog-close:focus {\r\n    color: #000000;\r\n    text-decoration: none;\r\n    cursor: pointer;\r\n    outline: 0;\r\n}\r\n.ui-dialog-title {\r\n    margin: 0;\r\n    color: #222;\r\n    font-size: 16px;\r\n    line-height: 1.428571429;\r\n    min-height: 16.428571429px;\r\n    padding: 14px;\r\n    overflow:hidden; \r\n    white-space: nowrap;\r\n    text-overflow: ellipsis;\r\n    font-weight: bold;\r\n    cursor: default;\r\n}\r\n.ui-dialog-content {\r\n    display: inline-block;\r\n    position: relative;\r\n    vertical-align: middle;\r\n    *zoom: 1;\r\n    *display: inline;\r\n    text-align: left;\r\n    overflow: auto;\r\n}\r\n.ui-dialog-footer {\r\n    padding: 13px;\r\n    text-align: center;\r\n    background: #F9FAFC; \r\n    border-top: 1px solid #EAEEF1; \r\n    border-radius: 0 0 4px 4px;\r\n    height:20px;\r\n}\r\n.ui-dialog-statusbar {\r\n    float: left;\r\n    margin-right: 20px;\r\n    padding: 6px 0;\r\n    line-height: 1.428571429;\r\n    font-size: 14px;\r\n    color: #888;\r\n    white-space: nowrap;\r\n}\r\n.ui-dialog-statusbar label:hover {\r\n    color: #333;\r\n}\r\n.ui-dialog-statusbar input,\r\n.ui-dialog-statusbar .label {\r\n    vertical-align: middle;\r\n}\r\n.ui-dialog-button {\r\n    /*float: right;*/\r\n    white-space: nowrap;\r\n}\r\n.ui-dialog-footer button+button {\r\n    margin-bottom: 0;\r\n    margin-left: 30px;\r\n}\r\n.ui-dialog-footer button {\r\n    overflow:visible;\r\n    display: inline-block;\r\n    padding: 6px 52px;\r\n    _margin-left: 5px;\r\n    margin-bottom: 0;\r\n    font-size: 14px;\r\n    font-weight: normal;\r\n    line-height: 1.428571429;\r\n    text-align: center;\r\n    white-space: nowrap;\r\n    vertical-align: middle;\r\n    cursor: pointer;\r\n    background-image: none;\r\n    border: 1px solid transparent;\r\n    border-radius: 3px;\r\n}\r\n\r\n.ui-dialog-footer button:hover,\r\n.ui-dialog-footer button:focus {\r\n  color: #333333;\r\n  text-decoration: none;\r\n}\r\n\r\n.ui-dialog-footer button:active {\r\n  background-image: none;\r\n  outline: 0;\r\n}\r\n.ui-dialog-footer button[disabled] {\r\n  pointer-events: none;\r\n  cursor: not-allowed;\r\n  opacity: 0.65;\r\n  filter: alpha(opacity=65);\r\n}\r\n\r\n.ui-dialog-footer button {\r\n  color: #0085d0;\r\n  background-color: #ffffff;\r\n  border-color: #d0d6d9;\r\n  outline: none;\r\n}\r\n\r\n.ui-dialog-footer button:hover,\r\n.ui-dialog-footer button:focus {\r\n  color: #0085d0;\r\n  background-color: #e5f3fa;\r\n  border-color: #d0d6d9;\r\n}\r\n\r\n.ui-dialog-footer button:active {\r\n  color: #0085d0;\r\n  background-color: #eaeef1;\r\n  border-color: #d0d6d9;\r\n}\r\n\r\n.ui-dialog-footer button:active{\r\n  background-image: none;\r\n}\r\n\r\n.ui-dialog-footer button[disabled],\r\n.ui-dialog-footer button[disabled]:hover,\r\n.ui-dialog-footer button[disabled]:focus,\r\n.ui-dialog-footer button[disabled]:active {\r\n  background-color: #ffffff;\r\n  border-color: #cccccc;\r\n}\r\n\r\n.ui-dialog-footer button.ui-dialog-autofocus {\r\n  color: #ffffff;\r\n  background-color: #0085d0;\r\n  border-color: #0085d0;\r\n}\r\n\r\n.ui-dialog-footer button.ui-dialog-autofocus:hover,\r\n.ui-dialog-footer button.ui-dialog-autofocus:focus {\r\n  color: #ffffff;\r\n  background-color: #1a91d4;\r\n  border-color: #1a91d4;\r\n}\r\n\r\n.ui-dialog-footer button.ui-dialog-autofocus:active {\r\n  color: #ffffff;\r\n  background-color: #0077ba;\r\n  border-color: #0077ba;\r\n}\r\n.ui-popup-top-left .ui-dialog,\r\n.ui-popup-top .ui-dialog,\r\n.ui-popup-top-right .ui-dialog {\r\n    top: -8px;\r\n}\r\n.ui-popup-bottom-left .ui-dialog,\r\n.ui-popup-bottom .ui-dialog,\r\n.ui-popup-bottom-right .ui-dialog {\r\n    top: 8px;\r\n}\r\n.ui-popup-left-top .ui-dialog,\r\n.ui-popup-left .ui-dialog,\r\n.ui-popup-left-bottom .ui-dialog {\r\n    left: -8px;\r\n}\r\n.ui-popup-right-top .ui-dialog,\r\n.ui-popup-right .ui-dialog,\r\n.ui-popup-right-bottom .ui-dialog {\r\n    left: 8px;\r\n}\r\n\r\n.ui-dialog-arrow-a,\r\n.ui-dialog-arrow-b {\r\n    position: absolute;\r\n    display: none;\r\n    width: 0;\r\n    height: 0;\r\n    overflow:hidden;\r\n    _color:#FF3FFF;\r\n    _filter:chroma(color=#FF3FFF);\r\n    border:8px dashed transparent;\r\n}\r\n.ui-popup-follow .ui-dialog-arrow-a,\r\n.ui-popup-follow .ui-dialog-arrow-b{\r\n    display: block;\r\n}\r\n.ui-popup-top-left .ui-dialog-arrow-a,\r\n.ui-popup-top .ui-dialog-arrow-a,\r\n.ui-popup-top-right .ui-dialog-arrow-a {\r\n    bottom: -16px;\r\n    border-top:8px solid #7C7C7C;\r\n}\r\n.ui-popup-top-left .ui-dialog-arrow-b,\r\n.ui-popup-top .ui-dialog-arrow-b,\r\n.ui-popup-top-right .ui-dialog-arrow-b {\r\n    bottom: -15px;\r\n    border-top:8px solid #fff;\r\n}\r\n.ui-popup-top-left .ui-dialog-arrow-a,\r\n.ui-popup-top-left .ui-dialog-arrow-b  {\r\n    left: 15px;\r\n}\r\n.ui-popup-top .ui-dialog-arrow-a,\r\n.ui-popup-top .ui-dialog-arrow-b  {\r\n    left: 50%;\r\n    margin-left: -8px;\r\n}\r\n.ui-popup-top-right .ui-dialog-arrow-a,\r\n.ui-popup-top-right .ui-dialog-arrow-b {\r\n    right: 15px;\r\n}\r\n.ui-popup-bottom-left .ui-dialog-arrow-a,\r\n.ui-popup-bottom .ui-dialog-arrow-a,\r\n.ui-popup-bottom-right .ui-dialog-arrow-a {\r\n    top: -16px;\r\n    border-bottom:8px solid #7C7C7C;\r\n}\r\n.ui-popup-bottom-left .ui-dialog-arrow-b,\r\n.ui-popup-bottom .ui-dialog-arrow-b,\r\n.ui-popup-bottom-right .ui-dialog-arrow-b {\r\n    top: -15px;\r\n    border-bottom:8px solid #fff;\r\n}\r\n.ui-popup-bottom-left .ui-dialog-arrow-a,\r\n.ui-popup-bottom-left .ui-dialog-arrow-b {\r\n    left: 15px;\r\n}\r\n.ui-popup-bottom .ui-dialog-arrow-a,\r\n.ui-popup-bottom .ui-dialog-arrow-b {\r\n    margin-left: -8px;\r\n    left: 50%;\r\n}\r\n.ui-popup-bottom-right .ui-dialog-arrow-a,\r\n.ui-popup-bottom-right .ui-dialog-arrow-b {\r\n    right: 15px;\r\n}\r\n.ui-popup-left-top .ui-dialog-arrow-a,\r\n.ui-popup-left .ui-dialog-arrow-a,\r\n.ui-popup-left-bottom .ui-dialog-arrow-a {\r\n    right: -16px;\r\n    border-left:8px solid #7C7C7C;\r\n}\r\n.ui-popup-left-top .ui-dialog-arrow-b,\r\n.ui-popup-left .ui-dialog-arrow-b,\r\n.ui-popup-left-bottom .ui-dialog-arrow-b {\r\n    right: -15px;\r\n    border-left:8px solid #fff;\r\n}\r\n.ui-popup-left-top .ui-dialog-arrow-a,\r\n.ui-popup-left-top .ui-dialog-arrow-b {\r\n    top: 15px;\r\n}\r\n.ui-popup-left .ui-dialog-arrow-a,\r\n.ui-popup-left .ui-dialog-arrow-b {\r\n    margin-top: -8px;\r\n    top: 50%;\r\n}\r\n.ui-popup-left-bottom .ui-dialog-arrow-a,\r\n.ui-popup-left-bottom .ui-dialog-arrow-b {\r\n    bottom: 15px;\r\n}\r\n.ui-popup-right-top .ui-dialog-arrow-a,\r\n.ui-popup-right .ui-dialog-arrow-a,\r\n.ui-popup-right-bottom .ui-dialog-arrow-a {\r\n    left: -16px;\r\n    border-right:8px solid #7C7C7C;\r\n}\r\n.ui-popup-right-top .ui-dialog-arrow-b,\r\n.ui-popup-right .ui-dialog-arrow-b,\r\n.ui-popup-right-bottom .ui-dialog-arrow-b {\r\n    left: -15px;\r\n    border-right:8px solid #fff;\r\n}\r\n.ui-popup-right-top .ui-dialog-arrow-a,\r\n.ui-popup-right-top .ui-dialog-arrow-b {\r\n    top: 15px;\r\n}\r\n.ui-popup-right .ui-dialog-arrow-a,\r\n.ui-popup-right .ui-dialog-arrow-b {\r\n    margin-top: -8px;\r\n    top: 50%;\r\n}\r\n.ui-popup-right-bottom .ui-dialog-arrow-a,\r\n.ui-popup-right-bottom .ui-dialog-arrow-b {\r\n    bottom: 15px;\r\n}\r\n\r\n\r\n@-webkit-keyframes ui-dialog-loading {\r\n    0% {\r\n        -webkit-transform: rotate(0deg);\r\n    }\r\n    100% {\r\n        -webkit-transform: rotate(360deg);\r\n    }\r\n}\r\n@keyframes ui-dialog-loading {\r\n    0% {\r\n        transform: rotate(0deg);\r\n    }\r\n    100% {\r\n        transform: rotate(360deg);\r\n    }\r\n}\r\n\r\n.ui-dialog-loading {\r\n    vertical-align: middle;\r\n    position: relative;\r\n    display: block;\r\n    *zoom: 1;\r\n    *display: inline;\r\n    overflow: hidden;\r\n    width: 32px;\r\n    height: 32px;\r\n    top: 50%;\r\n    margin: -16px auto 0 auto;\r\n    font-size: 0;\r\n    text-indent: -999em;\r\n    color: #666;\r\n}\r\n.ui-dialog-loading {\r\n    width: 100%\\9;\r\n    text-indent: 0\\9;\r\n    line-height: 32px\\9;\r\n    text-align: center\\9;\r\n    font-size: 12px\\9;\r\n}\r\n\r\n.ui-dialog-loading::after {\r\n    position: absolute;\r\n    content: \'\';\r\n    width: 3px;\r\n    height: 3px;\r\n    margin: 14.5px 0 0 14.5px;\r\n    border-radius: 100%;\r\n    box-shadow: 0 -10px 0 1px #ccc, 10px 0px #ccc, 0 10px #ccc, -10px 0 #ccc, -7px -7px 0 0.5px #ccc, 7px -7px 0 1.5px #ccc, 7px 7px #ccc, -7px 7px #ccc;\r\n    -webkit-transform: rotate(360deg);\r\n    -webkit-animation: ui-dialog-loading 1.5s infinite linear;\r\n    transform: rotate(360deg);\r\n    animation: ui-dialog-loading 1.5s infinite linear;\r\n    display: none\\9;\r\n}\r\n.pagination {\r\n    font-size:12px;\r\n}\r\n        \r\n.pagination a {\r\n    text-decoration: none;\r\n\tborder: solid 1px #AAE;\r\n\tcolor: #15B;\r\n}\r\n\r\n.pagination a, .pagination span {\r\n    display: block;\r\n    float: left;\r\n    padding: 2px 0px;\r\n    margin-right: 5px;\r\n\tmargin-bottom: 5px;\r\n}\r\n\r\n.pagination .current {\r\n    background: #26B;\r\n    color: #fff;\r\n\tborder: solid 1px #AAE;\r\n}\r\n\r\n.pagination .current.prev, .pagination .current.next{\r\n\tcolor:#999;\r\n\tborder-color:#999;\r\n\tbackground:#fff;\r\n}\r\n\r\n.pagination .input-box select { height:25px; margin:0 0 0 3px;  }\r\n/*!\r\n* jquery.fixedHeaderTable. The jQuery fixedHeaderTable plugin\r\n*\r\n* Copyright (c) 2011 Mark Malek\r\n* http://fixedheadertable.com\r\n*\r\n* Licensed under MIT\r\n* http://www.opensource.org/licenses/mit-license.php\r\n* \r\n* http://docs.jquery.com/Plugins/Authoring\r\n* jQuery authoring guidelines\r\n*\r\n* Launch  : October 2009\r\n* Version : 1.3\r\n* Released: May 9th, 2011\r\n*\r\n* \r\n* all CSS sizing (width,height) is done in pixels (px)\r\n*/\r\n\r\n/* @group Reset */\r\n\r\n.fht-table,\r\n.fht-table thead,\r\n.fht-table tfoot,\r\n.fht-table tbody,\r\n.fht-table tr,\r\n.fht-table th,\r\n.fht-table td {\r\n\t/* position */\r\n    margin: 0;\r\n    \r\n    /* size */\r\n\tpadding: 0;\r\n\r\n\t/* text */\r\n\tfont-size: 100%;\r\n\tfont: inherit;\r\n\tvertical-align: top;\r\n\t}\r\n\r\n.fht-table {\r\n\t/* appearance */\r\n    border-collapse: collapse;\r\n    border-spacing: 0;\r\n\t}\r\n\r\n/* @end */\r\n\r\n/* @group Content */\r\n\r\n.fht-table-wrapper,\r\n.fht-table-wrapper .fht-thead,\r\n.fht-table-wrapper .fht-tfoot,\r\n.fht-table-wrapper .fht-fixed-column .fht-tbody,\r\n.fht-table-wrapper .fht-fixed-body .fht-tbody,\r\n.fht-table-wrapper .fht-tbody {\r\n\t/* appearance */\r\n\toverflow: hidden;\r\n\t\r\n\t/* position */\r\n\tposition: relative;\r\n\t}\r\n\r\n\t.fht-table-wrapper .fht-fixed-body .fht-tbody,\r\n\t.fht-table-wrapper .fht-tbody {\r\n\t\t/* appearance */\r\n\t    overflow: auto;\r\n\t    margin-top:0;\r\n\t\t}\r\n\r\n\t\t.fht-table-wrapper .fht-table .fht-cell {\r\n\t\t\t/* appearance */\r\n\t\t\toverflow: hidden;\r\n\t\t\t\r\n\t\t\t/* size */\r\n\t\t    height: 1px;\r\n\t\t\t}\r\n\t\r\n\t.fht-table-wrapper .fht-fixed-body,\r\n\t.fht-table-wrapper .fht-fixed-column {\r\n\t    /* position */\r\n\t    top: 0;\r\n\t    left: 0;\r\n\t    position: absolute;\r\n\t    }\r\n\t    \r\n\t.fht-table-wrapper .fht-fixed-column {\r\n\t    /* position */\r\n\t    z-index: 1;\r\n\t    }\r\n\r\n/* @end */');
