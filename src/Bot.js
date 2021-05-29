export function bot_answer(text) {
    if (text == "test") {
        return "works";
    }
    return "not test";
}

export function start(messages) {
    messages.push({
        text: "",
        whom: "sent"
    });
}