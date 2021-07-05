import { tree_answer, init_tree } from './decision_tree.js';

var context = {
    "mode": "default"
}

export function bot_answer(text)
{
    if (context.mode === "default")
    {
        // Try to change context.mode
        if (text === "diag" || text === "diagnostic")
        {
            context.mode = "diagnostic"
            return init_tree()
        }
        
        if (text === "test")
        {
            return "works";
        }
        return "not test";
    }
    else if (context.mode === "diagnostic")
    {
        return tree_answer(text)
    }
    else
    {
        return "Undefined mode, read the doc please 🤓"
    }
}