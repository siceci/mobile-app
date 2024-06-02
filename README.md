# MyTask

## Purpose
This is a mobile application serves as a simple task management system with calendar, enabling users to create, manage, and synchronize tasks across multiple devices. It offers an intuitive interface for managing daily tasks with functionalities such as adding, deleting, and updating tasks, along with offline support and synchronization capabilities.

## Features

- **Task Management**: Add, delete, and update tasks.
- **Offline Support**: Able to add tasks even when offline; changes sync back when online.
- **Data Synchronization**: Sync tasks across devices using a secure authentication system.
- **Task Storage**: Local storage of tasks with immediate retrieval and storage capabilities.
- **User Authentication**: Secure login and logout functionalities.
- **Real-time Updates**: Utilize network status to optimize data synchronization.

## How to Contribute
Since this is a private project, all developers interested in contributing must first obtain permission from the project owner.

## Dependencies and Installation

This application is developed using `create-expo-app` and relies on the following major libraries:

- `React Native`: For building the user interface.
- `@react-native-async-storage/async-storage`: For persistent data storage.
- `@react-native-community/netinfo`: To check network connection status.
- `moment-timezone`: For handling dates and time zones.

To install these dependencies, run:

```bash
npm i @react-native-async-storage/async-storage @react-native-community/netinfo
npm install moment-timezone
```

## Application Architecture

The application employs the following architecture:

- **Components**: Reusable visual elements within the app.
- **Screens**: User interfaces for specific functionalities such as SignIn, SignUp, About, Calendar, and Settings.
- **Context**: Uses React Context to manage global states like font size.
- **Navigation**: Implements navigation between different screens using `expo-router`.
- **Task Storage Management**: Manages the logic for storing, retrieving, and syncing tasks.

## Reporting Issues
If you encounter any problems while using the website, or have any feedback, please feel free to post in the GitHub Issues section of this project.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
