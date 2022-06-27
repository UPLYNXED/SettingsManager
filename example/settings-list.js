/**
 * @fileoverview settings-list.js - Settings list configuration file for the Settings API for valk.cam
 * @author Caspar Neervoort "UPLYNXED"
 * @social https://twitter.com/UPLYNXED
 * @contact uplynxed @ valk.cam
 * @version 0.1.3.5
 * @date 2022-06-25
 * 
 * @license MIT
 * @preserve Copyright (c) 2022 Caspar Neervoort "UPLYNXED"
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * @description
 * This file contains the settings object for the Settings class in the settings-manager.js file.
 * The 'settings' object is an object containing child objects for each defined setting.
 * Each child object contains the following properties:
 * - s:				The setting's internal name matching the name of the object.
 * - v:				The setting's default value, which is replaced by a new value when the setting is changed.
 * - a:				The setting's attributes. An array of html attributes to be applied to the setting's input element in the generated settings UI. //TODO: Clean this one up, maybe turn it into an object?
 * - d:				The setting's details, an object containing the following properties:
 * - d.name:		The setting's name, human readable. This is used in the generated settings UI.
 * - d.description: The setting's description. This is used in the generated settings UI.
 * - d.type:		The setting's type, which is used to determine the type of input to generate in the settings UI.
 * - i:				Optional. The setting's initialization function if it needs any special initialization before the setting is initialized on page load.
 * - f:				Optional. A reserved space for any functions that need to be called from either the initialization function or the setting's option's functions.
 * - o:				The setting's options, an object containing an object for each option, named after the option's value.
 * - o.*:			The option's properties, an object containing the following properties:
 * - o.*.s:			The option's name, human readable. This is used in the generated settings UI. // TODO: Refactor to o.*.name
 * - o.*.f:			Optional. A reserved space for a function that needs to be called upon the option being selected. // TODO: Refactor to o.*.onSelect
 * - o.*.d:			Optional. Defines whether an option is disabled or not. // TODO: Refactor to o.*.a['disabled']
 * 
 * Functions in the setting's object are will always be called with the following arguments:
 * - args:			An array of arguments passed to the function.
 * - args.s:		The context of the Settings object handling the setting.
 * - args.this:		The context of the setting's individual object, useful for accessing the setting's properties and functions from any level inside the object.
 * - args.value:	The value passed to the function, if any.
 * 
 * @example
 * settingsList = {								// The parent object for all setting objects.
 *		"setting1": {							// A setting object
 *			"s": "setting1", 					// The setting's internal name matching the name of the object.
 *			"v": "default value", 				// The setting's default value, which is replaced by a new value when the setting is changed.
 *			"d": { 								// The setting's details, an object containing the following properties:
 *				"name": "Setting 1",			// The setting's name, human readable. This is used in the generated settings UI.
 *				"description": "This setting is used to do something and this is its description."
 *			},
 *			"i": function(args = {}) {			// Optional. The setting's initialization function if it needs any special initialization before the setting is initialized on page load.
 *				// Initialization code
 * 				// It is good practice to call the setting's setValue function to set the setting's value to the given value at the end of the initialization function.
 * 				args.s.setValue("setting1", {v: args.this.value});
 *			},
 *			"f": function(args = {}) {
 *				// Function code
 * 				// It is good practice to keep your code DRY by defining this function to handle repetitive tasks otherwise duplicated in each option function.
 * 				// It is also a good idea to return true if the function ran succesfully, and false if the function failed. The option functions can then return the output of this function.
 *			},
 *			"o": { 								// The setting's options, an object containing an object for each option, named after the option's value.
 *				"option1": {					// The option's properties object. The option's name is the option's value.
 *					"s": "Option 1",			// The option's name, human readable. This is used in the generated settings UI.
 *					"f": function(args = {}) { 
 * 						// Option function code to run when the option is selected. 
 * 						// It is good practice to keep your code DRY by utilizing the setting's top level "f" function to handle repetitive tasks shared by all option functions.
 * 						// It is also a good idea to return true if the function ran succesfully, and false if the function failed. The setting will show in an error state if the function returns false.
 * 						return true;
 * 					}
 *					"d": false 					// Optional. Defines whether an option is disabled or not.
 *				},
 *				"option2": {},					// Another option object.
 *  		}
 * 		},
 * 		"setting2": {},							// Another setting object.
 *	}
 */

 var settingsList = {
    "setting1": {
        "s": "setting1",
        "v": "option1",
        "d": {
            "name": "Setting 1",
            "description": "This setting is used to do something and this is its description.",
            "type": "cycle"
        },
        "i": function(args = {}) {
            // Initialization code
            // It is good practice to call the setting's setValue function to set the setting's value to the given value at the end of the initialization function.
            args.s.setValue("setting1", {v: args.this.value});
        },
        "f": function(args = {}) {
            // Function code
            // It is good practice to keep your code DRY by defining this function to handle repetitive tasks otherwise duplicated in each option function.
            // It is also a good idea to return true if the function ran succesfully, and false if the function failed. The option functions can then return the output of this function.
            return true;
        },
        "o": {
            "option1": {
                "s": "Option 1",
                "f": function(args = {}) {
                    // Option function code to run when the option is selected. 
                    // It is good practice to keep your code DRY by utilizing the setting's top level "f" function to handle repetitive tasks shared by all option functions.
                    // It is also a good idea to return true if the function ran succesfully, and false if the function failed. The setting will show in an error state if the function returns false.
                    return args.this.f();
                }
            },
            "option2": {
                "s": "Option 2",
                "f": function(args = {}) {
                    // Option function code to run when the option is selected. 
                    // It is good practice to keep your code DRY by utilizing the setting's top level "f" function to handle repetitive tasks shared by all option functions.
                    // It is also a good idea to return true if the function ran succesfully, and false if the function failed. The setting will show in an error state if the function returns false.
                    return args.this.f();
                }
            },
            "option3": {
                "s": "Option 3",
                "f": function(args = {}) {
                    // Option function code to run when the option is selected. 
                    // It is good practice to keep your code DRY by utilizing the setting's top level "f" function to handle repetitive tasks shared by all option functions.
                    // It is also a good idea to return true if the function ran succesfully, and false if the function failed. The setting will show in an error state if the function returns false.
                    return args.this.f();
                }
            }
        }
    }
}