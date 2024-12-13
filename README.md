# Novel Constructor

## Description
Novel Constructor is a simple tool for creating text-based novels with flexible branching paths based on user choices. Readers can select their next steps by pressing choice buttons.

## Installation
1. Clone the repository.
2. Use Live Server or a similar tool to host the project locally.

## Usage
1. **Constructor Page**:
   - Modify the saved data in local storage and save it as a file. The JSON file itself is not directly modified.
   - Create chapters, steps, and define button paths.
   - View all data for chapters, steps, and path configurations.
2. **Debugging Page**:
   - Debug the novel using data from the JSON file or local storage.
   - Navigate through steps sequentially or jump to a specific step using the selector. 
   - You can see statistics and logs for debugging purposes, and you able to reset it using "Reset Progress" button.
   - If the local data works as intended, save it to a JSON file by clicking the "Download constructed JSON file of your Novel" button in the Constructor, and then place it into the repository in one step.
   - If the local data behaves unexpectedly, perform a hard reset by clicking the "Reset to origin JSON data" button to restore data from the file.

## License
Please refrain from distributing this project until its full release.

## Roadmap
- Add a dedicated novel-reading page for users, free from debugging elements.
- Enable the addition of images to steps.
- Implement editing functionality for steps and choice paths.

