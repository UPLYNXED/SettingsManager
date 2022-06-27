/**
 * @fileoverview settings-template-manager.js - The settings template manager.
 * @author Caspar Neervoort "UPLYNXED"
 * @license MIT
 * @version 0.0.0.1
 * 
 * @note This file is far from finished, it's a mess right now while I still work out how I want to handle the templates.
 */

// UNFINISHED CODE - DO NOT USE

// This file contains configurable templates for the SettingsManager class.
// The templates are used to generate the HTML for the settings UI.
// The templates are created using a template class called SettingsTemplate.
// The templates are managaed by the SettingsTemplateManager class.

/**
 * @class SettingsTemplateManager
 * @classdesc The SettingsTemplateManager class is used to manage the templates used to generate the settings UI.
 * @note The SettingsTemplateManager class is not meant to be instantiated directly.
 * 
 * @param {SettingsManager} settingsManager - The settings manager instance that is using the templates.
 * @param {Object} templates - The templates to use for the settings UI.
 * @param {Object} templates.container - The container template to insert the settings UI into if specified, before it is inserted into the DOM.
 * @param {Object} templates.section - The section template to use for settings sections. Settings will be sorted into sections if specified on the setting's object.
 * @param {Object} templates.setting - The setting template to use for individual settings.
 * @param {Object} templates.settingButton - The button template to use for buttons for each individual setting.
 * @param {Object} templates.settingSubmenu - The submenu template to use for submenus for each individual setting.
 * @param {Object} templates.settingOption - The option template to use for each individual option in a submenu for each individual setting.
 * 
 * @example
 * // Create a new SettingsTemplateManager instance.
 * var settingsTemplateManager = new SettingsTemplateManager(settingsManager, templateList);
 */
 class SettingsTemplateManager {
	#templates = {};

	/**
	 * @constructor
	 * @param {SettingsManager} settingsManager - The settings manager instance that is using the templates.
	 * @param {Object} templates - The templates to use for the settings UI.
	 * @param {Object} templates.container - The container template to insert the settings UI into if specified, before it is inserted into the DOM.
	 * @param {Object} templates.section - The section template to use for settings sections. Settings will be sorted into sections if specified on the setting's object.
	 * @param {Object} templates.setting - The setting template to use for individual settings.
	 * @param {Object} templates.settingButton - The button template to use for buttons for each individual setting.
	 * @param {Object} templates.settingSubmenu - The submenu template to use for submenus for each individual setting.
	 * @param {Object} templates.settingOption - The option template to use for each individual option in a submenu for each individual setting.
	 * 
	 * @returns {SettingsTemplateManager} The SettingsTemplateManager instance.
	 */ 
	constructor(settingsManager, templates = {}) {
		this.settingsManager = settingsManager;
		this.#templates = templates;
		return this;
	}

	init() {
		this.#templates.container = this.#templates.container || {};
		this.#templates.section = this.#templates.section || {};
		this.#templates.setting = this.#templates.setting || {};
		this.#templates.settingButton = this.#templates.settingButton || {};
		this.#templates.settingSubmenu = this.#templates.settingSubmenu || {};
		this.#templates.settingOption = this.#templates.settingOption || {};
	}

	getTemplate(templateName) {
		return this.#templates[templateName];
	}
	
	setTemplate(templateName, template) {
		this.#templates[templateName] = template;
	}

	getTemplates() {
		return this.#templates;
	}

	setTemplates(templates) {
		this.#templates = templates;
	}

	getSettingsManager() {
		return this.settingsManager;
	}

	setSettingsManager(settingsManager) {
		this.settingsManager = settingsManager;
	}


	// TODO: Implement tagged templates for this class.
	/**
	 * @function generateHTML - Generates the HTML for an individual setting using a given template from the templatesList object.
	 * @param {Object} setting - The setting to generate the HTML for.
	 * @param {String} templateName - The name of the template to use for generating the HTML.
	 * @param {Object} [template] - The template to use for generating the HTML.
	 * 
	 * @returns {String} The HTML for the setting.
	 */
	generateHTML(setting, templateName, template = {}) {
		if (!templateName) {
			throw new Error('No template name specified.');
		}
		if (!template) {
			template = this.getTemplate(templateName);
			
			if (!template) {
				throw new Error(`No template found for ${templateName}.`);
			}
		}

		let html = '';
		let tmpl = {};
		
		if(template.properties['setting']) {
			tmpl.setting = this.settingsManager.getSetting(setting.name); // TODO: setting.name is not the correct property to use here.
		}

		if(template.properties['option']) {
			tmpl.option = this.settingsManager.getOption(setting.name, setting.option); // TODO: setting.name is not the correct property to use here. setting.option is not the correct property to use here.
		}

		html = template.html;

    }
		
		



		
}



/**
 * @class SettingsTemplate
 * @classdesc A class that represents a template for the settings UI.
 * 
 * 
 */
class SettingsTemplate {
	constructor(){}

	/**
	 * @method SettingsTemplate.getName
	 * @returns {string} The name of the template. 
	 */ 
}

var templateList = {
	container: {
		properties: [
		],
		html: `
			<div class="menu">
				${tmpl.content.content}
			</div>
		`
	},
	section: {
		html: undefined
	},
	setting: {
		html: undefined
	},
	settingButton: {
		properties: [
			"setting",
		],
		html: `
			<button class="TopButton" name="${(tmpl.setting.d.type !== 'cycle') ? setting.s + "Top" : setting.s}">
				<label>${tmpl.setting.name}</label>
				<span>${tmpl.setting.value}</span>
			</button>
		`
	},
	settingSubmenu: {
		properties: [
			"setting",
		],
		html: `
			<div class="SubMenu" id="${tmpl.setting.s}" tabindex="-1">
				${tmpl.content.options}
			</div>
		`
	},
	settingOption: {
		properties: [
			"setting",
			"option",
		],
		html: `
			<button class="SubButton" name="${tmpl.setting.s}" value="${tmpl.option.value}">
				<b>${tmpl.option.name}</b>
			</button>
		`
	}
}







	