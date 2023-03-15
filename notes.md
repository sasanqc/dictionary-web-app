//timing===============================
inital setup and desktop version (HTML and CSS) : 10-17
responsive tablet and mobile : 11-13
theme toggling and system preference: 2 hour
custome select: 1 hour
api and final works: 6 hours
//===========================================

```javascript
onst getPreferredThemeFromOS = () => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

// when the prefers-color-scheme changes, this event will be emitted
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
    event.matches ? toggleBtn.click() : toggleBtn.click();});
```
