// utility function: check if a character is alphanumeric 
const isalnum = (char) => /^[a-zA-Z0-9]$/.test(char);

// first step of compilers/interpreters, turning the
// input stream into an array of tokens, smallest unit
// in the code

// Tokenization/Lexing example for LISP syntax
// (add (mul 2 3) 1)
// Lexer output:
// ['(', 'add', '(', 'mul', '2', '3', ')', '1', ')']

const tokenize = (src) => {
    const tokens = [];

    for (let i = 0; i < src.length; ) {
        if (src[i] == "(" || src[i] == ")") tokens.push(src[i++]);
        else if (src[i] == " ") {
            ++i;
            continue;
        } else if (isalnum(src[i])) {
            let tokenBuffer = "";
            while (isalnum(src[i]) && i < src.length) tokenBuffer += src[i++];
            tokens.push(tokenBuffer);
        } else {
            console.error(`tokenizer: invalid character ${src[i]}`);
            return undefined;
        }
    }

    return tokens;
};

// the second step of compilers/interpretrrs is the parser
// which is responsible for generating an Abstract Syntax Tree (AST),
// A tree of the operations done by the code
// the ast is made up of a root node, which is a list of other nodes,
// in a typical lisp syntax, we don't need to care about operator precedence (e.g multiplication before addition)
// but that needs to be handled in more advanced syntaxes in the parser

// in this exact implementation, each node is an object with this
// structure: {command: "command name, e.g add", operands: [{},{},{}]}
// this is an example AST from the code (add (mul 2 3) 1), after lexing

/*
[ // root node, for each statement
    { // add command
        command: "add",
        operands: [
            { // mul commands, "child" of add command
                command: "mul",
                operands: [
                    2, 3
                ]
            },
            1
        ]
    }
]
*/

const gen_ast = (tokens, tokenIdx = 0) => {
    const parse = () => {
        if (tokens[tokenIdx] === "(") {
            tokenIdx++;
            const command = tokens[tokenIdx++];
            const operands = [];
            while (tokens[tokenIdx] !== ")" && tokenIdx < tokens.length)
                operands.push(parse());
            if (tokenIdx >= tokens.length) {
                console.error("parser: unclosed parenthasis");
                return false;
            }
            tokenIdx++;
            return { command, operands };
        } else if (tokens[tokenIdx] === ")") {
            console.error("parser: extra closing parenthasis");
            return false;
        } else {
            const token = tokens[tokenIdx++];
            return isNaN(token) ? token : Number(token);
        }
    };

    const ast = [];
    while (tokenIdx < tokens.length) {
        const result = parse();
        if (result === false) return undefined;
        ast.push(result);
    }
    return ast;
};

// this is a function which evaluates a node recursively,
// recursion is used to support nested operations like the example above,
// e.g in (add (mul 2 3) 1), the first step is executing the root statement (the add node)
// (note: each node returns a value after evaluation)
// using recursion, before rethrning the value of add, it evaluates the (mul 2 3) and 1 nodes,
// and adding the results together, that's how the add command works

// if we visualize the steps of the evaluation, this is how it will look
// (add (mul 2 3) 1)
// (add 6 1)
// 7

const eval_command = (cmd) => {
    if (typeof cmd !== "object") return cmd;
    switch (cmd.command) {
        case "add":
            return (
                eval_command(cmd.operands[0]) + eval_command(cmd.operands[1])
            );
        case "mul":
            return (
                eval_command(cmd.operands[0]) * eval_command(cmd.operands[1])
            );
        case "sub":
            return (
                eval_command(cmd.operands[0]) - eval_command(cmd.operands[1])
            );
        case "div":
            return (
                eval_command(cmd.operands[0]) / eval_command(cmd.operands[1])
            );
        case "print":
            console.log(eval_command(cmd.operands[0]));
            return undefined;
        default:
            console.error(`evaluator: invalid command ${cmd.command}`);
    }
};

console.log("JSLisp");

// simple repl shell
while (true) {
    const line = prompt("%");
    const tokens = tokenize(line);
    if (!tokens) continue;

    const ast_root = gen_ast(tokens);
    if (!ast_root) continue;

    console.log(JSON.stringify(ast_root, null, 4));
    ast_root.forEach((statement) => console.log(eval_command(statement)));
}
