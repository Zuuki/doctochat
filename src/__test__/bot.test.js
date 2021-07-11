import React from 'react';
import ReactDOM from 'react-dom';
import ChatRoom from '../App';

import {render, cleanup, screen} from "@testing-library/react"
import "@testing-library/jest-dom"

import renderer from 'react-test-renderer';
import App from "../App";
import { bot_answer } from "../Bot";
import { tree_answer, init_tree } from "../decision_tree";


afterEach(cleanup)

it("Should renders without crashing", ()=>{
    const div = document.createElement("div");
    ReactDOM.render(<ChatRoom></ChatRoom>, div)
})

it('Should render the title of the ChatBot', () => {
    render(<App />);
    const linkElement = screen.getByText("Chat Bot");
    expect(linkElement).toBeInTheDocument();
});

it('Should matches snapshot', ()=>{
    const tree = renderer.create(<ChatRoom></ChatRoom>).toJSON();
    expect(tree).toMatchSnapshot();
});

it('should make a research on doctolib s website', () => {
    init_tree()
    bot_answer("diag")
    tree_answer("crac")
    const diagnostic = bot_answer("oui")
    expect(diagnostic).toContain("Veuillez entrer la ville où vous souhaitez chercher un rendez-vous")
    const city = bot_answer("vitry")
    expect(city).toContain("https://www.doctolib.fr/urgences/vitry")
})

it('should refuse the first diagnotic and make a new one', () => {
    init_tree()
    bot_answer("diag")
    tree_answer("crac")
    const newDiag = bot_answer("non")
    expect(newDiag).toContain("Si vous voulez effectuer un autre diagnostic, écrivez diagnostic")
    const newSymptoms = bot_answer("diagnostic")
    expect(newSymptoms).toContain("Quels sont vos symptômes ?")
    bot_answer("Migraine")
    const newAdvice = bot_answer("fievre")
    expect(newAdvice).toContain("Vous avez probablement le problème: Grippe")
    expect(newAdvice).toContain("Médecin Généraliste")
})