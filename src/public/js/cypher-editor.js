import CodeMirror from 'codemirror';
import '../../../node_modules/codemirror/lib/codemirror.css';
import '../../../node_modules/codemirror/theme/darcula.css';
import '../../../node_modules/codemirror/theme/neo.css';
import '../codemirror.less';
import 'codemirror/mode/cypher/cypher';

const THEME = 'neo';
// noinspection JSUnusedLocalSymbols
const THEME_DARK = 'darcula';
export const initializeCypherEditor = (domEl) => {
  CodeMirror.fromTextArea(domEl, {
    mode: 'application/x-cypher-query',
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    matchBrackets: true,
    autofocus: true,
    theme: THEME,
  });
};

// TODO: Add extended antlr cypher support
/*
const antlr4 = require('antlr4/index');
const MyGrammarLexer = require('../../../dist/CypherLexer').CypherLexer;
const MyGrammarParser = require('../../../dist/CypherParser').CypherParser;

class ErrorListener {
  syntaxError(recognizer, symbol, line, column, message, payload) {
    console.error(line, column, message);
    // throw new SyntaxGenericError({line, column, message});
  }
}


class Visitor {
  visitChildren(ctx) {
    if (!ctx) {
      return;
    }

    if (ctx.children) {
      return ctx.children.map(child => {
        if (child.children && (child.children.length !== 0)) {
          const res = child.accept(this);
          // console.log(res);
          return res;
        } else {
          const res = child.getText();
          console.log('r', res);
          return res;
        }
      });
    }
  }
}

const listener = new ErrorListener();
export const parseQuery = (input) => {
  var chars = new antlr4.InputStream(input);
  var lexer = new MyGrammarLexer(chars);
  var tokens = new antlr4.CommonTokenStream(lexer);
  var parser = new MyGrammarParser(tokens);
  parser.removeErrorListeners(); // Remove default ConsoleErrorListener
  parser.addErrorListener(listener); // Add custom error listener

  parser.buildParseTrees = true;
  var tree = parser.oC_Cypher();
  tree.accept(new Visitor());
};
*/
