//Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Signals provide an event-like procedure for associating
 * callbacks to those that have the data needed by those callbacks.  Instead of
 * the typical event procedure where an object must "be" an event target and
 * dispatches multiple event types through a single function.  The Signal
 * approach allows objects to designate/own only those signals that it creates.
 * Then listeners will attach to the specific signal of interest, and are
 * called immediately when the signal fires.  The signal is meant to offer a
 * non-DOM oriented approach that does not include event bubbling or others
 * to intercept data being listened to.
 *
 * Notice that all the public functions are not exported.  That is left to the
 * user to either export the properties or create an object that maps the
 * correct namespace.
 *
 * Public Interface:
 *   common.events.Signal (constructor) - Constructs a new Signal object.
 *       See constructor documentation for more details.
 *
 *   addListener - Allows handler functions to be registered for the event
 *       associated with the Signal object.  When the object fires, all
 *       handlers will be called and passed data in the form of an object.
 *
 *   hasListener - Determines where or not a handler has been registered.
 *
 *   removeListener - Allows handlers to be unregistered for an event.
 *
 *   clear - Removes all listeners.
 *   fire - Called by the owning object with specific data.  The data is
 *       then passed to each handler as it is executed.
 *
 * TODO (jasonstredwick):
 *     -Decide on a proper namespace now that I have two variants.
 *     -Figure out if there is a way to decouple the clear/fire functions from
 *      the addListener, hasListener, and removeListener so only those
 *      available externally is visible to them.
 *
 * @author jasonstredwick@google.com (Jason Stredwick)
 */


goog.provide('common.events.Signal');



/**
 * Provides a class that can manage a set of unique handler functions that will
 * be called when the class is fired.  Any callback registered with the
 * listener is not modified.
 * @constructor
 */
common.events.Signal = function() {
  /**
   * Maintain a list of listeners and their related information.  Each entry
   * contains the callback wrapper and a key for identifying the corresponding
   * listener.
   * @type {Array.<{handler: function(...[*]), key: function(...[*])}>}
   * @private
   */
  this.listeners_ = [];
};


/**
 * Adds a handler to the managed set unless it is already present.
 * @param {function(...[*])} handler The callback to register.  This is the
 *     function that will be called when the signal is fired.
 * @param {function(...[*])=} opt_key A function used to identify the
 *     presence of the handler as a listener instead of the handler itself.
 *     This can be used in place of storing dynamic functions such as those
 *     generated by goog.partial.
 */
common.events.Signal.prototype.addListener = function(handler, opt_key) {
  if (!goog.isFunction(handler) || (opt_key && !goog.isFunction(opt_key))) {
    return;
  }

  var key = opt_key || handler;

  if (this.getIndex_(key) >= 0) {
    return;
  }

  this.listeners_.push({handler: handler, key: key});
};


/**
 * Determines if the handler identified by the given key is in the managed set.
 * @param {function(...[*])} key A function used to identify the handler to
 *     remove.  Typically, the key will be the handler itself unless the
 *     opt_key was given to addListener.
 * @return {boolean} Whether or not the handle is present.
 */
common.events.Signal.prototype.hasListener = function(key) {
  if (!goog.isFunction(key)) {
    return false;
  }

  var index = this.getIndex_(key);
  return index >= 0;
};


/**
 * Removes the handler identified by the given key from the managed set if
 * present.
 * @param {function(...[*])} key A function used to identify the handler to
 *     remove.  Typically, the key will be the handler itself unless the
 *     opt_key was given to addListener.
 */
common.events.Signal.prototype.removeListener = function(key) {
  if (!goog.isFunction(key)) {
    return;
  }

  var index = this.getIndex_(key);
  if (index < 0) {
    return;
  }

  this.listeners_.splice(index, 1);
};


/**
 * Removes all the listeners that are being managed.
 */
common.events.Signal.prototype.clear = function() {
  this.listeners_ = [];
};


/**
 * Calls all the listeners managed by this signal and pass on the given data.
 * The input to this function will be an arbitrary number of arguments.
 * @param {...*} var_args Can take a variable number of arguments or none.
 */
common.events.Signal.prototype.fire = function(var_args) {
  for (var i = 0; i < this.listeners_.length; ++i) {
    var handler = this.listeners_[i].handler;
    // TODO (jasonstredwick): Determine the security risk of passing an object
    // reference instead of a copy/readonly version of the object.
    handler.apply(null, arguments);
  }
};


/**
 * Traverses the list of listeners and returns listener's index that matches
 * the given key, or -1 if no match is found.
 * @param {function(...[*])} key A function used to identify the handler to
 *     remove.  Typically, the key will be the handler itself unless the
 *     opt_key was given to addListener.
 * @return {number} The matched listener's index or -1.
 * @private
 */
common.events.Signal.prototype.getIndex_ = function(key) {
  for (var i = 0; i < this.listeners_.length; ++i) {
    if (key == this.listeners_[i].key) {
      return i;
    }
  }

  return -1;
};
