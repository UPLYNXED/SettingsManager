# SettingsManager
This is a simple front-end settings manager written in pure Javascript.

It was originally developed to improve the functionality of my settings implementation for my [valk.cam](https://valk.cam) project.
However, this settings manager has since spun out into its own project and is now also going to be maintained in this repository as a standalone project.

Be aware of the following when viewing or considering this codebase:
- This project is in a very early stage of development and is not yet ready for production use.
- I am not as proficient with Javascript as I would like to be, this project is a step to that direction I hope.


## Features
- A simple front-end settings manager written in pure Javascript.
- Automatically handles localStorage saving and loading of settings. (Planning to add support for cookies, sessionStorage & non-persistent storage in the future)
- Generates a simple HTML interface for your settings (Planning to add templating support in the future).
- Easily define your settings, their values, options and types in a JS object (settings-list.js).
- Handles settings validation based on a match with provided options.
- Keeps a copy with the original settings in memory in case it is needed.
- Currently provides 2 types of setting UI per specified setting:
  - **`submenu`** (or dropdown) - displays a *button* with a *dropdown menu* with the options specified in the settings-list.js file.
  - **`cycle`** (or toggle) - displays a multi-state toggle *button* with the options specified in the settings-list.js file.


## Usage
- Import the settings-list.js file into your project.
- Create a new instance of the SettingsManager class.
- Pass the settings-list.js `settingsList` object to the SettingsManager constructor.
- Done.

- To set a setting's value, call the `setSetting` method with the setting name and the value you want to set.
- To get a setting's value, call the `getSetting` method with the setting name.
- To get a setting's object, call the `getSettingObject` method with the setting name.
- To get the entire settings object, call the `getSettings` method.


## TODO / Planned Features
- Add support for cookies, sessionStorage & non-persistent storage.
- Add support for templating for the settings UI.
- Add more settings types:
  - Options based:
    - Range inputs (min/max)
    - Range Slider (min/max)
    - Slider (min/max)
    - Select (multiple)
    - Checkbox (multiple)
    - Radio (choice)
  - Input based:
    - Text input (validation function)
    - Textarea (validation function)
    - File (upload function)
    - Colorpicker (validation function)
    - Datetimepicker (validation function)
  - Other:
    - Custom (custom function)
- Add option to set error logging level for the console (error, warning, info, debug, off).
- Add option to log errors to a file with a server-side logging system.
- Add support for toggleable settings sections to show and hide multiple settings at once in the settings UI (e.g. "Graphics Settings" and "UI Settings").
- Add default styling CSS for the settings UI.
- Add default templates for the settings UI for a few different css libraries like Bootstrap, Materialize, etc.


## License
This code is licensed under the MIT license.


## Contributing
- If you have any questions or comments, please open an issue or open a pull request on the [Github repository](https://github.com/UPLYNXED/SettingsManager) for the project.
- If you would like to contribute to the project, please reach out to me via an issue or DM me on [Twitter (@UPLYNXED).](https://twitter.com/UPLYNXED).