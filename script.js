var md = document.getElementById("md");
var mdd = document.getElementById("mdd");
var ht = document.getElementById("ht");
var infos = document.getElementById("infos");

async function markedIniAndRender() { // add source pos tags for headings to marked.js
   await import(chrome.runtime.getURL("marked.min.js"));

   // this stores original tokenizer stuff which can be called. Otherwise, rules are not initialized.
   var origlexer = new marked.Lexer({ ...marked.defaults, tokenizer: new marked.Tokenizer() });

   const tokenizer = {
      heading(src) { // add source position tag
         var res = origlexer.tokenizer.heading(src);
         if (res) res.charno = md.value.length - src.length;
         return res;
      },
      paragraph(src) { // add source position tag
         var res = origlexer.tokenizer.paragraph(src);
         if (res) res.charno = md.value.length - src.length;
         return res;
      },
   };
   marked.use({ tokenizer });

   const walkTokens = (token) => {
      if (token.charno) { // append charno tag token!
         var ct = { type: 'html', text: '<div hidden class="tag" data-charno=' + token.charno + '></div>' };
         if (token.tokens) { token.tokens.push(ct); } else { token.tokens = [ct]; }
      }
   };
   marked.use({ walkTokens });

   renderit();
}

function renderit() {
   ht.innerHTML = marked(md.value);
}

function updateht() {
   if (typeof marked !== "function") { // dynamically load marked
      markedIniAndRender();
   } else
      renderit();
};

function updatemd(s) {
   md.value = s;
   updateht();
};

function toggleEditor(showonly = false) {
   if (!showonly && !mdd.classList.contains("hidden")) { // close editor, save
      localStorage.setItem('notes', md.value);
      localStorage.setItem('notes-html', ht.innerHTML);
      mdd.classList.add("hidden")
      infos.classList.add("hidden")
   } else { // edit
      mdd.classList.remove("hidden")
      md.focus();
      infos.classList.remove("hidden")
   }
};

// startup: load saved or README.md
var iniht = localStorage.getItem('notes-html');
var inimd = localStorage.getItem('notes');
if (iniht != null && inimd != null) {
   md.value = inimd;
   ht.innerHTML = iniht;
} else {
   var url = chrome.runtime.getURL("README.md");
   fetch(url).then((response) => response.text().then((text) => updatemd(text)));
}

mdd.onkeyup = () => { // update html on edit
   updateht();
};

ht.ondblclick = function (e) { // double click: find source position
   var curr = e.target || e.srcElement;
   toggleEditor(true);
   var pos = 0;
   while (curr) {
      if (curr.className === 'tag') { pos = curr.dataset.charno }
      else if (child = curr.querySelector('.tag')) pos = child.dataset.charno;
      if (pos) {
         break;
      }
      next = curr.nextElementSibling; // code tag node is after clicked node
      if (next) { curr = next } else { curr = curr.parentNode }; // or go up?
   }
   md.focus();
   md.setSelectionRange(pos, pos);
   md.blur();
   md.focus();
};

window.onstorage = (event) => { // Inter Tab Synchronization
   if (event.key === "notes") md.value = event.newValue
   else if (event.key === "notes-html") ht.innerHTML = event.newValue;
};

// Key Events
document.onkeydown = (event) => {
   if (event.code === 'Tab') { // Change Tab to Spaces
      event.preventDefault();
      const spaces = '  ';
      document.execCommand('insertText', false, spaces);
   } else if (event.code === 'Escape') { // toggle editor
      toggleEditor();
   } else if ((event.metaKey || event.ctrlKey) && event.key === 's') { // backup
      event.preventDefault();
      var elem = window.document.createElement('a');
      elem.download = "chrome-newtabmarkdown-backup-" + new Date().toISOString() + ".md";
      elem.href = window.URL.createObjectURL(new Blob([md.value], { type: "text/plain" }));
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
   }
};
