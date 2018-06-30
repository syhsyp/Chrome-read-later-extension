chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.request == "tabInfo") {
            sendResponse({url: sender.tab.url, title: sender.tab.title, iconUrl: sender.tab.favIconUrl});
        }
        if (message.request == "re-direct") {
            if (!message.ctrlpressed) {
                chrome.tabs.update({url: message.url});
            } else {
                chrome.tabs.create({url: message.url, active:false});
            }
        }
    });
    