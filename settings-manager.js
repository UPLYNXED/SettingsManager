/**
 * @fileoverview settings-manager.js - Settings Manager for the Settings API for valk.cam
 * @author Caspar Neervoort "UPLYNXED"
 * @social https://twitter.com/UPLYNXED
 * @contact uplynxed @ valk.cam
 * @version 0.1.3.5
 * @date 2022-06-25
 * 
 * @license MIT
 * @preserve (c) 2022 Caspar Neervoort "UPLYNXED"
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * @description
 * This file contains the settings manager class for valk.cam.
 * This class handles the initialization of the settings upon page load, setting and getting settings, saving and loading the settings to local storage, and generating and handling the settings UI.
 * 
 * @requires settings-list.js - Settings Configuration File (contains the setting objects)
 * 
 * @todo
 * - Make this class more platform agnostic (medium priority)
 * - Add support for templates for the settings UI elements (medium priority)
 * - Add support for toggleable settings sections to show and hide multiple settings at once in the settings UI (e.g. "Graphics Settings" and "UI Settings") (medium priority)
 * - Add support for toggle inputs for the settings UI to complement the cycle type inputs (medium priority)
 * - Add support for text field inputs for the settings UI (low priority)
 * - Add support for range inputs for the settings UI (very low priority)
 * - Add support for color inputs for the settings UI (extremely low priority)
 * 
 * @example
 * // Create a new settings manager instance
 * var settingsManager = new SettingsManager({
 * 		// The settings configuration object
 * 		settings: settingsList,
 * 		// The settings UI container element
 *		container: document.getElementById("settings-container"),
 * }
 * 
 * // Get a setting value
 * var settingValue = settingsManager.get("setting-name");
 * 
 * // Set a setting value
 * settingsManager.set("setting-name", {v: "value"});
 */

// A class for managing settings in localStorage and a global object called "Settings" for settings.
// The settings are stored in localStorage and are updated when the user changes a setting.
// The global object is updated when the user changes a setting.
// The settings will be set to the default value if they are not set in localStorage.
// The default values are also contained in the global object "Settings".
// The global object also contains functions that are executed when the user changes a setting based on the setting value.

/**
 * @class SettingsManager
 * @namespace SettingsManager
 * @see constructor for parameters
 */
 class SettingsManager {
	#settings = {}; // Will contain the settings object.
	#defaults = {}; // Will contain the settings object as it is initially created, and will be frozen to prevent any modifications.
	#container = { // Will contain the HTMLelement to insert the settings buttons into.
		element: null,
		original: null,
		isPresent: false,
		observer: null,
	};

	/**
	 * @constructor
	 * @param {Object} parameters.settings - The settings to be stored in localStorage.
	 * @param {HTMLElement} parameters.container - The DOM element to insert the settings buttons into.
	 * @param {Boolean} parameters.DOM - Optional - Defaults to TRUE. Whether or not to insert the settings buttons into the DOM on initialization.
	 * @param {Boolean} parameters.init - Optional - Defaults to TRUE. Whether or not to initialize the settings on initialization.
	 * 
	 * // Create a new Settings object.
	 * var settings = new Settings({
	 * settings: settingsList,
	 * container: document.getElementById("settings-container"),
	 * DOM: true,
	 * init: true,
	 * });
	 */
	constructor(parameters = {"DOM": true, "init": true}) {
		if(parameters.DOM === undefined) parameters.DOM = true;
		if(parameters.init === undefined) parameters.init = true;

		// Copy the provided settings into the settings object.
		this.#settings = parameters.settings || console.error("SETTINGS: No settings provided.");

		// duplicate the settings object and add it to the defaults object before any modifications are made to the original settings object.
		this.#defaults = this.#settings;
		Object.freeze(this.#defaults);
		
		// set container to the element that the settings will be inserted into.
		this.#container.original = parameters.container; 
		this.#container.element = this.#resolveElement(parameters.container); 

		// If the container element is present at execution, insert the settings buttons into the DOM and initialize the settings.
		if(this.#container.isPresent) {
			// Insert the settings into the container.
			if (parameters.DOM === true) {
				this.insertDOM(this.#container.element);
			}

			// Initialize the settings
			if (parameters.init === true) {
				try {
					this.init();
				} catch (e) {
					console.error(`SETTINGS: Error initializing settings. \n ${e}`);
				}
			}
		} else { // If the container element is not present at execution, fall back to using watchForContainer.
			console.debug(`SETTINGS: Specified container element is not valid or does not exist at the time of SettingsManager initialization.`);
			console.debug(`SETTINGS: SettingsManager will fall back to the "watchForContainer" method and try to insert the settings into the DOM later.`);
			this.#watchForContainer();
		}
	}

	// Initialize the settings values when an instance of the Settings class is created.
	// This function takes no arguments.
	// The function is only executed once.
	// 
	// Some settings have custom initialization functions named "i" that are executed when the setting is initialized.
	// The function is executed with an object argument containing the setting's context as "this", the Settings class' context as "s" and a callback function as "c".
	// The callback function is meant to set the setting's value once the initialization function is done using the "setSetting" function.
	// The function should log an error if a setting is not initialized successfully, and throw an error at the end of the function if there were any settings that were not initialized successfully.
	// The function should return true if the setting was initialized successfully, false otherwise.
	//
	// The function should get the setting's current value using the "getSetting" function.
	// The function should call the function "setSetting" to set the setting's value.
	/**
	 * @method init - Initialize the settings values.
	 * This function only needs to be called once per setting in the object "Settings".
	 */
	init() {
		// Initialize the settings.
		for (var setting in this.#settings) {
			// If the setting has an initialization function, call it.
			if (setting.i !== undefined) {
				// this.#settings[setting].i(this,   this.#settings[setting], this, this.setSetting);
				setting.i({s: this, this: this.#settings[setting]});
			} else {
				// If the setting does not have an initialization function, use "setSetting" to set the setting's value to the output of "getSetting".
				this.setSetting(setting, {v: this.getSetting(setting)});
			}
		}

		return this;
	}

	/** 
	 * @method #resolveElement - Resolve an element from either a provided HTMLElement, jQuery object, or string selector.
	 * @description This function adds some compatibility with jQuery but is also useful in case a provided element does not yet exist in the DOM when the instance of the Settings class is created and the "insertDOM()" function is called later.
	 * @param {HTMLElement|jQuery|String} element - The element to resolve.
	 * @returns {HTMLElement} - The resolved element.
	 * @throws {Error} - If the element could not be resolved.
	 */
	#resolveElement(element) {
		// If the element is an HTMLElement, set it as the resolved element.
		var elementResolved = element;

		// If the element is a jQuery object, set the first element in the jQuery object as the resolved element.
		if (element instanceof jQuery) {
			elementResolved = element[0];
		}

		// If the element is a string, try to resolve it as a selector.
		if (typeof element === "string") {
			var elementResolved = document.querySelector(element);
		}

		// If the element could not be resolved, throw an error.
		if (elementResolved === undefined || elementResolved === null) {
			console.debug(`SETTINGS: Could not resolve element at this time: %c"${element}".`, "color: red;");
			this.#container.isPresent = false;
		} else {
			this.#container.isPresent = true;
		}

		// Return the resolved element.
		return elementResolved;
	}

	/**
	 * @method #watchForContainer - Watch for the container element to be added to the DOM and then insert the settings into the container.
	 * @description This function is used when the container element is not yet in the DOM when the instance of the Settings class is created.
	 * @param {String} container - The container element query selector to watch for.
	 * @param {Object} args - Optional arguments.
	 * @param {Boolean} args.DOM - Whether to insert the settings into the container element or not upon the container element being detected in the DOM.
	 * @param {Boolean} args.init - Whether to initialize the settings or not upon the container element being detected in the DOM.
	 * @returns {Settings} - The Settings class instance.
	 */
	#watchForContainer(args = {container: this.#container.original, DOM: true, init: true}) {
		console.debug(`%cSETTINGS: %c#watchForContainer() %chas started for container element "${args.container}"`, 'color: #0f0;', 'color: #00f;', 'color: #0f0;');

		// Resolve the container element from the provided query selector.
		var resolveElement = this.#resolveElement(args.container);
		var that = this;

		// Internal function to handle the insertDOM and init functions.
		var insertDOMAndInit = ()=>{
			// Insert the settings into the container element.
			if (args.DOM === true) {
				try {
					this.insertDOM(this.#container.element);
				} catch (e) {
					console.error(`SETTINGS: %cwatchForContainer() %cError inserting settings into DOM, the container element is not valid or does not exist (yet). \n ${e}`, "color: #00f;", "color: initial;");
				}
			}

			// Initialize the settings
			if (args.init === true) {
				try {
					this.init();
				} catch (e) {
					console.error(`SETTINGS: %cwatchForContainer() %cError initializing settings. \n ${e}`, "color: #00f;", "color: initial;");
				}
			}
		}

		// Check if the container element is already in the DOM upon running the function.
		if (resolveElement !== null) {
			console.debug(`%cSETTINGS: Container element already in the DOM at the time of %cwatchForContainer() %cexecution, running insertDOM() and init() functions.`, 'color: #0f0;', 'color: #00f;', 'color: #0f0;');

			// Set the container element to the resolved element.
			this.#container.element = resolveElement;

			// If the container element is already in the DOM, insert the settings into the container element.
			insertDOMAndInit();

			return this;
		}

		// Check if an observer has already been created and if so, do not create another one.
		if (this.#container.observer == null) {
			// If the container element is not yet in the DOM, use a mutation observer to wait for it to be added to the DOM.
			this.#container.observer = new MutationObserver(function(mutations) {
				if (document.querySelector(args.container)) {
					console.debug(`%cSETTINGS: %cwatchForContainer() %cContainer element detected in the DOM, running insertDOM() and init() functions.`, 'color: #0f0;', 'color: #00f;', 'color: #0f0;');

					// Set the container element to the awaited element.
					that.#container.element = document.querySelector(args.container);

					// If the container element is detected in the DOM, insert the settings into the container element and initialize the settings.
					insertDOMAndInit();

					// Stop the mutation observer.
					that.#container.observer.disconnect();
				}
			});

			// Set the observer to observe the container element.
			console.debug(`%cSETTINGS: %cwatchForContainer() %cMutation Observer now watching for container element to be added to the DOM.`, 'color: #0f0;', 'color: #00f;', 'color: #0f0;');
			this.#container.observer.observe(document, {childList: true, subtree: true});
		}

		return this;
	}

	// Execute the function associated with the setting's options matching the value defined as the optional "value" argument.
	// If there is no value argument, it will substitute the setting's current value.
	// If there is no current value, it will substitute the setting's default value.
	// This function has an optional "args" argument that is an object of arguments to pass to the function associated with the setting's options matching the value.
	// If "args" is not defined, the function is executed with no arguments.
	// This function is executed whenever a setting is updated.
	// The function associated with the setting's options matching the value returns true if the function was executed successfully, false otherwise.
	// If the function returns true, another function named "updateDOM" is executed to reflect the change in the setting in the DOM.
	/**
	 * @method executeSetting - Execute the function associated with the setting's options matching the value defined as the optional "value" argument.
	 * @param {String} setting - The setting to execute the function for.
	 * @param {Object} args - The arguments to pass to the function associated with the setting's options matching the value.
	 * @param {String} args.value - The value to pass to the function associated with the setting's options matching the value.
	 * @param {Object} args.args - The arguments to pass directly to the function associated with the setting's options matching the value.
	 * @param {Object} args.args.this - Optional / Overridable. The context of the setting the option this function is associated with belongs to.
	 * @param {Object} args.args.s - DO NOT OVERRIDE. The Settings class' context, equivalent to "this" inside of the Settings class. Gives access to the Settings class' functions.
	 * @returns {Boolean} - True if the function was executed successfully, false otherwise.
	 */
	executeSetting(setting, args = {}) {
		var value = args.value || this.#settings[setting].v || this.#defaults[setting].v;
		var argsPassed = args.args || {};
			argsPassed.s = this;
			argsPassed.this = this.#settings[setting];
		var options = this.#settings[setting].o;
		try {
			if (options[value].f !== undefined) {
				(async () => {
					try {
						var result = await options[value].f(argsPassed);
						if (result === true) {
							this.updateDOM(setting, value);
						} else {
							this.updateDOM(setting, value, true);
						}
					} catch(e) {
						this.updateDOM(setting, value, true);
						console.error(`SETTINGS: Error executing the option's function for ${setting}["${value}"].\n Result: ${result}\n ${e}`);
					}
				})();
			} else {
				this.updateDOM(setting, value);
			}
		} catch(e) {
			console.error(`SETTINGS: Error executing the option's function for ${setting}["${value}"].\n ${e}`);
			//
		}
	}

	// Update the DOM elements associated with a given setting to reflect the setting's current value or a given value.
	// This function is executed whenever a setting is updated.
	// The function is executed with the setting's name and value as arguments.
	// The function should update the DOM elements associated with the setting to reflect the setting's current value or a given value.
	// The function should update the value of the button.TopButton to reflect the setting's current value or a given value.
	// The function should set add the "active" class to the button.SubButton which value matches the setting's current value or a given value and remove the "active" class from all button.SubButton which value does not match the setting's current value or a given value.
	// The span inside the button.TopButton should contain the setting's current value or a given value.
	// If there was a problem in setting the setting's value, a span matching with an id matching the setting's name inside the button.TopButton should be colored red and an error message should be displayed in the console.
	// If the setting is currently disabled, the error color should not be applied.
	/**
	 * @method updateDOM - Update the DOM elements associated with a given setting to reflect the setting's current value or a given value.
	 * @param {String} setting - The setting to update the DOM elements for.
	 * @param {String} value - The value to update the DOM elements to.
	 * @param {Boolean} error - Optional. True if there was an error setting the setting's value, false otherwise.
	 */
	updateDOM(setting, value, error = false) {
		// If there is no DOM element for the settings container or the setting itself, throw an error.
		if (this.#container.element === null || this.#container.element === undefined) {
			console.error(`SETTINGS: Could not update the DOM elements for ${setting}["${value}"] because the settings container is not defined. \n Settings container: ${this.#container}`);
			return false;
		} else if (this.#container.element.children.length === 0) { 
			// TODO: Implement a check for the presence of a setting's own DOM elements after templates are implemented.
			console.error(`SETTINGS: Could not update the DOM elements for ${setting}["${value}"] because the settings container does not have any children (and thus no settings UI). \n Settings container: ${this.#container}`);
			return false;
		}

		try {
			var buttonTop 	= document.querySelector("button.TopButton[name^='" + setting + "']");
			var buttonSub 	= document.querySelectorAll("button.SubButton[name='" + setting + "']");
			var span 		= document.querySelector("button.TopButton[name^='" + setting + "'] span");

			var settingValue = value || this.#settings[setting].v || this.#defaults[setting].v;
			var settingOptionName = this.#settings[setting].o[settingValue].s;
			
			var isDisabled = buttonTop.hasAttribute("disabled");

			// Update the button.TopButton to reflect the setting's current value or a given value.
			buttonTop.value = settingValue;

			// Update the button.SubButton Active class to reflect the setting's current value or a given value.
			buttonSub.forEach(function(button) {
				if (button.value === settingValue) {
					button.classList.add("Active");
				} else {
					button.classList.remove("Active");
				}
			});

			// Update the span element content to reflect the setting's current value or a given value.
			// The span element is inside the button.TopButton.
			// Set the span element to be colored red if there was a problem in setting the setting's value.
			span.innerHTML = settingOptionName;

			if (error && !isDisabled) {
				span.classList.add("error");
				span.style.color = "red";
			} else {
				span.classList.remove("error");
				span.style.color = "";
			}

			return true;
		} catch(e) {
			console.error(`SETTINGS: Error updating the DOM elements for ${setting}["${value}"].\n ${e}`);
			return false;
		}
	}

	// Generate a DOM structure inside of a DocumentFragment for the settings buttons and return it.
	// Each settings button is a button with a class of "TopButton" and a name matching the setting's name.
	// The button.TopButton has an attribute of "desc" matching the setting's description.
	// The button.TopButton has a label and a span element inside of it that contain the setting's name as well as the setting's default value or current value if it is set.
	// The button.TopButton if followed by a div element with a class of "SubMenu" containing a list of button.SubButton for each setting's option.
	// The button.SubButton have a value matching the setting's option's value.
	// The button.SubButton have a b element inside them that contains the setting's option's value.
	// If the button.SubButton's value matches the setting's current value or default value, the button.SubButton should have the class "active".
	// The function is executed with the setting's name and the button.SubButton's value as arguments.
	// The button.TopButton and div.SubMenu have tabindex attributes of "-1" to prevent them from being focused.
	/**
	 * @method generateDOM - Generate a DOM structure inside of a DocumentFragment for the settings buttons and return it.
	 * @returns {DocumentFragment} - The DocumentFragment containing the settings buttons.
	 */
	generateDOM() {
		var settings = this.#settings;
		var settingsDOM = document.createDocumentFragment();

		for(var setting in settings) {
			var settingName = setting;
			var settingNameText = settings[setting].d.name;
			var settingDescription = settings[setting].d.description;
			var settingValue = settings[setting].v;
			var settingType = settings[setting].d.type;
			var settingOptions = settings[setting].o;
			var settingOptionName = settings[setting].o[settingValue].s;
			var settingButtonAttributes = settings[setting].a;


			var settingDOM = document.createElement("button");
			settingDOM.className = "TopButton";
			settingDOM.name = (settingType == "submenu") ? settingName + "Top" : settingName;
			settingDOM.setAttribute("tabindex", "-1");
			settingDOM.setAttribute("desc", settingDescription);
			settingDOM.setAttribute("setting-type", settingType);
			settingDOM.innerHTML = "<label>" + settingNameText + "</label><span>" + settingOptionName + "</span>";

			if (settingButtonAttributes !== undefined) {
				for (var attribute in settingButtonAttributes) {
					if (attribute instanceof Array) {
						settingDOM.setAttribute(settingButtonAttributes[attribute][0], settingButtonAttributes[attribute][1]);
					} else {
						settingDOM.setAttribute(settingButtonAttributes[attribute], "true");
					}
				}
			}

			// If the setting type is "submenu", generate a div.SubMenu element and append it to the settingDOM.
			if (settings[setting].d.type === "submenu") {
				var subMenuDOM = document.createElement("div");
				subMenuDOM.className = "SubMenu";
				subMenuDOM.id = settingName;
				subMenuDOM.setAttribute("tabindex", "-1");

				// Iterate through each setting's option and create a button.SubButton for each option, then append it to the div.SubMenu.
				// Order the settings options by their value if they are numeric. Otherwise, keep the order they are in the settings object.
				// If the option is set as hidden (h), don't create a button.SubButton for it.
				// If the option is set as disabled (d), add the attribute "disabled" to the button.SubButton.
				var settingOptionsArray = [];
				for (var option in settingOptions) {
					settingOptionsArray.push(option);
				}

				if (settingOptionsArray instanceof Array) {
					if (!isNaN(parseFloat(settingOptions[settingOptionsArray[0]].s))) {
						settingOptionsArray.sort(function(a, b) {
							return b - a;
						});
					}
				}

				for (var i = 0; i < settingOptionsArray.length; i++) {
					var option = settingOptionsArray[i];
					if (settingOptions[option].h !== true) {
						var optionName = settingOptions[option].s;
						var optionValue = option;
						var optionDOM = document.createElement("button");
						optionDOM.className = "SubButton" + (optionValue === settingValue ? " Active": "");
						optionDOM.name = settingName;
						optionDOM.value = optionValue;
						optionDOM.innerHTML = "<b>" + optionName + "</b>";

						if (settingOptions[option].d !== undefined && settingOptions[option].d != false) {
							optionDOM.setAttribute("disabled", "true");
						}

						subMenuDOM.appendChild(optionDOM);
					}
				}

				settingsDOM.appendChild(settingDOM);
				settingsDOM.appendChild(subMenuDOM);
			} else {
				settingsDOM.appendChild(settingDOM);
			}
		}

		return settingsDOM;
	}

	// Insert the settings buttons into a given DOM element and bind the click event to the button.SubButton.
	// The function is executed with the DOM element as argument.
	// The function should insert the settings buttons into the DOM element.
	/**
	 * @method insertDOM - Insert the settings buttons into a given DOM element and bind the click events with #attachEvents().
	 * @param {HTMLElement} element - The DOM element to insert the settings buttons into.
	 * @param {jQuery} element - The jQuery element to insert the settings buttons into, if the given element is not a DOM element.
	 * @param {string} element - The selector of the element to insert the settings buttons into.
	 * @returns {this} - The Settings object.
	 */
	insertDOM(element = this.#container.element) {
		element = this.#resolveElement(element);

		if (!(element instanceof HTMLElement)) {
			console.error(`SETTINGS: Error inserting settings into DOM, the container element is not valid or does not exist (yet).`);
			console.info(`SETTINGS: SettingsManager will fall back to the "watchForContainer" method and try to insert the settings into the DOM later.`);
			this.#watchForContainer();
		}

		element.appendChild(this.generateDOM());

		this.#attachEvents(element);

		return this;
	}
	
	// Private function to attach the click event to parent element
	// The function is executed with the DOM element as argument.
	// The click events should be bound to the provided element from the element argument so that the events work dynamically.
	// The function should bind the click events for the button.SubButton and the button.TopButton.
	// When the button.SubButton is clicked it should execute setSetting with the setting's name and the button.SubButton's value.
	// If a button.TopButton of type "submenu" is clicked, it should open the div.SubMenu with the toggleSubMenu function passing on the event.target.
	// If a button.TopButton of type "cycle" is clicked, it should execute setSetting with the setting's name and the button.TopButton's value.
	// A "cycle" type button.TopButton should use the #getNextOption function to get the next option's value to pass to setSetting.
	/**
	 * @method #attachEvents - Attach the click events to the given parent element to handle click events for the settings buttons.
	 * @param {HTMLElement} element - The DOM element to attach the click events to.
	 */
	#attachEvents(element) {
		element.addEventListener("click", function (event) {
			switch (event.target.className) {
				case "TopButton":
					// Switch statement to determine whether the type of the setting is "submenu" or "cycle".
					switch (event.target.getAttribute("setting-type")) {
						case "submenu":
							// If the setting is a submenu, toggle the submenu.
							this.toggleSubMenu(event.target);
							break;
						case "cycle":
							// If the setting is a cycle, set the setting to the next option.
							this.setSetting(event.target.name, { v: this.#getNextOption(event.target.name, event.target.value).n });
							this.toggleSubMenu(event.target);
							break;
					}
					break;
				case "SubButton":
					this.setSetting(event.target.name, { v: event.target.value });
					break;
			}
		}.bind(this));
	}

	// Toggle the open class on the submenu of a given settings button where the id of the submenu is the same as the setting's name.
	// Remove the open class from all other submenus and add the open class to the submenu of the given settings button.
	// The name of the button has a suffix of "Top" to indicate that it is a top button, this needs to be removed before it is used as a setting name to find the submenu.
	// The button itself receives the "active" class to indicate that it is active while the submenu is open.
	// Do not toggle the submenu closed if the button currently has the active class or if it is in a focused state (matches the document.activeElement).
	// If the button has a setting-type of "cycle", all submenus should be closed and all buttons should have their active class removed.
	/**
	 * @method toggleSubMenu - Toggle the open class on the submenu of a given settings button where the id of the submenu is the same as the setting's name.
	 * @param {HTMLElement} button - The settings button to toggle the submenu of.
	 */
	toggleSubMenu(button) {
		var settingName = button.name.replace("Top", "");
		var subMenu = document.getElementById(settingName);
		
		// remove the open class from all other submenus that are not the submenu of the button that is currently being clicked.
		var subMenus = document.getElementsByClassName("SubMenu");
		for (var i = 0; i < subMenus.length; i++) {
			if (subMenus[i] !== subMenu) {
				subMenus[i].classList.remove("open");
			}
		}
		
		// remove the active class from all other buttons that are not the button that is currently being clicked.
		var buttons = document.getElementsByClassName("TopButton");
		for (var i = 0; i < buttons.length; i++) {
			if (buttons[i] !== button) {
				buttons[i].classList.remove("active");
			}
		}

		// if the button is not of the type "cycle", toggle the submenu open and add the active class to the button.
		if (button.getAttribute("setting-type") !== "cycle") {
			subMenu.classList.add("open");
			button.classList.add("active");
		}
	}

	// Get the next option of a setting, looping back to the first option if the current option is the last option.
	// Do not sort the options array.
	/**
	 * @method #getNextOption (private) - Get the next option of a setting, looping back to the first option if the current option is the last option.
	 * @param {string} setting - The name of the setting to get the next option of.
	 * @param {string} currentOption - The current option of the setting.
	 * @returns {object} - An object containing the next option's name and option object.
	 */
	#getNextOption(setting, currentOption = "") {
		var settingOptions = this.#settings[setting].o; // get the options of the setting.
		var currentOption = currentOption === "" ? this.getSetting(setting) : currentOption; // if no current option is provided, use the current setting value.
		var settingOptionsArray = []; // create an array to store the options in.
		for (var option in settingOptions) { // loop through the options.
			settingOptionsArray.push(option); // add the option to the array.
		}
		
		var currentOptionIndex = settingOptionsArray.indexOf(currentOption); // get the index of the current option.
		if (currentOptionIndex === -1) { // if the current option is not in the array, try to JSON.stringify the current option and see if that is in the array.
			currentOptionIndex = settingOptionsArray.indexOf(JSON.stringify(currentOption));
		}
		
		if (currentOptionIndex === settingOptionsArray.length-1) { // if the current option is the last option, loop back to the first option.
			return {
				n: settingOptionsArray[0], // Option name
				o: settingOptions[0] // Option value
			};
		} else { // if the current option is not the last option, get the next option.
			return {
				n: settingOptionsArray[currentOptionIndex + 1], // Option name
				o: settingOptions[currentOptionIndex + 1] // Option value
			};
		}
	}

	// Alias for getnextOption.
	/**
	 * @method next - Get the next option of a setting, looping back to the first option if the current option is the last option.
	 * @param {string} setting - The name of the setting to get the next option of.
	 * @param {string} currentOption - The current option of the setting.
	 * @returns {object} - An object containing the next option's name and option object.
	 */
	next(setting, currentOption = "") { return this.#getNextOption(setting, currentOption); }

	/* Public Getter and Setter functions */

		// Get the whole settings object.
		/**
		 * @method getSettings - Get the whole settings object.
		 * @returns {object} - The settings object.
		 */
		getSettings() { return this.#settings; }
	
		// Get the setting's value.
		/**
		 * @method getSetting - Get the setting's value.
		 * @param {string} setting - The name of the setting to get the value of.
		 * @returns {string} - The value of the setting.
		 */
		getSetting(setting) {
			try {
				var value = localStorage.getItem(setting);
				if(value === null) {
					return this.#settings[setting].v;
				} else {
					return value;
				}
			} catch(e) {
				console.log(e);
				return null;
			}
		}

		// Get the setting's object.
		/**
		 * @method getSettingObject - Get the setting's object.
		 * @param {string} setting - The name of the setting to get the object of.
		 * @returns {object} - The object of the setting.
		 */
		getSettingObject(setting) {
			return this.#settings[setting];
		}

		// Get the whole default settings object.
		/**
		 * @method getDefaultSettings - Get the whole default settings object.
		 * @returns {object} - The default settings object.
		 */
		getDefaults() { return this.#defaults; }

		// Get the setting's default value.
		/**
		 * @method getDefaultSetting - Get the setting's default value.
		 * @param {string} setting - The name of the setting to get the default value of.
		 * @returns {string} - The default value of the setting.
		 */
		getDefault(setting) {
			return this.#defaults[setting].v;
		}

		// Get the setting's default object.
		/**
		 * @method getDefaultObject - Get the setting's default object.
		 * @param {string} setting - The name of the setting to get the default object of.
		 * @returns {object} - The default object of the setting.
		 */
		getDefaultObject(setting) {
			return this.#defaults[setting];
		}

		// Aliases for getSetting, getSettingObject, getDefault and getDefaultObject
		get(setting) { return this.getSetting(setting); }
		getObject = this.getSettingObject;
		_get(setting) { return this.getDefault(setting); }
		_getObject(setting) { return this.getDefaultObject(setting); }

		// Set the setting's value to the given value.
		// The function is executed with the setting's name and the setting's value as arguments.
		// If the setting's options object matching the given value has a "f" property, the function should execute the setting's function passing the args argument as argument.
		// If the args argument is not given, the function should execute the setting's function using executeSetting without passing any arguments.
		// The setting should only be set if it matches one of the setting's options.
		// If the setting is successfully set, the function "updateDOM" should be executed with the setting's name, value and error status as arguments.
		/**
		 * @method setSetting - Set the setting's value to the given value.
		 * @param {string} setting - The name of the setting to set the value of.
		 * @param {Object} args - The arguments to pass to the setting's function.
		 * @param {string} args.v - The value to set the setting to.
		 */
		setSetting(setting, args = {v: undefined}) {
			var settingOptions = this.#settings[setting].o; // get the options of the setting.

			try {
				if (settingOptions[args.v] !== undefined) { // if the value is in the options object, set the setting.
					try { // try to set the setting.
						if (settingOptions[args.v].f !== undefined) { // if the setting has a function, execute the function.
							(async ()=>{
								await this.executeSetting(setting, {value: args.v, args: args});
								localStorage.setItem(setting, args.v);
							})();
						} else { // if the setting has no function, set the setting.
							try {
								localStorage.setItem(setting, args.v);
								this.updateDOM(setting, args.v, false);
							} catch(e) {
								console.error(e);
								throw "Could not set the setting '" + setting + "' to '" + args.v + "'.\n Error: " + e;
							}
						}
					} catch(e) {
						console.error(e);
						throw "Could not set the setting '" + setting + "' to '" + args.v + "'.\n Error: " + e;
					} 
				} else { // if the value is not in the options object, throw an error.
					throw "The value '" + args.v + "' is not in the options of the setting '" + setting + "'.";
				}
			} catch(e) {
				console.error(e);
				this.updateDOM(setting, args.v, true);
			}

					// localStorage.setItem(setting, args.v);
					// this.executeSetting(setting, {value: args.v, args: args});
					// return true;
				// } catch(e) {
				// 	console.log(e);
				// 	this.updateDOM(setting, args.v, true);
				// 	return false;
				// }
			// } else {
			// 	this.updateDOM(setting, args.v, true);
			// 	return false;
			// }
		}

		// Alias for setSetting
		set(setting, args) { return this.setSetting(setting, args); }
}