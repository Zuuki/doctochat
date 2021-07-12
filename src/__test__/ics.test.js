import { bot_answer, GenerateIcs } from "../Bot";
import {init_tree} from "../decision_tree";

it('should receive a message that we have our calendar', () => {
    init_tree()
    const icsMessage = bot_answer("1")
    expect(icsMessage).toContain("Voici votre fichier ics contenant vos rendez-vous")
})

it('should download the calendar', () => {
    const calendar = {
        click: jest.fn()
    };
    jest.spyOn(document, "createElement").mockImplementation(() => calendar)

    GenerateIcs(["rdv docto 1", "rdv docto 2"], ["202201151430", "202201160915"])

    expect(calendar.download).toEqual("doctolibrdv.ics");
    expect(calendar.click).toHaveBeenCalledTimes(1);
})