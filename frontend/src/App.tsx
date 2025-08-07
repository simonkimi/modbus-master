import { createSignal } from 'solid-js';
import logo from './assets/images/logo-universal.png';
import './App.css';
import { Greet } from "../wailsjs/go/main/App";

function App() {
    const [resultText, setResultText] = createSignal("Please enter your name below 👇");
    const [name, setName] = createSignal('');
    const updateName = (e: any) => setName(e.target.value);

    function greet() {
        Greet(name()).then(result => setResultText(result));
    }

    return (
        <div id="App">
            <img src={logo} id="logo" alt="logo"/>
            <div id="result" class="result">{resultText()}</div>
            <div id="input" class="input-box">
                <input id="name" class="input" onInput={updateName} autocomplete="off" name="input" type="text"/>
                <button class="btn" onClick={greet}>Greet</button>
            </div>
        </div>
    )
}

export default App
