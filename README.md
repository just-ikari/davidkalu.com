# davidkalu.com

A small, responsive personal blog built with HTML, CSS, and JavaScript. No framework or build step is needed.

## Preview it on your computer

1. Open this folder in VS Code.
2. Open `index.html` in a browser. For automatic refresh while editing, install the **Live Server** extension in VS Code, then right-click `index.html` and choose **Open with Live Server**.
3. Edit the page text in `index.html` and the visual design in `style.css`.

The typefaces load from Google Fonts; the page still has system-font fallbacks if you are offline.

## Publish with GitHub Pages

1. In a terminal opened in this folder, connect the project to this repository:

   ```sh
   git remote add origin https://github.com/just-ikari/davidkalu.com.git
   git add .
   git commit -m "Build the first version of davidkalu.com"
   git branch -M main
   git push -u origin main
   ```

2. On GitHub, open the repository's **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
3. The published address will appear on the Pages settings screen.
4. To use the custom domain, first buy `davidkalu.com` from a domain registrar. Add it in the Pages settings, then configure the DNS records GitHub lists with your registrar. HTTPS can be enabled after DNS is ready.

After the first push, publish updates with `git add .`, `git commit -m "Describe your change"`, and `git push`.

## Before launch

- Replace the sample article teasers with your own first post and link each title to its article.
- Update the greeting email if you prefer a different address.
- Add a photo and a short bio when you are ready.
