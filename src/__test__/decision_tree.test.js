import { tree_answer, init_tree } from "../decision_tree";
import {cleanup} from "@testing-library/react"
import { bot_answer } from "../Bot";
afterEach(cleanup)


it('should give the right disease from symptoms (Fracture)', () => {
    init_tree()
    const diagnostic = tree_answer("os cassé")
    expect(diagnostic).toContain('Vous avez probablement le problème: Fracture')
})

it('should give the right disease from symptoms (Grippe)', () => {
    init_tree()
    tree_answer("Migraine")
    const diagnostic = tree_answer("Toux")
    expect(diagnostic).toContain('Vous avez probablement le problème: Grippe')
})

it('should give the right doctor for "Grippe" disease', () => {
    init_tree()
    tree_answer("Migraine")
    const diagnostic = tree_answer("Toux")
    expect(diagnostic).toContain("Médecin Généraliste")
})

it('should give the right disease from symptoms badly written (Probleme Ophtalmologique)', () => {
    init_tree()
    const diagnostic = tree_answer("Vie flou")
    expect(diagnostic).toContain('Vous avez probablement le problème: Problème ophtalmologique')
})

it('should give the right doctor for "Grippe" disease (symptoms badly written)', () => {
    init_tree()
    const diagnostic = tree_answer("Vie flou")
    expect(diagnostic).toContain("Ophtalmologiste")
})


