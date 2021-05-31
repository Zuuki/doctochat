import React from 'react';
import ReactDOM from 'react-dom';
import ChatRoom from '../App';

import {render, cleanup} from "@testing-library/react"
import "@testing-library/jest-dom"

import renderer from 'react-test-renderer';

afterEach(cleanup)

it("Should renders without crashing", ()=>{
    const div = document.createElement("div");
    ReactDOM.render(<ChatRoom></ChatRoom>, div)
})

it('Should matches snapshot', ()=>{
    const tree = renderer.create(<ChatRoom></ChatRoom>).toJSON();
    expect(tree).toMatchSnapshot();
});