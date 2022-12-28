// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const tabs = await chrome.tabs.query({
  // url: [
  //   "https://developer.chrome.com/docs/webstore/*",
  //   "https://developer.chrome.com/docs/extensions/*",
  // ],
});

//console.log(tabs);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title; //.split("-")[0].trim();
  const pathname = new URL(tab.url).pathname; //.slice("/docs".length);

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector("ul").append(...elements);

const button = document.querySelector("button");
button.addEventListener("click", async () => {
  if(!confirm('Close duplicate tabs?')) return;
  
  var dupesFound = 0;
  var urls = [], tabsToClose = []; //cleanUrlList = [];
  chrome.tabs.query({currentWindow: true}, function(tabs){

    tabs.forEach(function(tab){
      if(~urls.indexOf(cleanUrl(tab.url))){
        tabsToClose.push(tab.id);
        dupesFound++;
      }else{
        urls.push(cleanUrl(tab.url));
      }
    });

    document.querySelector("ul").prepend(dupesFound + " dupes closed");

    // const group = chrome.tabs.group({ tabsToClose });
    // chrome.tabGroups.update(group, {title: "DUPES", color: "red" });

    console.log(tabsToClose);
    chrome.tabs.remove(tabsToClose);
  });

  // const tabIds = tabs.map(({ id }) => id);
  // const group = await chrome.tabs.group({ tabIds });
  // await chrome.tabGroups.update(group, { title: "DOCS" });
});

function cleanUrl(urlToClean) {
  var cleanURL = urlToClean.split("#")[0].trim();
  cleanURL = urlToClean.split("?")[0].trim();
  return cleanURL;
}

// chrome.browserAction.onClicked.addListener(function(tab){
//   if(!confirm('Close duplicate tabs?')) return;
//   var urls = [], tabsToClose = [];
//   chrome.tabs.query({currentWindow: true}, function(tabs){
//     tabs.reverse().forEach(function(tab){
//       if(~urls.indexOf(tab.url)){
//         tabsToClose.push(tab.id);
//       }else{
//         urls.push(tab.url);
//       }
//     });
//     chrome.tabs.remove(tabsToClose);
//   });
// });
