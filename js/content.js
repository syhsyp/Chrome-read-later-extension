"use strict";
var storage = chrome.storage.sync;

function updateUI() {
    chrome.runtime.sendMessage({request: "tabInfo"}, function(response) {
        // load indicator icon
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
        // load sidebar UI
        loadList();
      });
    
};

function compressTitle(input) {
    input = input.replace(/\.(?=[^ |.])/g, '. ');
    if (input.length >= 21) {
        return input.substring(0, 20);
    } else {
        return input;
    }
}

function loadList() {
    storage.get(null, function(tabs) {
        var keys = Object.keys(tabs);
        // var temp = [];
        // for (var i = 0; i < keys.length; i++) {
        //     temp[i] = JSON.stringify(tabs[keys[i]]);
        // }
        // console.log(temp);
        // console.log(_.sortBy(temp, "time"));

        $('.read-later-list').empty();
        for (var i = 0; i < keys.length; i++) {
            var tab = JSON.parse(tabs[keys[i]]);
            $('.read-later-list').append("<li class=\"eachWeb\" title=\""+ tab.title +"\"><a herf=\"" + tab.url + 
            "\"><p><img src="+ tab.iconUrl +"> " + compressTitle(tab.title) + "<button class=\"deleteWeb\" value=\"" + 
            tab.url + "\">DELETE</button></p></a></li>" );
        }
        $('.eachWeb').click(function(event) {
            let currentUrl = $(event.target).parent().attr('herf');
            var ctrlpressed = (event.ctrlKey || event.metaKey);
            chrome.runtime.sendMessage({request: "re-direct", url: currentUrl, ctrlpressed});
        });
        $('.deleteWeb').click(function(event) {
            let currentUrl = $(event.target).attr('value');
            removeUrl(currentUrl);
        });
        $('.eachWeb').hover(function(event) {
            $(event.target).find('button').css('display', 'inline-block');
        }, function(event) {
            hideElement('.deleteWeb');
        });
    });
}

function addToList(tabUrl, tabTitle, tabIconUrl) {
    var d = new Date();
    var currentTab = {
        "url":tabUrl,
        "title": tabTitle,
        "iconUrl": tabIconUrl,
    };
    currentTab["time"] = d.getTime();
    var value = JSON.stringify(currentTab);
    storage.set({[tabUrl]: value});
}

function removeUrl(url) {
    // storage.get([url], function(result) {
    //     $('.reverseDelete').attr("value", JSON.stringify(result[Object.keys(result)[0]]));
    //     console.log(JSON.parse(result[Object.keys(result)[0]])[url]);
    // });
    storage.remove([url]);
    //console.log($(".reverseDelete").);
    //let info = JSON.parse($(".reverseDelete").attr("value").url);
    //console.log(info);
}

function showElement(id) {
    $(id).css('display', 'inline-block');
}

function hideElement(id) {
    $(id).css('display', 'none');
}

function initialUI() {
    //$('head').append("<link rel=\"stylesheet\" href=\"js/jquery-ui.css\" />");
    $('body').append("<div id='extension-markbar'></div>");
    //<button class=\"reverseDelete\">REDO</button>
    $('body').append("<div id='extension-sidebar'><ul class=\"read-later-list\"></ul></div>");
    $('body').append("<div id='extension-indicator'></div>");
    // $('.reverseDelete').click(function() {
    //     let result = $('.reverseDelete').attr('value');
    //     if(result) {
    //         var info = JSON.parse(result);
    //         //console.log(info);
    //         //addToList(info.url, info.title, info.iconUrl)
    //     }
    //     $('.reverseDelete').removeAttr("value");
    // });

    // General UI setting
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
    
    // $('#extension-sidebar').hover(function(event) {
    //     clearTimeout(setSidebar);
    // }, function(event) {
    //     setSidebar = setTimeout(function() {
    //         hideElement('#extension-sidebar');
    //     }, 2000);
    // });
    
    $('body').click(function(e) {
        if (!$(e.target).is('#extension-sidebar') && !$(e.target).is('#extension-readIcon') 
                && !$(e.target).is('#extension-markbar') && !$(e.target).is('button')) {
            hideElement('#extension-sidebar');
        }
    });
}

// update UI when there is any change to the database
chrome.storage.onChanged.addListener(function() {
    updateUI();
})

// General UI loading
$(document).ready(function() {
    var path = chrome.extension.getURL('css/jquery-ui.css');
    $('head').append($('<link>')
    .attr("rel","stylesheet")
    .attr("type","text/css")
    .attr("href", path));
    initialUI();
    updateUI();
});
