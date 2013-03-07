Hierarchical Card Board
=======================

## Overview
This is a hierarchical portfolio item view that was created during the 2012 Raleigh Hackathon.

This Rakefile can be used to create both a file for local debug and for deployment to a Rally dashboard. You must have Ruby 1.9 and the rake gem installed.

Available tasks are:

    rake debug                              # Build a debug version of the app, useful for local development. 
    rake build                              # Build a deployable app which includes all JavaScript and CSS resources inline. Use after you app is working as you intend so that it can be copied into Rally.
    rake clean                              # Clean all generated output
    rake jslint                             # Run jslint on all JavaScript files used by this app
    rake deploy                             # Deploy the app to a Rally server
    rake deploy:debug                       # Deploy the debug app to a Rally server
    rake deploy:info                        # Display deployment information
    
You can find more information on installing Ruby and using rake tasks to simplify app development here: https://rally1.rallydev.com/apps/2.0p3/doc/#!/guide/appsdk_20_starter_kit

To launch chrome with cross-origin checks and file access checks disabled, on windows it will look something like:

    %LOCALAPPDATA%\Google\Chrome\Application\chrome.exe --disable-web-security --allow-file-access-from-files --allow-cross-origin-auth-prompt

On mac:

    cd /Applications
    open Google\ Chrome.app --args --disable-web-security --allow-file-access-from-files --allow-cross-origin-auth-prompt
    
## Screenshot
![Split pane with tree of Portfolio Items on left and a Card Board on the right of the currently selected PI's children.](https://raw.github.com/RallyCommunity/HierarchicalCardBoard/master/Hierarchical_Card_Board_Screenshot.png)


## License

AppTemplate is released under the MIT license.  See the file [LICENSE](https://raw.github.com/RallyApps/AppTemplate/master/LICENSE) for the full text.
