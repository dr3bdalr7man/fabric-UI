# The Fabric Web App
[Installing](#Installing)|[Todos](#Todos)|[Collaborators](#Collaborators)

This is a web app for Fabric. It was built using [Svelte](https://svelte.dev/), [SkeletonUI](https://skeleton.dev/), and [Mdsvex](https://mdsvex.pngwn.io/). 

The goal of this app is to not only provide a user interface for Fabric, but also a out-of-the-box website for those who want to get started with web development, blogging, or to just have a web interface for fabric. You can use this app as a GUI interface for Fabric, a ready to go blog-site, or a website template for your own projects. 

![Preview](/fabric-png.png)

## Installing

The app can be run by navigating to the `web` directory and using `npm install`, `pnpm install`, or your preferred package manager. Then simply run `npm run dev`, `pnpm run dev`, or your equivalent command to start the app. *You will need to run fabric in a separate terminal with the `fabric --serve` command.*

## Electron UI

This application also includes a Windows 11-style Electron UI. To access it, run the application and click the "Electron UI" button on the main page.

The Electron UI has three tabs:

*   **Patterns**: This tab allows you to browse and search for patterns. When you select a pattern, you can enter input and see the output.
*   **Settings**: This tab allows you to configure the application, including the API endpoint and model.
*   **History**: This tab shows a history of the patterns you have run, including the input and output.

## Tips

When creating new posts make sure to include a date, description, tags, and aliases. Only a date is needed to display a note.

You can include images, tags to other articles, code blocks, and more all within your markdown files. 

### If you choose to use Obsidian along side ths app

You can design and order your vault however you like, though a `posts` folder should be kept in your vault to house any articles you'd like to post.
