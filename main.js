const isalnum = (char) => /^[a-zA-Z0-9]$/.test(char);

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

while (true) {
    const line = prompt("%");
    const tokens = tokenize(line);
    if (!tokens) continue;

    const ast_root = gen_ast(tokens);
    if (!ast_root) continue;

    console.log(JSON.stringify(ast_root, null, 4));
    ast_root.forEach((statement) => console.log(eval_command(statement)));
}
