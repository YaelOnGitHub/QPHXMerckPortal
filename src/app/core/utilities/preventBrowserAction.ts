export class preventBrowserAction {

    static preventBackAction() {
        setTimeout(() => {
            window.history.forward();
        }, 0);
        window.onunload = function () { null };
    }
}