"use strict";
var storage = chrome.storage.sync;

function updateData() {
    chrome.runtime.sendMessage({request: "tabInfo"}, function(response) {
        var tabUrl = response.url;
        var tabTitle = response.title;
        var tabIconUrl = response.iconUrl;
        storage.get([tabUrl], function(items) {
            $('#extension-markbar').empty();
            if (JSON.stringify(items) != "{}") {
                var readIcon = "img/marked.png";
            } else {
                readIcon = "img/unmarked.png";
            }
            readIcon = chrome.runtime.getURL(readIcon);
            $('#extension-readIcon').off("click");
            $('#extension-markbar').append("<img id=\"extension-readIcon\" src="+ readIcon + " alt=\"readIcon\">");
            if (JSON.stringify(items) != "{}") {
                $('#extension-readIcon').click(function() {
                    removeUrl(tabUrl);
                });
            } else {
                $('#extension-readIcon').click(function() {
                    addToList(tabUrl, tabTitle, tabIconUrl);
                });
            }
        });
        loadList();
      });
    
};

function loadList() {
    storage.get(null, function(tabs) {
        var keys = Object.keys(tabs);
        $('#read-later-list').empty();
        for (var i = 0; i < keys.length; i++) {
            var tab = JSON.parse(tabs[keys[i]])
            $('#read-later-list').append("<li class=\"eachWeb\"><a herf=\"" + tab.url + 
            "\"><img src="+ tab.iconUrl +">" + tab.title + "<button class=\"deleteWeb\" value=\"" + 
            tab.url + "\">DELETE</button></a></li>" );
            let index = i + 1;
        }
        $('.eachWeb').click(function(event) {
            let currentUrl = $(event.target).attr('herf');
            chrome.runtime.sendMessage({request: "re-direct", url: currentUrl});
        });
        $('.deleteWeb').click(function(event) {
            let currentUrl = $(event.target).attr('value');
            removeUrl(currentUrl);
        });
        $('.eachWeb').hover(function(event) {
            $(event.target).find('button').css('display', 'inline-block');
        }, function(event) {
            $('.deleteWeb').css('display', 'none');
        });
        console.log(tabs);
    });
}

function addToList(tabUrl, tabTitle, tabIconUrl) {
    var currentTab = {
        "url":tabUrl,
        "title": tabTitle,
        "iconUrl": tabIconUrl
    };
    var value = JSON.stringify(currentTab);
    storage.set({[tabUrl]: value});
}

function removeUrl(url) {
    storage.remove([url]);
}

function showElement(id) {
    $(id).css('display', 'inline-block');
}

function hideElement(id) {
    $(id).css('display', 'none');
}

function initialUI() {
    $('body').append("<div id=extension-markbar></div>");
    $('body').append("<div id=extension-sidebar><ul id=\"read-later-list\"></ul></div>");
    $('body').append("<div id='extension-indicator'></div>");

    // General UI setting for sidebar
    var setMarkbar;
    var setSidebar;
    $('#extension-indicator').hover(function() {
        showElement('#extension-markbar');
        clearTimeout(setMarkbar);
    });
    
    $('#extension-markbar').hover(function(event) {
        clearTimeout(setMarkbar);
    }, function(event) {
        setMarkbar = setTimeout(function() {
            hideElement('#extension-markbar');
        }, 100);
    });
    
    $("#extension-markbar").click(function(e) {
        if (!$(e.target).is('#extension-readIcon')) {
            hideElement('#extension-markbar');
            showElement('#extension-sidebar');
        }
    });
    
    $('#extension-sidebar').hover(function(event) {
        clearTimeout(setSidebar);
    }, function(event) {
        setSidebar = setTimeout(function() {
            hideElement('#extension-sidebar');
        }, 2000);
    });
    
    $('body').click(function(e) {
        if (!$(e.target).is('#extension-sidebar') && !$(e.target).is('#extension-readIcon') 
                && !$(e.target).is('#extension-markbar') && !$(e.target).is('button')) {
            hideElement('#extension-sidebar');
        }
    });
}

// General UI loading
initialUI();
updateData();

chrome.storage.onChanged.addListener(function() {
    updateData();
})