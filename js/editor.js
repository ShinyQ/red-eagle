// xiki-inspired editor
var B = {
    history: []
};
B.line = {
    first: function(editor){
    	return editor.getRange({line:0,ch:0},{line:0});
    },
    current: function(editor, offset) {
        var dot = editor.getCursor();
        offset = offset || 0;
        return editor.getRange({line:dot.line+offset, ch:0},
            {line:dot.line+offset});
    },
    indent: function(editor, offset) {
        return B.line.current(editor, offset)
            .match("^( *)")[1];
    }
};

B.splice = function(editor, text) {
    var line = editor.getCursor().line;
    editor.setCursor({line:line});
    editor.replaceSelection(text);
    editor.setCursor({line:line});
    return editor;
};
B.kill_line = function(editor, offset) {
    var dot = editor.getCursor();
    var original = {line:dot.line, ch:dot.ch};
    dot.line += offset || 0;
    editor.replaceRange("", {line:dot.line, ch: 0}, {line:dot.line+1, ch:0});
    editor.setCursor(original);
}
B.tree = {
    has_children: function(editor){
        var my_indent = B.line.indent(editor).length;
        var next_indent = B.line.indent(editor,1).length;
        return (next_indent > my_indent);
    },
    remove_children: function(editor){
        while(B.tree.has_children(editor)) {
            B.kill_line(editor, +1);
        }
    }
};
//start with cows
B._eval = function(s){
  try {return eval(s);}
  catch(ex){
    if (ex.name !== "SyntaxError") return ex.message;
    return "| cows";
  }
};
B.fill = function(editor, indent, target){
  return "\n  " + indent + this._eval(target);
};

B.expand_or_contract = function(editor, event) {
    if (B.tree.has_children(editor)) {
        B.tree.remove_children(editor);
    } else {
	var indent = B.line.indent(editor);
	var target = B.line.current(editor);
	B.splice(editor, B.fill(editor, indent, target));
    }
    (event || {}).codemirrorIgnore=true;
};
B.empty_file = function(tag) {
	return "/*:"+(tag||"adrift")+"\n";
}
B.local_load = function(editor){
    B.tag = B.line.current(editor).trim();
    ed.setValue(localStorage[B.tag] || B.empty_file(B.tag));
};
B.get_tag = function(editor){
    return B.line.first(editor).split(":").reverse()[0].trim(); 
}
//save to localStorage. Put desired name on first line, after ':'
B.save_me = function(editor){
    B.tag = B.get_tag(editor);
    var previous = localStorage[B.tag];
    if(previous !== undefined) {
    	B.history.push(previous);
    }
    localStorage[B.tag]=editor.getValue();
    return B.tag;
}
  

var ed = CodeMirror(document.getElementById('editor'),
        { lineNumbers: true });

ed.on('dblclick', B.expand_or_contract);
ed.addKeyMap({
  "Ctrl-Enter":B.expand_or_contract,
  "Ctrl-/":B.local_load
});


var Menus = {
    hello: function(){return "Welcome to Red Eagle."},
    echo: function(args){return JSON.stringify(args)}
};

ed.setValue(localStorage.scratch || "Welcome to Red Eagle. Press Ctrl-Enter for cows.");
