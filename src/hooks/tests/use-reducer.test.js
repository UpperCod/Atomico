import { expect } from "@esm-bundle/chai";
import { createHooks } from "../create-hooks.js";
import { useReducer } from "../hooks.js";

describe("src/hooks/use-state", () => {
    it("initialState", () => {
        let hooks = createHooks();
        let initialState = {};
        let reducer = (state, action) => {};

        hooks.load(() => {
            let [state] = useReducer(reducer, initialState);
            expect(state).to.equal(initialState);
        });
    });
    it("Update from reducer", () => {
        let render = () => {};
        let hooks = createHooks(render, null);
        let initialState = {};
        let refAction = { nextState: [] };
        let reducer = (state, action) => {
            expect(action).to.equal(refAction);
            return action.nextState;
        };

        hooks.load(() => {
            let [, dispatch] = useReducer(reducer, initialState);
            dispatch(refAction);
        });

        hooks.load(() => {
            let [state] = useReducer(reducer, initialState);
            expect(state).to.equal(refAction.nextState);
        });
    });
});
