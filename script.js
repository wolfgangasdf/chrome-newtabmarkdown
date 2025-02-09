var md = document.getElementById("md");
var mdd = document.getElementById("mdd");
var ht = document.getElementById("ht");
var infos = document.getElementById("infos");

async function markedIniAndRender() { // add source pos tags for headings to marked.js
   await import(chrome.runtime.getURL("marked.min.js"));

   // this stores original tokenizer stuff which can be called. Otherwise, rules are not initialized.
   var origlexer = new marked.Lexer({ ...marked.defaults, tokenizer: new marked.Tokenizer() });

   const tokenizer = { // add source position tag
      heading(src) { 
         var res = origlexer.tokenizer.heading(src);
         if (res) {
            res.tokens = this.lexer.inline(res.text);
            res.charno = md.value.length - src.length;
            return res;
         }
      },
      paragraph(src) {
         var res = origlexer.tokenizer.paragraph(src);
         if (res) {
            res.tokens = this.lexer.inline(res.text);
            res.charno = md.value.length - src.length;
            return res;
         }
      },
   };
   marked.use({ tokenizer });

   const walkTokens = (token) => {
      if (token.charno) { // append charno!
         var ct = { type: 'html', text: '<div hidden class="tag" data-charno=' + token.charno + '></div>' };
         if (token.tokens) { token.tokens.push(ct); } else { token.tokens = [ct]; }
      }
   };
   marked.use({ walkTokens });

   renderit();
}

function renderit() {
   ht.innerHTML = marked.parse(md.value);
}

function updateht() {
   if (typeof marked === "undefined") { // dynamically load marked
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

ht.addEventListener('click', function (e) {
   if (e.detail === 3) { // triple click
      var curr = e.target;
      var pos = 0;
      if ( !(curr != ht && ht.contains(curr)) ) { // not a child of ht clicked? find closest element!
         mindy = 1e10;
         curr = null;
         for (child of ht.children) {
            dy = Math.abs(e.clientY - (child.getBoundingClientRect().top + child.getBoundingClientRect().height / 2))
            if (mindy > dy) {
               mindy = dy;
               curr = child;
            }
         }
      }
      if (curr) {
         while (curr) {
            if (curr.className === 'tag') { 
               pos = curr.dataset.charno;
               break;
            } else if (child = curr.querySelector('.tag')) {
               pos = child.dataset.charno;
               break;
            }
            curr = curr.nextElementSibling || curr.parentNode; // try next node or go up
         }
      }
      toggleEditor(true);
      md.focus();
      md.setSelectionRange(pos, pos);
      md.blur();
      md.focus();
   }
});

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
      elem.download = "chrome-newtabmarkdown-backup-" + new Date().toISOString() + (event.shiftKey ? ".html" : ".md");
      elem.href = window.URL.createObjectURL(new Blob([event.shiftKey ? document.documentElement.outerHTML : md.value], { type: (event.shiftKey ? "text/html" : "text/plain") }));
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
   }
};
