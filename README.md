# Youtube-Playlist-Analyzer

The code provided is a node.js application that scrapes data from a YouTube playlist using Puppeteer, a Node library that provides a high-level API to control headless Chrome or Chromium. The data is then stored in an excel file using the xlsx package, which allows reading and writing of Excel files.

The application accepts a command-line argument for the desired name of the output file, and then launches a headless browser to open the specified YouTube playlist. The code then extracts the name of the playlist, the number of videos, and the number of views of the playlist using Puppeteer's API.

After that, the code determines the number of videos in one page of the playlist, and then starts scrolling down the page using Puppeteer until it has scrolled to the bottom of the playlist.

Next, the code extracts the details of each video in the playlist, including the video title, video link, channel title, and channel link, and stores them in an array. Finally, the data is written to an excel file with the specified name using the xlsx package.

The code includes several functions to accomplish this task, including getData() to extract the name, number of videos, and number of views of the playlist, vidsInOnePage() to determine the number of videos in one page of the playlist, goToBottom() to scroll to the bottom of the playlist, vidDetail() to extract the details of each video in the playlist, excelReader() to read from an excel file, and excelWriter() to write to an excel file.

The code is designed to be run from the command line and accepts one argument - the desired name of the output file. The resulting data is saved in an excel file with the specified name.
